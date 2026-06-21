import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { updateEntityComplianceScore } from "../services/compliance.service";

const router = Router();

// GET /api/compliance — List with filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, entityId, assigneeId, category, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (entityId) where.entityId = entityId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (category) where.category = category;

    const p = parseInt(page), l = Math.min(parseInt(limit), 100);
    const [tasks, total] = await Promise.all([
      prisma.complianceTask.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { dueDate: "asc" }, include: { entity: { select: { name: true, clientId: true } } } }),
      prisma.complianceTask.count({ where }),
    ]);
    return res.json({ tasks, total, page: p, limit: l });
  } catch (err) { return res.status(500).json({ error: "Failed to fetch compliance tasks" }); }
});

// PATCH /api/compliance/:id — Update status
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const task = await prisma.complianceTask.update({ where: { id: req.params.id }, data: { ...req.body, ...(req.body.status === "COMPLETED" ? { completedAt: new Date() } : {}) } });
    await updateEntityComplianceScore(task.entityId);
    return res.json(task);
  } catch (err) { return res.status(500).json({ error: "Failed to update task" }); }
});

export default router;
