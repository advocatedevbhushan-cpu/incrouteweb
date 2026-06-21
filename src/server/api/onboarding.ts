/**
 * Onboarding & Service Request API
 */
import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { createServiceRequest, updateOnboardingStep, submitServiceRequest, advanceServiceStep, getRequiredDocuments, verifyDocument } from "../services/onboarding.service";
import { requireAuth, requireRole } from "../auth/middleware";

const router = Router();

// ─── GET /api/onboarding/requests — Client's service requests ────
router.get("/requests", requireAuth, async (req: Request, res: Response) => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      include: { steps: { orderBy: { order: "asc" } }, documents: true, timeline: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
    return res.json({ requests });
  } catch (err) { return res.status(500).json({ error: "Failed to fetch requests" }); }
});

// ─── GET /api/onboarding/requests/:id — Single request detail ────
router.get("/requests/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: { steps: { orderBy: { order: "asc" } }, documents: true, timeline: { orderBy: { createdAt: "desc" } } },
    });
    if (!request) return res.status(404).json({ error: "Not found" });
    return res.json(request);
  } catch (err) { return res.status(500).json({ error: "Failed to fetch request" }); }
});

// ─── POST /api/onboarding/requests — Create new service request ──
router.post("/requests", requireAuth, async (req: Request, res: Response) => {
  try {
    const { serviceType, companyName } = req.body;
    const request = await createServiceRequest({ userId: req.user!.userId, serviceType, companyName });
    return res.status(201).json(request);
  } catch (err) { return res.status(500).json({ error: "Failed to create request" }); }
});

// ─── PATCH /api/onboarding/requests/:id/step — Update onboarding step
router.patch("/requests/:id/step", requireAuth, async (req: Request, res: Response) => {
  try {
    const { step, data } = req.body;
    const request = await updateOnboardingStep(req.params.id, step, data);
    return res.json(request);
  } catch (err) { return res.status(500).json({ error: "Failed to update step" }); }
});

// ─── POST /api/onboarding/requests/:id/submit — Submit for processing
router.post("/requests/:id/submit", requireAuth, async (req: Request, res: Response) => {
  try {
    const request = await submitServiceRequest(req.params.id);
    return res.json(request);
  } catch (err) { return res.status(500).json({ error: "Failed to submit" }); }
});

// ─── GET /api/onboarding/documents/:serviceType — Required docs ──
router.get("/documents/:serviceType", requireAuth, async (req: Request, res: Response) => {
  const docs = await getRequiredDocuments(req.params.serviceType);
  return res.json({ documents: docs });
});

// ─── POST /api/onboarding/requests/:id/documents — Upload doc ────
router.post("/requests/:id/documents", requireAuth, async (req: Request, res: Response) => {
  try {
    const doc = await prisma.serviceDocument.create({
      data: { serviceRequestId: req.params.id, ...req.body },
    });
    await prisma.timelineEntry.create({
      data: { serviceRequestId: req.params.id, userId: req.user!.userId, type: "document_uploaded", title: `Document uploaded: ${doc.label}` },
    });
    return res.status(201).json(doc);
  } catch (err) { return res.status(500).json({ error: "Failed to upload document" }); }
});

// ─── ADMIN: Verify document ──────────────────────────────────────
router.post("/documents/:id/verify", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "TEAM_MEMBER"), async (req: Request, res: Response) => {
  try {
    const { action, reason } = req.body; // action: "approve" | "reject"
    await verifyDocument(req.params.id, action, req.user!.userId, reason);
    return res.json({ message: `Document ${action}d` });
  } catch (err) { return res.status(500).json({ error: "Failed to verify" }); }
});

// ─── ADMIN: Advance service step ─────────────────────────────────
router.post("/steps/:id/advance", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "TEAM_MEMBER"), async (req: Request, res: Response) => {
  try {
    const step = await prisma.serviceStep.findUnique({ where: { id: req.params.id } });
    if (!step) return res.status(404).json({ error: "Step not found" });
    await advanceServiceStep(step.serviceRequestId, step.id);
    return res.json({ message: "Step advanced" });
  } catch (err) { return res.status(500).json({ error: "Failed to advance step" }); }
});

// ─── GET /api/onboarding/timeline/:requestId — Full timeline ─────
router.get("/timeline/:requestId", requireAuth, async (req: Request, res: Response) => {
  try {
    const entries = await prisma.timelineEntry.findMany({
      where: { serviceRequestId: req.params.requestId },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ timeline: entries });
  } catch (err) { return res.status(500).json({ error: "Failed to fetch timeline" }); }
});

export default router;
