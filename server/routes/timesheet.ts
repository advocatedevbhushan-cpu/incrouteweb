import { Router, Request, Response } from "express";
import { withPlatformConnection } from "../db";
import { authenticateToken } from "../middleware/auth";

export function createTimesheetRouter() {
  const router = Router();

  router.use(authenticateToken);

  // List timesheet entries
  router.get("/", async (req: Request, res: Response) => {
    try {
      const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user!.role);
      let whereClause = "1=1";
      const params: any[] = [];

      if (!isAdmin) {
        whereClause += " AND t.userId = ?";
        params.push(req.user!.userId);
      } else if (req.query.userId && req.query.userId !== "all") {
        whereClause += " AND t.userId = ?";
        params.push(req.query.userId);
      }

      if (req.query.clientId) {
        whereClause += " AND t.clientId = ?";
        params.push(req.query.clientId);
      }
      if (req.query.startDate) {
        whereClause += " AND t.startTime >= ?";
        params.push(req.query.startDate);
      }
      if (req.query.endDate) {
        whereClause += " AND t.startTime <= ?";
        params.push(req.query.endDate);
      }

      const entries = await withPlatformConnection(async (conn) => {
        const query = `
          SELECT t.*, u.firstName, u.lastName, c.companyName as clientName
          FROM \`Timesheet\` t
          LEFT JOIN \`User\` u ON t.userId = u.id
          LEFT JOIN \`Client\` c ON t.clientId = c.id
          WHERE ${whereClause}
          ORDER BY t.startTime DESC
        `;
        const [rows]: any = await conn.query(query, params);
        return rows;
      });

      res.json({ entries });
    } catch (err: any) {
      console.error("[Timesheet List Error]:", err);
      res.status(500).json({ error: "Failed to load timesheet entries" });
    }
  });

  // Summary & active timer
  router.get("/summary", async (req: Request, res: Response) => {
    try {
      const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user!.role);
      const currentUserId = req.user!.userId;

      let statsWhere = "1=1";
      const statsParams: any[] = [];
      if (!isAdmin) {
        statsWhere += " AND t.userId = ?";
        statsParams.push(currentUserId);
      } else if (req.query.userId && req.query.userId !== "all") {
        statsWhere += " AND t.userId = ?";
        statsParams.push(req.query.userId);
      }

      if (req.query.clientId) {
        statsWhere += " AND t.clientId = ?";
        statsParams.push(req.query.clientId);
      }
      if (req.query.startDate) {
        statsWhere += " AND t.startTime >= ?";
        statsParams.push(req.query.startDate);
      }
      if (req.query.endDate) {
        statsWhere += " AND t.startTime <= ?";
        statsParams.push(req.query.endDate);
      }

      const data = await withPlatformConnection(async (conn) => {
        const [activeTimers]: any = await conn.query(
          `SELECT t.*, c.companyName as clientName 
           FROM \`Timesheet\` t 
           LEFT JOIN \`Client\` c ON t.clientId = c.id
           WHERE t.userId = ? AND t.endTime IS NULL 
           LIMIT 1`,
          [currentUserId]
        );
        const activeTimer = activeTimers.length > 0 ? activeTimers[0] : null;

        const [[totals]]: any = await conn.query(
          `SELECT 
             COALESCE(SUM(duration), 0) as totalDuration,
             COALESCE(SUM(CASE WHEN billable = 1 THEN duration ELSE 0 END), 0) as billableDuration
           FROM \`Timesheet\` t
           WHERE ${statsWhere} AND t.endTime IS NOT NULL`,
          statsParams
        );

        const [byClient]: any = await conn.query(
          `SELECT 
             t.clientId,
             COALESCE(c.companyName, t.customClient, 'No Client') as clientName,
             SUM(t.duration) as totalDuration,
             SUM(CASE WHEN t.billable = 1 THEN t.duration ELSE 0 END) as billableDuration
           FROM \`Timesheet\` t
           LEFT JOIN \`Client\` c ON t.clientId = c.id
           WHERE ${statsWhere} AND t.endTime IS NOT NULL
           GROUP BY t.clientId, c.companyName, t.customClient
           ORDER BY totalDuration DESC`,
          statsParams
        );

        const [byUser]: any = await conn.query(
          `SELECT 
             t.userId,
             CONCAT(u.firstName, ' ', u.lastName) as fullName,
             SUM(t.duration) as totalDuration,
             SUM(CASE WHEN t.billable = 1 THEN t.duration ELSE 0 END) as billableDuration
           FROM \`Timesheet\` t
           JOIN \`User\` u ON t.userId = u.id
           WHERE ${statsWhere} AND t.endTime IS NOT NULL
           GROUP BY t.userId, u.firstName, u.lastName
           ORDER BY totalDuration DESC`,
          statsParams
        );

        return {
          activeTimer,
          summary: {
            totalDuration: totals.totalDuration,
            billableDuration: totals.billableDuration,
            byClient,
            byUser
          }
        };
      });

      res.json(data);
    } catch (err: any) {
      console.error("[Timesheet Summary Error]:", err);
      res.status(500).json({ error: "Failed to load timesheet summary" });
    }
  });

  // Create timesheet entry or start timer
  router.post("/", async (req: Request, res: Response) => {
    try {
      const { clientId, customClient, description, startTime, endTime, duration, billable } = req.body;
      if (!description || !startTime) {
        return res.status(400).json({ error: "Description and start time are required" });
      }

      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const startStr = new Date(startTime).toISOString().slice(0, 23).replace("T", " ");
      const id = "ts_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

      await withPlatformConnection(async (conn) => {
        if (endTime) {
          const endStr = new Date(endTime).toISOString().slice(0, 23).replace("T", " ");
          const finalDuration = duration !== undefined ? duration : Math.max(0, Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000));
          await conn.query(
            `INSERT INTO \`Timesheet\` (id, userId, clientId, customClient, description, startTime, endTime, duration, billable, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, req.user!.userId, clientId || null, customClient || null, description, startStr, endStr, finalDuration, billable ? 1 : 0, now, now]
          );
        } else {
          const [running]: any = await conn.query(
            "SELECT id, startTime FROM `Timesheet` WHERE userId = ? AND endTime IS NULL",
            [req.user!.userId]
          );
          for (const timer of running) {
            const start = new Date(timer.startTime);
            const end = new Date(startTime);
            const dur = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
            const endStr = end.toISOString().slice(0, 23).replace("T", " ");
            await conn.query(
              "UPDATE `Timesheet` SET endTime = ?, duration = ?, updatedAt = ? WHERE id = ?",
              [endStr, dur, now, timer.id]
            );
          }
          await conn.query(
            `INSERT INTO \`Timesheet\` (id, userId, clientId, customClient, description, startTime, endTime, duration, billable, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, req.user!.userId, clientId || null, customClient || null, description, startStr, null, 0, billable ? 1 : 0, now, now]
          );
        }
      });

      res.status(201).json({ success: true, id });
    } catch (err: any) {
      console.error("[Timesheet Create Error]:", err);
      res.status(500).json({ error: "Failed to create timesheet entry" });
    }
  });

  // Stop running timer or update completed entry
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const { clientId, customClient, description, billable, startTime, endTime, duration } = req.body;
      const result = await withPlatformConnection(async (conn) => {
        const [existing]: any = await conn.query("SELECT userId, startTime, endTime FROM `Timesheet` WHERE id = ?", [req.params.id]);
        if (existing.length === 0) return { status: 404, error: "Timesheet entry not found" };

        const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user!.role);
        if (!isAdmin && existing[0].userId !== req.user!.userId) {
          return { status: 403, error: "Insufficient permissions to edit this entry" };
        }

        const now = new Date().toISOString().slice(0, 23).replace("T", " ");
        if (existing[0].endTime === null) {
          const start = new Date(existing[0].startTime);
          const end = new Date();
          const durationVal = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
          const endStr = end.toISOString().slice(0, 23).replace("T", " ");

          await conn.query(
            `UPDATE \`Timesheet\`
             SET clientId = ?, customClient = ?, description = ?, billable = ?, endTime = ?, duration = ?, updatedAt = ?
             WHERE id = ?`,
            [clientId || null, customClient || null, description, billable ? 1 : 0, endStr, durationVal, now, req.params.id]
          );
        } else {
          const startStr = startTime ? new Date(startTime).toISOString().slice(0, 23).replace("T", " ") : null;
          const endStr = endTime ? new Date(endTime).toISOString().slice(0, 23).replace("T", " ") : null;
          await conn.query(
            `UPDATE \`Timesheet\`
             SET clientId = ?, customClient = ?, description = ?, billable = ?,
                 startTime = COALESCE(?, startTime),
                 endTime = COALESCE(?, endTime),
                 duration = COALESCE(?, duration),
                 updatedAt = ?
             WHERE id = ?`,
            [clientId || null, customClient || null, description, billable ? 1 : 0, startStr, endStr, duration !== undefined ? duration : null, now, req.params.id]
          );
        }

        return { status: 200 };
      });

      if ("error" in result) return res.status(result.status).json({ error: result.error });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Timesheet Update Error]:", err);
      res.status(500).json({ error: "Failed to update timesheet entry" });
    }
  });

  // Delete timesheet entry
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const result = await withPlatformConnection(async (conn) => {
        const [existing]: any = await conn.query("SELECT userId FROM `Timesheet` WHERE id = ?", [req.params.id]);
        if (existing.length === 0) return { status: 404, error: "Timesheet entry not found" };

        const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(req.user!.role);
        if (!isAdmin && existing[0].userId !== req.user!.userId) {
          return { status: 403, error: "Insufficient permissions to delete this entry" };
        }

        await conn.query("DELETE FROM `Timesheet` WHERE id = ?", [req.params.id]);
        return { status: 200 };
      });

      if ("error" in result) return res.status(result.status).json({ error: result.error });
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Timesheet Delete Error]:", err);
      res.status(500).json({ error: "Failed to delete timesheet entry" });
    }
  });

  return router;
}
