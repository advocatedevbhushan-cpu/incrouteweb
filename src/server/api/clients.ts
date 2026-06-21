/**
 * Client Management API — CRUD, search, pagination
 */
import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { z } from "zod";

const router = Router();

const createClientSchema = z.object({
  companyName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  industry: z.string().optional(),
  relationshipMgrId: z.string().optional(),
});

// GET /api/clients — Paginated list
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = (req.query.search as string) || "";
    const status = req.query.status as string;

    const where: any = {};
    if (search) where.OR = [
      { companyName: { contains: search } },
      { contactName: { contains: search } },
      { contactEmail: { contains: search } },
    ];
    if (status) where.status = status;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { entities: true, tasks: true, tickets: true } } },
      }),
      prisma.client.count({ where }),
    ]);

    return res.json({ clients, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// GET /api/clients/:id — Full client profile
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        entities: { include: { complianceTasks: { where: { status: { not: "COMPLETED" } }, orderBy: { dueDate: "asc" }, take: 5 } } },
        documents: { orderBy: { createdAt: "desc" }, take: 10 },
        invoices: { orderBy: { createdAt: "desc" }, take: 10 },
        tickets: { orderBy: { createdAt: "desc" }, take: 5 },
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!client) return res.status(404).json({ error: "Client not found" });
    return res.json(client);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch client" });
  }
});

// POST /api/clients — Create
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = createClientSchema.parse(req.body);
    const client = await prisma.client.create({ data: { ...data, status: "ONBOARDING" } });
    // Log
    await prisma.activity.create({ data: { clientId: client.id, type: "client_created", title: `Client created: ${client.companyName}` } });
    return res.status(201).json(client);
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
    return res.status(500).json({ error: "Failed to create client" });
  }
});

// PATCH /api/clients/:id — Update
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.update({ where: { id: req.params.id }, data: req.body });
    return res.json(client);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update client" });
  }
});

export default router;
