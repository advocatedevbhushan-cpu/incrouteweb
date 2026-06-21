/**
 * Dashboard API — Live metrics for all roles
 */
import { Router, Request, Response } from "express";
import prisma from "../db/prisma";

const router = Router();

// GET /api/dashboard — Role-based dashboard data
router.get("/", async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.user!;

    if (["SUPER_ADMIN", "ADMIN"].includes(role)) {
      // Admin dashboard — full platform metrics
      const [totalClients, activeEntities, pendingCompliance, overdueCompliance, openTickets, pendingInvoices, recentActivity] = await Promise.all([
        prisma.client.count({ where: { status: "ACTIVE" } }),
        prisma.entity.count({ where: { status: "ACTIVE" } }),
        prisma.complianceTask.count({ where: { status: { in: ["PENDING", "IN_PROGRESS"] } } }),
        prisma.complianceTask.count({ where: { status: "OVERDUE" } }),
        prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "ESCALATED"] } } }),
        prisma.invoice.count({ where: { status: { in: ["PENDING", "SENT", "OVERDUE"] } } }),
        prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      ]);

      return res.json({
        metrics: { totalClients, activeEntities, pendingCompliance, overdueCompliance, openTickets, pendingInvoices },
        recentActivity,
      });
    }

    if (role === "CLIENT") {
      // Client dashboard — own entities only
      const entityAccess = await prisma.entityAccess.findMany({ where: { userId }, select: { entityId: true } });
      const entityIds = entityAccess.map(e => e.entityId);

      const [entities, upcomingCompliance, documents, openTickets, pendingInvoices, notifications] = await Promise.all([
        prisma.entity.findMany({ where: { id: { in: entityIds } } }),
        prisma.complianceTask.findMany({ where: { entityId: { in: entityIds }, status: { in: ["PENDING", "IN_PROGRESS"] } }, orderBy: { dueDate: "asc" }, take: 5 }),
        prisma.document.count({ where: { entityId: { in: entityIds }, status: "PUBLISHED" } }),
        prisma.ticket.count({ where: { client: { entities: { some: { id: { in: entityIds } } } } }, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
        prisma.invoice.count({ where: { client: { entities: { some: { id: { in: entityIds } } } } }, status: { in: ["PENDING", "SENT"] } } }),
        prisma.activity.findMany({ where: { userId, type: { startsWith: "notification:" } }, orderBy: { createdAt: "desc" }, take: 5 }),
      ]);

      // Calculate overall compliance health
      const totalTasks = await prisma.complianceTask.count({ where: { entityId: { in: entityIds } } });
      const completedTasks = await prisma.complianceTask.count({ where: { entityId: { in: entityIds }, status: "COMPLETED" } });
      const complianceHealth = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

      return res.json({
        complianceHealth,
        entities,
        upcomingCompliance,
        metrics: { entities: entities.length, documents, openTickets, pendingInvoices },
        notifications,
      });
    }

    return res.json({ metrics: {} });
  } catch (err) {
    console.error("[DASHBOARD ERROR]", err);
    return res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;
