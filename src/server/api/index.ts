/**
 * INCroute API Router — All endpoints
 * Mount on: app.use("/api", apiRouter)
 */
import { Router } from "express";
import { requireAuth, requireRole } from "../auth/middleware";
import clientsRouter from "./clients";
import complianceRouter from "./compliance";
import dashboardRouter from "./dashboard";
import documentsRouter from "./documents";
import invoicesRouter from "./invoices";
import ticketsRouter from "./tickets";
import searchRouter from "./search";
import onboardingRouter from "./onboarding";

const router = Router();

// Public health check
router.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Protected routes
router.use("/dashboard", requireAuth, dashboardRouter);
router.use("/clients", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "TEAM_MEMBER"), clientsRouter);
router.use("/compliance", requireAuth, complianceRouter);
router.use("/documents", requireAuth, documentsRouter);
router.use("/invoices", requireAuth, invoicesRouter);
router.use("/tickets", requireAuth, ticketsRouter);
router.use("/search", requireAuth, searchRouter);
router.use("/onboarding", onboardingRouter); // Auth applied per-route inside

export default router;
