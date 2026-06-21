import { Router, Request, Response } from "express";
import prisma from "../db/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { clientId, entityId, category, status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (entityId) where.entityId = entityId;
    if (category) where.category = category;
    if (status) where.status = status;

    const p = parseInt(page), l = Math.min(parseInt(limit), 100);
    const [documents, total] = await Promise.all([
      prisma.document.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { createdAt: "desc" } }),
      prisma.document.count({ where }),
    ]);
    return res.json({ documents, total, page: p, limit: l });
  } catch (err) { return res.status(500).json({ error: "Failed to fetch documents" }); }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const doc = await prisma.document.create({ data: { ...req.body, uploadedBy: req.user!.userId } });
    await prisma.activity.create({ data: { clientId: doc.clientId, userId: req.user!.userId, type: "document_uploaded", title: `Document uploaded: ${doc.title}` } });
    return res.status(201).json(doc);
  } catch (err) { return res.status(500).json({ error: "Failed to create document" }); }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const doc = await prisma.document.update({ where: { id: req.params.id }, data: req.body });
    return res.json(doc);
  } catch (err) { return res.status(500).json({ error: "Failed to update document" }); }
});

export default router;
