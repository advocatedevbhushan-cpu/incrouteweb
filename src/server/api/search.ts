/**
 * Global Search API — Fuzzy search across all entities
 */
import { Router, Request, Response } from "express";
import prisma from "../db/prisma";

const router = Router();

// GET /api/search?q=term
router.get("/", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (q.length < 2) return res.json({ results: [] });

    const [clients, entities, documents, tickets, compliance, trademarks] = await Promise.all([
      prisma.client.findMany({ where: { OR: [{ companyName: { contains: q } }, { contactName: { contains: q } }, { contactEmail: { contains: q } }] }, take: 5, select: { id: true, companyName: true, contactEmail: true } }),
      prisma.entity.findMany({ where: { OR: [{ name: { contains: q } }, { cin: { contains: q } }, { gstin: { contains: q } }] }, take: 5, select: { id: true, name: true, type: true } }),
      prisma.document.findMany({ where: { title: { contains: q } }, take: 5, select: { id: true, title: true, category: true } }),
      prisma.ticket.findMany({ where: { subject: { contains: q } }, take: 5, select: { id: true, subject: true, status: true } }),
      prisma.complianceTask.findMany({ where: { title: { contains: q } }, take: 5, select: { id: true, title: true, status: true } }),
      prisma.trademarkApp.findMany({ where: { OR: [{ name: { contains: q } }, { applicationNo: { contains: q } }] }, take: 5, select: { id: true, name: true, status: true } }),
    ]);

    return res.json({
      results: [
        ...clients.map(c => ({ type: "client", id: c.id, title: c.companyName, subtitle: c.contactEmail })),
        ...entities.map(e => ({ type: "entity", id: e.id, title: e.name, subtitle: e.type })),
        ...documents.map(d => ({ type: "document", id: d.id, title: d.title, subtitle: d.category })),
        ...tickets.map(t => ({ type: "ticket", id: t.id, title: t.subject, subtitle: t.status })),
        ...compliance.map(c => ({ type: "compliance", id: c.id, title: c.title, subtitle: c.status })),
        ...trademarks.map(t => ({ type: "trademark", id: t.id, title: t.name, subtitle: t.status })),
      ],
    });
  } catch (err) { return res.status(500).json({ error: "Search failed" }); }
});

export default router;
