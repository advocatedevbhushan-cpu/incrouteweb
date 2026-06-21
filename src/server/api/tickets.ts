import { Router, Request, Response } from "express";
import prisma from "../db/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { clientId, status, assigneeId, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    const p = parseInt(page), l = Math.min(parseInt(limit), 100);
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { createdAt: "desc" }, include: { client: { select: { companyName: true } } } }),
      prisma.ticket.count({ where }),
    ]);
    return res.json({ tickets, total, page: p, limit: l });
  } catch (err) { return res.status(500).json({ error: "Failed to fetch tickets" }); }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.create({ data: req.body });
    return res.status(201).json(ticket);
  } catch (err) { return res.status(500).json({ error: "Failed to create ticket" }); }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.update({ where: { id: req.params.id }, data: { ...req.body, ...(req.body.status === "RESOLVED" ? { resolvedAt: new Date() } : {}) } });
    return res.json(ticket);
  } catch (err) { return res.status(500).json({ error: "Failed to update ticket" }); }
});

export default router;
