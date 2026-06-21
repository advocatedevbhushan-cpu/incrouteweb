import { Router, Request, Response } from "express";
import prisma from "../db/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { clientId, status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    const p = parseInt(page), l = Math.min(parseInt(limit), 100);
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { createdAt: "desc" }, include: { client: { select: { companyName: true } } } }),
      prisma.invoice.count({ where }),
    ]);
    // Revenue metrics
    const revenue = await prisma.invoice.aggregate({ where: { status: "PAID" }, _sum: { total: true } });
    const outstanding = await prisma.invoice.aggregate({ where: { status: { in: ["PENDING", "SENT", "OVERDUE"] } }, _sum: { total: true } });
    return res.json({ invoices, total, page: p, limit: l, revenue: revenue._sum.total || 0, outstanding: outstanding._sum.total || 0 });
  } catch (err) { return res.status(500).json({ error: "Failed to fetch invoices" }); }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const inv = await prisma.invoice.create({ data: req.body });
    await prisma.activity.create({ data: { clientId: inv.clientId, type: "invoice_created", title: `Invoice ${inv.invoiceNo} generated` } });
    return res.status(201).json(inv);
  } catch (err) { return res.status(500).json({ error: "Failed to create invoice" }); }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const inv = await prisma.invoice.update({ where: { id: req.params.id }, data: { ...req.body, ...(req.body.status === "PAID" ? { paidAt: new Date() } : {}) } });
    return res.json(inv);
  } catch (err) { return res.status(500).json({ error: "Failed to update invoice" }); }
});

export default router;
