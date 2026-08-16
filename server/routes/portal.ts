import { Router, Request, Response } from "express";
import { withPlatformConnection } from "../db";
import { authenticateToken } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export function createPortalRouter(r2Client: S3Client | null) {
  const router = Router();

  router.use(authenticateToken);

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
  });

  // Helper to get client ID for the logged in user
  async function getClientIdForUser(conn: any, userId: string): Promise<string | null> {
    const [users]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [userId]);
    if (!users[0]) return null;
    const [clients]: any = await conn.query("SELECT id FROM `Client` WHERE contactEmail = ?", [users[0].email]);
    return clients[0]?.id || null;
  }

  // Portal Dashboard
  router.get("/dashboard", async (req: Request, res: Response) => {
    try {
      const data = await withPlatformConnection(async (conn) => {
        const [users]: any = await conn.query("SELECT id, firstName, lastName, email, role FROM `User` WHERE id = ?", [req.user!.userId]);
        if (users.length === 0) return null;
        const user = users[0];

        const [entities]: any = await conn.query("SELECT COUNT(*) as count FROM `Entity` e JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ?", [user.email]);
        const [compliance]: any = await conn.query("SELECT COUNT(*) as count FROM `ComplianceTask` ct JOIN `Entity` e ON ct.entityId = e.id JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ? AND ct.status != 'COMPLETED'", [user.email]);
        const [docs]: any = await conn.query("SELECT COUNT(*) as count FROM `Document` d JOIN `Client` c ON d.clientId = c.id WHERE c.contactEmail = ?", [user.email]);
        const [tickets]: any = await conn.query("SELECT COUNT(*) as count FROM `Ticket` t JOIN `Client` c ON t.clientId = c.id WHERE c.contactEmail = ? AND t.status IN ('OPEN','IN_PROGRESS')", [user.email]);
        const [recentCompliance]: any = await conn.query("SELECT ct.title, ct.dueDate, ct.status, ct.assigneeId, e.name as entityName FROM `ComplianceTask` ct JOIN `Entity` e ON ct.entityId = e.id JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ? AND ct.status != 'COMPLETED' ORDER BY ct.dueDate ASC LIMIT 5", [user.email]);
        const [activities]: any = await conn.query("SELECT a.title, a.type, a.createdAt FROM `Activity` a JOIN `Client` c ON a.clientId = c.id WHERE c.contactEmail = ? ORDER BY a.createdAt DESC LIMIT 5", [user.email]);
        const [entityList]: any = await conn.query("SELECT e.id, e.name, e.type, e.status FROM `Entity` e JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ?", [user.email]);

        let complianceToShow = recentCompliance;
        if (recentCompliance.length === 0) {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const entityName = entityList.length > 0 ? entityList[0].name : "Your Company";
          complianceToShow = [
            { title: "DIR-3 KYC (Annual Director Verification)", dueDate: new Date(currentYear, 8, 30).toISOString(), status: currentMonth > 8 ? "OVERDUE" : "PENDING", entityName },
            { title: "GST Return - GSTR 1", dueDate: new Date(currentYear, currentMonth, 11).toISOString(), status: now.getDate() > 11 ? "OVERDUE" : "PENDING", entityName },
            { title: "GST Return - GSTR 3B", dueDate: new Date(currentYear, currentMonth, 20).toISOString(), status: now.getDate() > 20 ? "OVERDUE" : "PENDING", entityName },
            { title: "TDS Payment (Monthly)", dueDate: new Date(currentYear, currentMonth + 1, 7).toISOString(), status: "PENDING", entityName },
            { title: "Board Meeting (Quarterly)", dueDate: new Date(currentYear, Math.ceil((currentMonth + 1) / 3) * 3, 15).toISOString(), status: "PENDING", entityName },
          ];
        }

        return {
          user: { firstName: user.firstName, lastName: user.lastName, email: user.email },
          metrics: { entities: entities[0].count, compliance: compliance[0].count || complianceToShow.length, documents: docs[0].count, openTickets: tickets[0].count },
          recentCompliance: complianceToShow,
          recentActivity: activities,
          entities: entityList
        };
      });

      if (!data) return res.status(404).json({ error: "User not found" });
      res.json(data);
    } catch (err: any) {
      console.error("[Portal Dashboard Error]:", err);
      res.status(500).json({ error: "Failed to load dashboard" });
    }
  });

  // Portal Entities
  router.get("/entities", async (req: Request, res: Response) => {
    try {
      const entities = await withPlatformConnection(async (conn) => {
        const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [req.user!.userId]);
        const [rows]: any = await conn.query("SELECT e.* FROM `Entity` e JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ?", [user[0]?.email]);
        return rows;
      });
      res.json({ entities });
    } catch (err: any) {
      console.error("[Portal Entities Error]:", err);
      res.status(500).json({ error: "Failed to load entities" });
    }
  });

  // Portal Compliance
  router.get("/compliance", async (req: Request, res: Response) => {
    try {
      const tasks = await withPlatformConnection(async (conn) => {
        const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [req.user!.userId]);
        const [rows]: any = await conn.query("SELECT ct.*, e.name as entityName FROM `ComplianceTask` ct JOIN `Entity` e ON ct.entityId = e.id JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ? ORDER BY ct.dueDate ASC", [user[0]?.email]);
        return rows;
      });
      res.json({ tasks });
    } catch (err: any) {
      console.error("[Portal Compliance Error]:", err);
      res.status(500).json({ error: "Failed to load compliance tasks" });
    }
  });

  // Portal Documents
  router.get("/documents", async (req: Request, res: Response) => {
    try {
      const documents = await withPlatformConnection(async (conn) => {
        const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [req.user!.userId]);
        const [rows]: any = await conn.query("SELECT d.* FROM `Document` d JOIN `Client` c ON d.clientId = c.id WHERE c.contactEmail = ? ORDER BY d.createdAt DESC", [user[0]?.email]);
        return rows;
      });
      res.json({ documents });
    } catch (err: any) {
      console.error("[Portal Documents Error]:", err);
      res.status(500).json({ error: "Failed to load documents" });
    }
  });

  // Portal Document Upload
  router.post("/documents/upload", upload.single("file"), async (req: any, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file provided" });
      const { title, category, folder, memberId } = req.body;
      if (!title || !category) return res.status(400).json({ error: "Title and category are required" });

      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const result = await withPlatformConnection(async (conn) => {
        const clientId = await getClientIdForUser(conn, req.user!.userId);
        if (!clientId) return { status: 404, error: "Client account not found" };

        const storageKey = `clients/${clientId}/${category}/${Date.now()}${fileExt}`;
        let publicUrl = "";
        let storageProvider = "local";

        if (r2Client) {
          try {
            await r2Client.send(new PutObjectCommand({
              Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || "incroute-documents",
              Key: storageKey,
              Body: file.buffer,
              ContentType: file.mimetype,
            }));
            storageProvider = "r2";
            if (process.env.CLOUDFLARE_R2_PUBLIC_URL) {
              publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${storageKey}`;
            }
          } catch (r2Err: any) {
            console.error("R2 upload error, saving locally:", r2Err.message);
            const localFilePath = path.join(process.cwd(), "uploads", storageKey.replace(/^clients\//, ""));
            fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
            fs.writeFileSync(localFilePath, file.buffer);
            publicUrl = `/uploads/${storageKey.replace(/^clients\//, "")}`;
          }
        } else {
          const localFilePath = path.join(process.cwd(), "uploads", storageKey.replace(/^clients\//, ""));
          fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
          fs.writeFileSync(localFilePath, file.buffer);
          publicUrl = `/uploads/${storageKey.replace(/^clients\//, "")}`;
        }

        const docId = "doc_" + Date.now().toString(36) + crypto.randomBytes(4).toString("hex");
        const now = new Date().toISOString().slice(0, 23).replace("T", " ");

        await conn.query(
          `INSERT INTO \`Document\` (id, clientId, memberId, title, category, folder, fileName, originalName, mimeType, size, storageKey, storageProvider, publicUrl, status, uploadedBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
          [docId, clientId, memberId || null, title, category, folder || category, file.originalname, file.originalname, file.mimetype, file.size, storageKey, storageProvider, publicUrl, req.user!.userId, now, now]
        );

        return { status: 200, docId };
      });

      if ("error" in result) return res.status(result.status).json({ error: result.error });
      res.json({ success: true, id: result.docId, message: "Document uploaded successfully" });
    } catch (err: any) {
      console.error("[Portal Upload Error]:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Portal Allowed Services
  router.get("/allowed-services", async (req: Request, res: Response) => {
    try {
      const services = await withPlatformConnection(async (conn) => {
        const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [req.user!.userId]);
        if (!user[0]) return [];

        const [clients]: any = await conn.query("SELECT notes FROM `Client` WHERE contactEmail = ?", [user[0].email]);
        let allowed: string[] = [];

        if (clients[0]?.notes) {
          try {
            const parsed = JSON.parse(clients[0].notes);
            if (Array.isArray(parsed.allowedServices)) allowed = parsed.allowedServices;
          } catch {}
        }

        if (allowed.length === 0) {
          const [entities]: any = await conn.query(
            "SELECT DISTINCT e.type FROM `Entity` e JOIN `Client` c ON e.clientId = c.id WHERE c.contactEmail = ?",
            [user[0].email]
          );
          allowed = entities.map((e: any) => e.type);
        }

        return allowed;
      });

      res.json({ services });
    } catch (err: any) {
      console.error("[Portal Allowed Services Error]:", err);
      res.status(500).json({ error: "Failed to load allowed services" });
    }
  });

  // Portal Invoices
  router.get("/invoices", async (req: Request, res: Response) => {
    try {
      const invoices = await withPlatformConnection(async (conn) => {
        const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [req.user!.userId]);
        const [rows]: any = await conn.query("SELECT i.* FROM `Invoice` i JOIN `Client` c ON i.clientId = c.id WHERE c.contactEmail = ? ORDER BY i.createdAt DESC", [user[0]?.email]);
        return rows;
      });
      res.json({ invoices });
    } catch (err: any) {
      console.error("[Portal Invoices Error]:", err);
      res.status(500).json({ error: "Failed to load invoices" });
    }
  });

  // Portal Tickets
  router.get("/tickets", async (req: Request, res: Response) => {
    try {
      const tickets = await withPlatformConnection(async (conn) => {
        const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [req.user!.userId]);
        const [rows]: any = await conn.query("SELECT t.* FROM `Ticket` t JOIN `Client` c ON t.clientId = c.id WHERE c.contactEmail = ? ORDER BY t.createdAt DESC", [user[0]?.email]);
        return rows;
      });
      res.json({ tickets });
    } catch (err: any) {
      console.error("[Portal Tickets Error]:", err);
      res.status(500).json({ error: "Failed to load tickets" });
    }
  });

  router.post("/tickets/create", async (req: Request, res: Response) => {
    try {
      const { subject, description, priority } = req.body;
      if (!subject) return res.status(400).json({ error: "Subject is required" });

      const result = await withPlatformConnection(async (conn) => {
        const clientId = await getClientIdForUser(conn, req.user!.userId);
        if (!clientId) return { status: 404, error: "Client account not found" };

        const id = "tkt_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const now = new Date().toISOString().slice(0, 23).replace("T", " ");
        await conn.query("INSERT INTO `Ticket` (id, clientId, subject, description, priority, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'OPEN', ?, ?)", [id, clientId, subject, description || null, priority || "MEDIUM", now, now]);
        return { status: 200, id };
      });

      if ("error" in result) return res.status(result.status).json({ error: result.error });
      res.json({ success: true, id: result.id });
    } catch (err: any) {
      console.error("[Portal Create Ticket Error]:", err);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  // Portal Profile
  router.get("/profile", async (req: Request, res: Response) => {
    try {
      const data = await withPlatformConnection(async (conn) => {
        const [users]: any = await conn.query("SELECT id, firstName, lastName, email, phone, role, createdAt, lastLoginAt FROM `User` WHERE id = ?", [req.user!.userId]);
        const [clients]: any = await conn.query("SELECT * FROM `Client` WHERE contactEmail = ? LIMIT 1", [users[0]?.email]);
        return { user: users[0] || null, client: clients[0] || null };
      });
      res.json(data);
    } catch (err: any) {
      console.error("[Portal Profile Error]:", err);
      res.status(500).json({ error: "Failed to load profile" });
    }
  });

  // Portal Members
  router.get("/members", async (req: Request, res: Response) => {
    try {
      const members = await withPlatformConnection(async (conn) => {
        const [user]: any = await conn.query("SELECT email FROM `User` WHERE id = ?", [req.user!.userId]);
        const [rows]: any = await conn.query(
          `SELECT m.id, m.fullName, m.role, m.email, m.phone, m.status,
           (SELECT COUNT(*) FROM \`Document\` d WHERE d.memberId = m.id) as documentCount
           FROM \`Member\` m JOIN \`Client\` c ON m.clientId = c.id 
           WHERE c.contactEmail = ? AND m.status = 'ACTIVE' ORDER BY m.role, m.fullName`,
          [user[0]?.email]
        );
        return rows;
      });
      res.json({ members });
    } catch (err: any) {
      console.error("[Portal Members Error]:", err);
      res.status(500).json({ error: "Failed to load members" });
    }
  });

  return router;
}
