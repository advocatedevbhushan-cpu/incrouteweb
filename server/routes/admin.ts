import { Router, Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { withPlatformConnection, withPlatformTransaction } from "../db";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import path from "path";
import fs from "fs";

export function createAdminRouter(emailTransporter: any, r2Client: S3Client | null) {
  const router = Router();

  // Protect ALL admin routes with authenticateToken and requireAdmin
  router.use(authenticateToken);
  router.use(requireAdmin);

  // Prevent browser/CDN caching on admin API responses
  router.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || "incroute-documents";
  const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";
  const DOCUMENT_FOLDERS = ["Incorporation", "GST", "Trademark", "ROC", "Legal", "Tax", "Invoices", "Other"];

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ];
      if (allowedMimes.includes(file.mimetype)) cb(null, true);
      else cb(new Error("File type not allowed. Allowed: PDF, DOC, DOCX, PNG, JPG, XLS, XLSX"));
    }
  });

  // ─── DASHBOARD STATS ───
  router.get("/stats", async (req: Request, res: Response) => {
    try {
      const data = await withPlatformConnection(async (conn) => {
        const [[clientCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `Client`");
        const [[entityCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `Entity`");
        const [[complianceCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `ComplianceTask` WHERE status NOT IN ('COMPLETED')");
        const [[ticketCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `Ticket` WHERE status IN ('OPEN','IN_PROGRESS')");
        const [[invoicePending]]: any = await conn.query("SELECT COALESCE(SUM(total),0) as amount FROM `Invoice` WHERE status IN ('PENDING','SENT','OVERDUE')");
        const [[teamCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `User` WHERE role IN ('ADMIN','TEAM_MEMBER','SUPER_ADMIN')");
        const [[taskCount]]: any = await conn.query("SELECT COUNT(*) as count FROM `Task` WHERE status NOT IN ('COMPLETED')");

        const [overdueCompliance]: any = await conn.query(
          "SELECT ct.id, ct.title, ct.dueDate, ct.assigneeId, e.name as entityName FROM `ComplianceTask` ct LEFT JOIN `Entity` e ON ct.entityId = e.id WHERE ct.status NOT IN ('COMPLETED') AND ct.dueDate < NOW() ORDER BY ct.dueDate ASC LIMIT 10"
        );

        const [recentActivity]: any = await conn.query(
          "SELECT id, type, title, details, createdAt FROM `Activity` ORDER BY createdAt DESC LIMIT 10"
        );

        return {
          stats: {
            clients: clientCount.count,
            entities: entityCount.count,
            complianceTasks: complianceCount.count,
            openTickets: ticketCount.count,
            pendingInvoices: Number(invoicePending.amount),
            teamMembers: teamCount.count,
            activeTasks: taskCount.count
          },
          overdueCompliance,
          recentActivity
        };
      });

      res.json(data);
    } catch (err: any) {
      console.error("[Admin Stats Error]:", err);
      res.status(500).json({ error: "Failed to load stats" });
    }
  });

  // ─── CLIENTS CRUD ───
  router.get("/clients", async (req: Request, res: Response) => {
    try {
      const clients = await withPlatformConnection(async (conn) => {
        const [rows]: any = await conn.query(
          `SELECT c.*, 
           (SELECT COUNT(*) FROM \`Entity\` WHERE clientId = c.id) as entityCount,
           (SELECT AVG(complianceScore) FROM \`Entity\` WHERE clientId = c.id) as avgHealth,
           u.firstName as relationshipMgrFirstName,
           u.lastName as relationshipMgrLastName,
           u.email as relationshipMgrEmail
           FROM \`Client\` c
           LEFT JOIN \`User\` u ON c.relationshipMgrId = u.id
           ORDER BY c.createdAt DESC`
        );
        return rows;
      });
      res.json({ clients });
    } catch (err: any) {
      console.error("[Admin Clients Error]:", err);
      res.status(500).json({ error: "Failed to load clients" });
    }
  });

  router.post("/clients", async (req: Request, res: Response) => {
    try {
      const { companyName, contactName, contactEmail, contactPhone, industry, notes, password, services, entityType, relationshipMgrId } = req.body;
      if (!companyName || !contactName || !contactEmail) {
        return res.status(400).json({ error: "companyName, contactName, and contactEmail are required" });
      }

      let notesJson: any = {};
      if (notes) {
        try { notesJson = JSON.parse(notes); } catch { notesJson = { text: notes }; }
      }
      if (services && Array.isArray(services) && services.length > 0) {
        notesJson.allowedServices = services;
      }
      const notesStr = Object.keys(notesJson).length > 0 ? JSON.stringify(notesJson) : null;

      const clientId = "cli_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const loginPassword = password || (crypto.randomBytes(6).toString("hex") + "!Aa1");
      const passwordHash = await bcrypt.hash(loginPassword, 12);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await withPlatformTransaction(async (conn) => {
        await conn.query(
          `INSERT INTO \`Client\` (id, companyName, contactName, contactEmail, contactPhone, industry, relationshipMgrId, notes, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
          [clientId, companyName, contactName, contactEmail, contactPhone || null, industry || null, relationshipMgrId || null, notesStr, now, now]
        );

        if (entityType) {
          const entityId = "ent_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          await conn.query(
            `INSERT INTO \`Entity\` (id, clientId, name, type, status, complianceScore, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, 'ACTIVE', 100, ?, ?)`,
            [entityId, clientId, companyName, entityType, now, now]
          );
        }

        const userId = "usr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const nameParts = contactName.split(" ");
        const firstName = nameParts[0] || contactName;
        const lastName = nameParts.slice(1).join(" ") || "";

        const [existingUser]: any = await conn.query("SELECT id FROM `User` WHERE email = ?", [contactEmail]);
        if (existingUser.length === 0) {
          await conn.query(
            `INSERT INTO \`User\` (id, email, passwordHash, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, 'CLIENT', 1, 0, ?, ?)`,
            [userId, contactEmail, passwordHash, firstName, lastName, contactPhone || null, now, now]
          );
        }

        await conn.query(
          `INSERT INTO \`Activity\` (id, clientId, userId, type, title, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          ["act_" + Date.now().toString(36), clientId, null, "client_created", `New client onboarded: ${companyName}`, now]
        );
      });

      if (emailTransporter) {
        try {
          await emailTransporter.sendMail({
            from: `"INCroute" <${process.env.SMTP_USER || "notifications@incroute.com"}>`,
            to: contactEmail,
            subject: "Welcome to INCroute — Your Business Compliance Partner 🎉",
            html: `
              <div style="font-family:'Inter',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#15131F;border-radius:16px;overflow:hidden;border:1px solid rgba(108,124,255,0.15);padding:24px;color:#F2EFFB;">
                <h2>Welcome to INCroute!</h2>
                <p>Hi <strong>${contactName}</strong>, your account for <strong>${companyName}</strong> has been created.</p>
                <div style="background:#241F38;padding:16px;border-radius:8px;margin:16px 0;">
                  <p>Email: <code>${contactEmail}</code></p>
                  <p>Password: <code>${loginPassword}</code></p>
                  <p>Portal URL: <a href="https://incroute.com/login" style="color:#6C7CFF;">https://incroute.com/login</a></p>
                </div>
              </div>
            `
          });
        } catch (e: any) {
          console.error("Failed to send welcome email:", e.message);
        }
      }

      res.json({ success: true, id: clientId, credentials: { email: contactEmail, password: loginPassword } });
    } catch (err: any) {
      console.error("[Admin Create Client Error]:", err);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  router.patch("/clients/:id", async (req: Request, res: Response) => {
    try {
      const { companyName, contactName, contactEmail, contactPhone, industry, status, notes, relationshipMgrId } = req.body;
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      if (companyName) { sets.push("companyName = ?"); vals.push(companyName); }
      if (contactName) { sets.push("contactName = ?"); vals.push(contactName); }
      if (contactEmail) { sets.push("contactEmail = ?"); vals.push(contactEmail); }
      if (contactPhone !== undefined) { sets.push("contactPhone = ?"); vals.push(contactPhone); }
      if (industry) { sets.push("industry = ?"); vals.push(industry); }
      if (status) { sets.push("status = ?"); vals.push(status); }
      if (notes !== undefined) { sets.push("notes = ?"); vals.push(notes); }
      if (relationshipMgrId !== undefined) { sets.push("relationshipMgrId = ?"); vals.push(relationshipMgrId || null); }
      vals.push(req.params.id);

      await withPlatformConnection(async (conn) => {
        await conn.query(`UPDATE \`Client\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Admin Update Client Error]:", err);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  router.delete("/clients/:id", async (req: Request, res: Response) => {
    try {
      await withPlatformConnection(async (conn) => {
        await conn.query("DELETE FROM `Client` WHERE id = ?", [req.params.id]);
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Admin Delete Client Error]:", err);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  router.get("/clients/:id", async (req: Request, res: Response) => {
    try {
      const result = await withPlatformConnection(async (conn) => {
        const [clients]: any = await conn.query("SELECT * FROM `Client` WHERE id = ?", [req.params.id]);
        if (clients.length === 0) return null;
        const [entities]: any = await conn.query("SELECT * FROM `Entity` WHERE clientId = ?", [req.params.id]);
        const [serviceRequests]: any = await conn.query("SELECT * FROM `ServiceRequest` WHERE clientId = ? ORDER BY createdAt DESC", [req.params.id]);
        const [invoices]: any = await conn.query("SELECT id, invoiceNo, total, status, dueDate FROM `Invoice` WHERE clientId = ? ORDER BY createdAt DESC LIMIT 5", [req.params.id]);
        const [tickets]: any = await conn.query("SELECT id, subject, status, createdAt FROM `Ticket` WHERE clientId = ? ORDER BY createdAt DESC LIMIT 5", [req.params.id]);

        let members: any[] = [];
        try {
          const [rows]: any = await conn.query(
            `SELECT m.*, (SELECT COUNT(*) FROM \`Document\` d WHERE d.memberId = m.id) as documentCount FROM \`Member\` m WHERE m.clientId = ? ORDER BY m.role, m.fullName`,
            [req.params.id]
          );
          members = rows;
        } catch {}

        let documents: any[] = [];
        try {
          const [rows]: any = await conn.query(
            `SELECT d.id, d.title, d.fileName, d.originalName, d.status, d.folder, d.memberId, d.createdAt,
             m.fullName as memberName
             FROM \`Document\` d LEFT JOIN \`Member\` m ON d.memberId = m.id
             WHERE d.clientId = ? ORDER BY d.createdAt DESC LIMIT 20`,
            [req.params.id]
          );
          documents = rows;
        } catch {}

        let allowedServices: string[] = [];
        if (clients[0].notes) {
          try {
            const parsed = JSON.parse(clients[0].notes);
            allowedServices = parsed.allowedServices || [];
          } catch {}
        }

        return { client: clients[0], entities, serviceRequests, invoices, tickets, members, documents, allowedServices };
      });

      if (!result) return res.status(404).json({ error: "Client not found" });
      res.json(result);
    } catch (err: any) {
      console.error("[Admin Client Detail Error]:", err);
      res.status(500).json({ error: "Failed to load client detail" });
    }
  });

  // ─── TASKS CRUD ───
  router.get("/tasks", async (req: Request, res: Response) => {
    try {
      const { status, priority, search, assigneeId, page = "1", limit = "20" } = req.query as any;
      let where = "1=1";
      const params: any[] = [];
      if (status) { where += " AND t.status = ?"; params.push(status); }
      if (priority) { where += " AND t.priority = ?"; params.push(priority); }
      if (assigneeId) { where += " AND t.assigneeId = ?"; params.push(assigneeId); }
      if (search) { where += " AND (t.title LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);

      const result = await withPlatformConnection(async (conn) => {
        const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`Task\` t LEFT JOIN \`Client\` c ON t.clientId = c.id WHERE ${where}`, params);
        const [tasks]: any = await conn.query(`SELECT t.*, c.companyName as clientName FROM \`Task\` t LEFT JOIN \`Client\` c ON t.clientId = c.id WHERE ${where} ORDER BY FIELD(t.priority,'CRITICAL','HIGH','MEDIUM','LOW'), t.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
        return { tasks, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
      });

      res.json(result);
    } catch (err: any) {
      console.error("[Admin Tasks Error]:", err);
      res.status(500).json({ error: "Failed to load tasks" });
    }
  });

  router.post("/tasks", async (req: Request, res: Response) => {
    try {
      const { title, description, clientId, assigneeId, priority, dueDate } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });
      const id = "tsk_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await withPlatformConnection(async (conn) => {
        await conn.query(
          `INSERT INTO \`Task\` (id, clientId, title, description, assigneeId, priority, status, dueDate, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
          [id, clientId || null, title, description || null, assigneeId || null, priority || "MEDIUM", dueDate || null, now, now]
        );
      });

      res.json({ success: true, id, message: "Task created" });
    } catch (err: any) {
      console.error("[Admin Create Task Error]:", err);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  router.patch("/tasks/:id", async (req: Request, res: Response) => {
    try {
      const { status, assigneeId, priority } = req.body;
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = [`updatedAt = ?`];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); if (status === "COMPLETED") { sets.push("completedAt = ?"); vals.push(now); } }
      if (assigneeId) { sets.push("assigneeId = ?"); vals.push(assigneeId); }
      if (priority) { sets.push("priority = ?"); vals.push(priority); }
      vals.push(req.params.id);

      await withPlatformConnection(async (conn) => {
        await conn.query(`UPDATE \`Task\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Admin Update Task Error]:", err);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // ─── SERVICE REQUESTS ───
  router.get("/service-requests", async (req: Request, res: Response) => {
    try {
      const { status, serviceType, search, page = "1", limit = "20" } = req.query as any;
      let where = "1=1";
      const params: any[] = [];
      if (status) { where += " AND sr.status = ?"; params.push(status); }
      if (serviceType) { where += " AND sr.serviceType = ?"; params.push(serviceType); }
      if (search) { where += " AND (sr.companyName LIKE ? OR c.companyName LIKE ? OR c.contactName LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);

      const result = await withPlatformConnection(async (conn) => {
        const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`ServiceRequest\` sr LEFT JOIN \`Client\` c ON sr.clientId = c.id WHERE ${where}`, params);
        const [requests]: any = await conn.query(`SELECT sr.*, c.companyName as clientName, c.contactName, c.contactEmail FROM \`ServiceRequest\` sr LEFT JOIN \`Client\` c ON sr.clientId = c.id WHERE ${where} ORDER BY sr.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
        return { requests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
      });

      res.json(result);
    } catch (err: any) {
      console.error("[Admin Service Requests Error]:", err);
      res.status(500).json({ error: "Failed to load service requests" });
    }
  });

  router.post("/service-requests", async (req: Request, res: Response) => {
    try {
      const { clientId, serviceType, companyName, notes, expectedDate } = req.body;
      if (!clientId || !serviceType) return res.status(400).json({ error: "clientId and serviceType are required" });
      const id = "sr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await withPlatformConnection(async (conn) => {
        await conn.query(
          `INSERT INTO \`ServiceRequest\` (id, clientId, serviceType, status, companyName, notes, expectedDate, createdAt, updatedAt)
           VALUES (?, ?, ?, 'IN_PROGRESS', ?, ?, ?, ?, ?)`,
          [id, clientId, serviceType, companyName || null, notes || null, expectedDate || null, now, now]
        );
        await conn.query(
          "INSERT INTO `Activity` (id, clientId, type, title, createdAt) VALUES (?, ?, ?, ?, ?)",
          ["act_" + Date.now().toString(36), clientId, "service_added", `Service ${serviceType.replace(/_/g, " ")} added`, now]
        );
      });

      res.json({ success: true, id });
    } catch (err: any) {
      console.error("[Admin Create Service Request Error]:", err);
      res.status(500).json({ error: "Failed to create service request" });
    }
  });

  router.patch("/service-requests/:id", async (req: Request, res: Response) => {
    try {
      const { status, progress, notes } = req.body;
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); if (status === "COMPLETED") { sets.push("completedAt = ?"); vals.push(now); } }
      if (progress !== undefined) { sets.push("progress = ?"); vals.push(progress); }
      if (notes) { sets.push("notes = ?"); vals.push(notes); }
      vals.push(req.params.id);

      await withPlatformConnection(async (conn) => {
        await conn.query(`UPDATE \`ServiceRequest\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Admin Update Service Request Error]:", err);
      res.status(500).json({ error: "Failed to update service request" });
    }
  });

  router.delete("/service-requests/:id", async (req: Request, res: Response) => {
    try {
      await withPlatformConnection(async (conn) => {
        await conn.query("DELETE FROM `ServiceRequest` WHERE id = ?", [req.params.id]);
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Admin Delete Service Request Error]:", err);
      res.status(500).json({ error: "Failed to delete service request" });
    }
  });

  // ─── COMPLIANCE CRUD ───
  router.get("/compliance", async (req: Request, res: Response) => {
    try {
      const { status, category, priority, search, page = "1", limit = "20" } = req.query as any;
      let where = "1=1";
      const params: any[] = [];
      if (status) { where += " AND ct.status = ?"; params.push(status); }
      if (category) { where += " AND ct.category = ?"; params.push(category); }
      if (priority) { where += " AND ct.priority = ?"; params.push(priority); }
      if (search) { where += " AND (ct.title LIKE ? OR e.name LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);

      const result = await withPlatformConnection(async (conn) => {
        const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`ComplianceTask\` ct LEFT JOIN \`Entity\` e ON ct.entityId = e.id LEFT JOIN \`Client\` c ON e.clientId = c.id WHERE ${where}`, params);
        const [tasks]: any = await conn.query(
          `SELECT ct.*, e.name as entityName, e.type as entityType, c.companyName as clientName
           FROM \`ComplianceTask\` ct LEFT JOIN \`Entity\` e ON ct.entityId = e.id LEFT JOIN \`Client\` c ON e.clientId = c.id
           WHERE ${where} ORDER BY ct.dueDate ASC LIMIT ? OFFSET ?`,
          [...params, Number(limit), offset]
        );
        const [[stats]]: any = await conn.query(
          "SELECT COUNT(CASE WHEN status='PENDING' THEN 1 END) as pending, COUNT(CASE WHEN status='IN_PROGRESS' THEN 1 END) as inProgress, COUNT(CASE WHEN status='OVERDUE' OR (status NOT IN ('COMPLETED') AND dueDate < NOW()) THEN 1 END) as overdue, COUNT(CASE WHEN status='COMPLETED' THEN 1 END) as completed FROM `ComplianceTask`"
        );
        return { tasks, total, page: Number(page), pages: Math.ceil(total / Number(limit)), stats };
      });

      res.json(result);
    } catch (err: any) {
      console.error("[Admin Compliance Error]:", err);
      res.status(500).json({ error: "Failed to load compliance tasks" });
    }
  });

  router.post("/compliance", async (req: Request, res: Response) => {
    try {
      const { entityId, title, category, dueDate, priority, assigneeId, notes } = req.body;
      if (!entityId || !title || !category || !dueDate) {
        return res.status(400).json({ error: "entityId, title, category, and dueDate are required" });
      }
      const id = "comp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await withPlatformConnection(async (conn) => {
        await conn.query(
          `INSERT INTO \`ComplianceTask\` (id, entityId, title, category, dueDate, priority, status, assigneeId, notes, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)`,
          [id, entityId, title, category, dueDate, priority || "MEDIUM", assigneeId || null, notes || null, now, now]
        );
      });

      res.json({ success: true, id });
    } catch (err: any) {
      console.error("[Admin Create Compliance Error]:", err);
      res.status(500).json({ error: "Failed to create compliance task" });
    }
  });

  router.patch("/compliance/:id", async (req: Request, res: Response) => {
    try {
      const { status, assigneeId, priority } = req.body;
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = [`updatedAt = ?`];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); if (status === "COMPLETED") { sets.push("completedAt = ?"); vals.push(now); } }
      if (assigneeId) { sets.push("assigneeId = ?"); vals.push(assigneeId); }
      if (priority) { sets.push("priority = ?"); vals.push(priority); }
      vals.push(req.params.id);

      await withPlatformConnection(async (conn) => {
        await conn.query(`UPDATE \`ComplianceTask\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Admin Update Compliance Error]:", err);
      res.status(500).json({ error: "Failed to update compliance task" });
    }
  });

  // ─── INVOICES ───
  router.get("/invoices", async (req: Request, res: Response) => {
    try {
      const { status, search, page = "1", limit = "15" } = req.query as any;
      let where = "1=1";
      const params: any[] = [];
      if (status && status !== "ALL") { where += " AND i.status = ?"; params.push(status); }
      if (search) { where += " AND (i.invoiceNo LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);

      const result = await withPlatformConnection(async (conn) => {
        const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`Invoice\` i LEFT JOIN \`Client\` c ON i.clientId = c.id WHERE ${where}`, params);
        const [invoices]: any = await conn.query(`SELECT i.*, c.companyName as clientName FROM \`Invoice\` i LEFT JOIN \`Client\` c ON i.clientId = c.id WHERE ${where} ORDER BY i.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
        const [[totals]]: any = await conn.query(
          "SELECT COALESCE(SUM(total),0) as totalRev, COALESCE(SUM(CASE WHEN status IN ('PENDING','SENT','OVERDUE') THEN total ELSE 0 END),0) as outstanding, COALESCE(SUM(CASE WHEN status='PAID' AND MONTH(paidAt)=MONTH(NOW()) THEN total ELSE 0 END),0) as paidThisMonth, COALESCE(SUM(CASE WHEN status='OVERDUE' THEN total ELSE 0 END),0) as overdue FROM `Invoice`"
        );
        return {
          invoices,
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          totals: { totalRevenue: Number(totals.totalRev), outstanding: Number(totals.outstanding), paidThisMonth: Number(totals.paidThisMonth), overdue: Number(totals.overdue) }
        };
      });

      res.json(result);
    } catch (err: any) {
      console.error("[Admin Invoices Error]:", err);
      res.status(500).json({ error: "Failed to load invoices" });
    }
  });

  router.post("/invoices/create", async (req: Request, res: Response) => {
    try {
      const { clientId, lineItems, notes, dueDate, bankDetails, gstRate } = req.body;
      if (!clientId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0 || !dueDate) {
        return res.status(400).json({ error: "clientId, lineItems (array), and dueDate are required" });
      }

      let subtotal = 0;
      const processedItems = lineItems.map((item: any, idx: number) => {
        const qty = Number(item.quantity) || 1;
        const rate = Number(item.rate) || 0;
        const amount = qty * rate;
        subtotal += amount;
        return { sno: idx + 1, description: item.description || "", hsn: item.hsn || "", quantity: qty, rate, amount };
      });
      const taxRate = Number(gstRate) || 18;
      const taxAmount = Math.round(subtotal * taxRate / 100);
      const total = subtotal + taxAmount;

      const id = "inv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const invoiceNo = "INV-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const invoiceData = JSON.stringify({ items: processedItems, notes: notes || "", bankDetails: bankDetails || "", gstRate: taxRate });

      await withPlatformConnection(async (conn) => {
        await conn.query(
          `INSERT INTO \`Invoice\` (id, clientId, invoiceNo, amount, tax, total, status, dueDate, description, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)`,
          [id, clientId, invoiceNo, subtotal, taxAmount, total, dueDate, invoiceData, now, now]
        );
      });

      res.json({ success: true, id, invoiceNo, subtotal, tax: taxAmount, total });
    } catch (err: any) {
      console.error("[Admin Create Invoice Error]:", err);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  router.patch("/invoices/:id", async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?", "status = ?"];
      const vals: any[] = [now, status];
      if (status === "PAID") { sets.push("paidAt = ?"); vals.push(now); }
      vals.push(req.params.id);

      await withPlatformConnection(async (conn) => {
        await conn.query(`UPDATE \`Invoice\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Admin Update Invoice Error]:", err);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  // ─── MEMBERS CRUD ───
  router.get("/members", async (req: Request, res: Response) => {
    try {
      const { clientId, entityId, role } = req.query as any;
      let where = "1=1";
      const params: any[] = [];
      if (clientId) { where += " AND m.clientId = ?"; params.push(clientId); }
      if (entityId) { where += " AND m.entityId = ?"; params.push(entityId); }
      if (role) { where += " AND m.role = ?"; params.push(role); }

      const members = await withPlatformConnection(async (conn) => {
        const [rows]: any = await conn.query(
          `SELECT m.*, c.companyName as clientName, e.name as entityName,
           (SELECT COUNT(*) FROM \`Document\` d WHERE d.memberId = m.id) as documentCount
           FROM \`Member\` m 
           LEFT JOIN \`Client\` c ON m.clientId = c.id 
           LEFT JOIN \`Entity\` e ON m.entityId = e.id 
           WHERE ${where} ORDER BY m.createdAt DESC`,
          params
        );
        return rows;
      });

      res.json({ members });
    } catch (err: any) {
      console.error("[Admin Members Error]:", err);
      res.status(500).json({ error: "Failed to load members" });
    }
  });

  router.post("/members", async (req: Request, res: Response) => {
    try {
      const { clientId, entityId, fullName, role, email, phone, pan, aadhaar, din, dpin, address, isResident, shareholding } = req.body;
      if (!clientId || !fullName || !role) return res.status(400).json({ error: "clientId, fullName, and role are required" });
      const id = "mem_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await withPlatformConnection(async (conn) => {
        await conn.query(
          `INSERT INTO \`Member\` (id, clientId, entityId, fullName, role, email, phone, pan, aadhaar, din, dpin, address, isResident, shareholding, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
          [id, clientId, entityId || null, fullName, role, email || null, phone || null, pan || null, aadhaar || null, din || null, dpin || null, address || null, isResident !== false ? 1 : 0, shareholding || null, now, now]
        );
      });

      res.json({ success: true, id, fullName, role });
    } catch (err: any) {
      console.error("[Admin Create Member Error]:", err);
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  router.delete("/members/:id", async (req: Request, res: Response) => {
    try {
      await withPlatformConnection(async (conn) => {
        await conn.query("DELETE FROM `Member` WHERE id = ?", [req.params.id]);
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Admin Delete Member Error]:", err);
      res.status(500).json({ error: "Failed to delete member" });
    }
  });

  // ─── TICKETS CRUD ───
  router.get("/tickets", async (req: Request, res: Response) => {
    try {
      const { status, priority, search, page = "1", limit = "15" } = req.query as any;
      let where = "1=1";
      const params: any[] = [];
      if (status && status !== "ALL") { where += " AND t.status = ?"; params.push(status); }
      if (priority && priority !== "ALL") { where += " AND t.priority = ?"; params.push(priority); }
      if (search) { where += " AND (t.subject LIKE ? OR c.companyName LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
      const offset = (Number(page) - 1) * Number(limit);

      const result = await withPlatformConnection(async (conn) => {
        const [[{ total }]]: any = await conn.query(`SELECT COUNT(*) as total FROM \`Ticket\` t LEFT JOIN \`Client\` c ON t.clientId = c.id WHERE ${where}`, params);
        const [tickets]: any = await conn.query(`SELECT t.*, c.companyName as clientName FROM \`Ticket\` t LEFT JOIN \`Client\` c ON t.clientId = c.id WHERE ${where} ORDER BY FIELD(t.priority,'CRITICAL','HIGH','MEDIUM','LOW'), t.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
        return { tickets, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
      });

      res.json(result);
    } catch (err: any) {
      console.error("[Admin Tickets Error]:", err);
      res.status(500).json({ error: "Failed to load tickets" });
    }
  });

  router.patch("/tickets/:id", async (req: Request, res: Response) => {
    try {
      const { status, assigneeId } = req.body;
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const sets: string[] = ["updatedAt = ?"];
      const vals: any[] = [now];
      if (status) { sets.push("status = ?"); vals.push(status); if (status === "RESOLVED" || status === "CLOSED") { sets.push("resolvedAt = ?"); vals.push(now); } }
      if (assigneeId) { sets.push("assigneeId = ?"); vals.push(assigneeId); }
      vals.push(req.params.id);

      await withPlatformConnection(async (conn) => {
        await conn.query(`UPDATE \`Ticket\` SET ${sets.join(", ")} WHERE id = ?`, vals);
      });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Admin Update Ticket Error]:", err);
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  // ─── TEAM MANAGEMENT ───
  router.get("/team", async (req: Request, res: Response) => {
    try {
      const team = await withPlatformConnection(async (conn) => {
        const [users]: any = await conn.query("SELECT id, email, firstName, lastName, role, phone, isActive, createdAt FROM `User` WHERE role IN ('SUPER_ADMIN','ADMIN','TEAM_MEMBER') ORDER BY createdAt");
        const workload: any[] = [];
        for (const member of users) {
          const [[taskCount]]: any = await conn.query("SELECT COUNT(*) as c FROM `Task` WHERE assigneeId = ? AND status NOT IN ('COMPLETED')", [member.id]);
          const [[compCount]]: any = await conn.query("SELECT COUNT(*) as c FROM `ComplianceTask` WHERE assigneeId = ? AND status NOT IN ('COMPLETED')", [member.id]);
          const [[clientCount]]: any = await conn.query("SELECT COUNT(*) as c FROM `Client` WHERE relationshipMgrId = ?", [member.id]);
          workload.push({ ...member, activeTasks: (taskCount.c || 0) + (compCount.c || 0), clients: clientCount.c || 0 });
        }
        return workload;
      });

      res.json({ team });
    } catch (err: any) {
      console.error("[Admin Team Error]:", err);
      res.status(500).json({ error: "Failed to load team" });
    }
  });

  // ─── AUDIT LOG ───
  router.get("/audit-log", async (req: Request, res: Response) => {
    try {
      const logs = await withPlatformConnection(async (conn) => {
        const [rows]: any = await conn.query("SELECT a.*, u.email as userEmail FROM `AuditLog` a LEFT JOIN `User` u ON a.userId = u.id ORDER BY a.createdAt DESC LIMIT 50");
        return rows;
      });
      res.json({ logs });
    } catch (err: any) {
      console.error("[Admin Audit Log Error]:", err);
      res.status(500).json({ error: "Failed to load audit logs" });
    }
  });

  return router;
}
