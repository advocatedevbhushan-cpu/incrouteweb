import { Router, Request, Response } from "express";
import { withPlatformConnection } from "../db";
import { authenticateToken, requirePartner } from "../middleware/auth";

export function createPartnerRouter() {
  const router = Router();

  router.use(authenticateToken);
  router.use(requirePartner);

  const assignedClientWhere = (user: any) => {
    if (["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return { where: "1=1", params: [] as any[] };
    }
    return { where: "c.relationshipMgrId = ?", params: [user.userId] as any[] };
  };

  // Partner Dashboard
  router.get("/dashboard", async (req: Request, res: Response) => {
    try {
      const scope = assignedClientWhere(req.user);
      const data = await withPlatformConnection(async (conn) => {
        const [[clientCount]]: any = await conn.query(`SELECT COUNT(*) as count FROM \`Client\` c WHERE ${scope.where}`, scope.params);
        const [[serviceCount]]: any = await conn.query(`SELECT COUNT(*) as count FROM \`ServiceRequest\` sr JOIN \`Client\` c ON sr.clientId = c.id WHERE ${scope.where} AND sr.status NOT IN ('COMPLETED','CANCELLED')`, scope.params);
        const [[documentCount]]: any = await conn.query(`SELECT COUNT(*) as count FROM \`Document\` d JOIN \`Client\` c ON d.clientId = c.id WHERE ${scope.where} AND d.status IN ('PENDING','UNDER_REVIEW')`, scope.params);
        const [[complianceCount]]: any = await conn.query(`SELECT COUNT(*) as count FROM \`ComplianceTask\` ct JOIN \`Entity\` e ON ct.entityId = e.id JOIN \`Client\` c ON e.clientId = c.id WHERE ${scope.where} AND ct.status NOT IN ('COMPLETED')`, scope.params);

        const [clients]: any = await conn.query(
          `SELECT c.id, c.companyName, c.contactName, c.contactEmail, c.status, c.createdAt,
           (SELECT COUNT(*) FROM \`ServiceRequest\` sr WHERE sr.clientId = c.id AND sr.status NOT IN ('COMPLETED','CANCELLED')) as openServices,
           (SELECT COUNT(*) FROM \`Document\` d WHERE d.clientId = c.id AND d.status IN ('PENDING','UNDER_REVIEW')) as pendingDocuments
           FROM \`Client\` c WHERE ${scope.where} ORDER BY c.createdAt DESC LIMIT 8`,
          scope.params
        );

        const [documentsForReview]: any = await conn.query(
          `SELECT d.id, d.title, d.category, d.folder, d.status, d.originalName, d.fileName, d.createdAt, c.companyName as clientName
           FROM \`Document\` d JOIN \`Client\` c ON d.clientId = c.id
           WHERE ${scope.where} AND d.status IN ('PENDING','UNDER_REVIEW')
           ORDER BY d.createdAt DESC LIMIT 8`,
          scope.params
        );

        const [upcomingCompliance]: any = await conn.query(
          `SELECT ct.id, ct.title, ct.dueDate, ct.priority, ct.status, e.name as entityName, c.companyName as clientName
           FROM \`ComplianceTask\` ct JOIN \`Entity\` e ON ct.entityId = e.id JOIN \`Client\` c ON e.clientId = c.id
           WHERE ${scope.where} AND ct.status NOT IN ('COMPLETED')
           ORDER BY ct.dueDate ASC LIMIT 8`,
          scope.params
        );

        return {
          stats: {
            clients: clientCount.count || 0,
            openServices: serviceCount.count || 0,
            documentsForReview: documentCount.count || 0,
            upcomingCompliance: complianceCount.count || 0,
          },
          clients,
          documentsForReview,
          upcomingCompliance,
        };
      });

      res.json(data);
    } catch (err: any) {
      console.error("[Partner Dashboard Error]:", err);
      res.status(500).json({ error: "Failed to load partner dashboard" });
    }
  });

  // Assigned Clients
  router.get("/clients", async (req: Request, res: Response) => {
    try {
      const scope = assignedClientWhere(req.user);
      const clients = await withPlatformConnection(async (conn) => {
        const [rows]: any = await conn.query(
          `SELECT c.*,
           (SELECT COUNT(*) FROM \`Entity\` e WHERE e.clientId = c.id) as entityCount,
           (SELECT COUNT(*) FROM \`ServiceRequest\` sr WHERE sr.clientId = c.id AND sr.status NOT IN ('COMPLETED','CANCELLED')) as openServices,
           (SELECT COUNT(*) FROM \`Document\` d WHERE d.clientId = c.id AND d.status IN ('PENDING','UNDER_REVIEW')) as pendingDocuments,
           (SELECT COUNT(*) FROM \`ComplianceTask\` ct JOIN \`Entity\` e ON ct.entityId = e.id WHERE e.clientId = c.id AND ct.status NOT IN ('COMPLETED')) as openCompliance
           FROM \`Client\` c
           WHERE ${scope.where}
           ORDER BY c.createdAt DESC`,
          scope.params
        );
        return rows;
      });

      res.json({ clients });
    } catch (err: any) {
      console.error("[Partner Clients Error]:", err);
      res.status(500).json({ error: "Failed to load clients" });
    }
  });

  // Documents for review
  router.get("/documents", async (req: Request, res: Response) => {
    try {
      const scope = assignedClientWhere(req.user);
      const documents = await withPlatformConnection(async (conn) => {
        const [rows]: any = await conn.query(
          `SELECT d.*, c.companyName as clientName
           FROM \`Document\` d JOIN \`Client\` c ON d.clientId = c.id
           WHERE ${scope.where}
           ORDER BY FIELD(d.status,'UNDER_REVIEW','PENDING','REJECTED','APPROVED'), d.createdAt DESC
           LIMIT 100`,
          scope.params
        );
        return rows;
      });

      res.json({ documents });
    } catch (err: any) {
      console.error("[Partner Documents Error]:", err);
      res.status(500).json({ error: "Failed to load documents" });
    }
  });

  // Update document review status
  router.patch("/documents/:id", async (req: Request, res: Response) => {
    try {
      const { status, internalNote } = req.body;
      if (!["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(status)) {
        return res.status(400).json({ error: "Invalid document status" });
      }

      const scope = assignedClientWhere(req.user);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const params = [status, req.user!.userId, status === "APPROVED" ? now : null, internalNote || null, now, req.params.id, ...scope.params];

      const result = await withPlatformConnection(async (conn) => {
        const [resQuery]: any = await conn.query(
          `UPDATE \`Document\` d JOIN \`Client\` c ON d.clientId = c.id
           SET d.status = ?, d.approvedBy = ?, d.approvedAt = ?, d.internalNote = ?, d.updatedAt = ?
           WHERE d.id = ? AND ${scope.where}`,
          params
        );
        return resQuery;
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Document not found for assigned client" });
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error("[Partner Update Document Error]:", err);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Partner compliance view
  router.get("/compliance", async (req: Request, res: Response) => {
    try {
      const scope = assignedClientWhere(req.user);
      const tasks = await withPlatformConnection(async (conn) => {
        const [rows]: any = await conn.query(
          `SELECT ct.*, e.name as entityName, c.companyName as clientName
           FROM \`ComplianceTask\` ct JOIN \`Entity\` e ON ct.entityId = e.id JOIN \`Client\` c ON e.clientId = c.id
           WHERE ${scope.where}
           ORDER BY FIELD(ct.priority,'CRITICAL','HIGH','MEDIUM','LOW'), ct.dueDate ASC
           LIMIT 100`,
          scope.params
        );
        return rows;
      });

      res.json({ tasks });
    } catch (err: any) {
      console.error("[Partner Compliance Error]:", err);
      res.status(500).json({ error: "Failed to load compliance tasks" });
    }
  });

  return router;
}
