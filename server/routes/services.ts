import { Router } from "express";
import fs from "fs";
import path from "path";

export function createServicesRouter(getPlatformConnection: () => Promise<any>, complianceCalendar: any[]) {
  const router = Router();

  // Compliance calendar endpoint
  router.get("/compliance-calendar", (req, res) => {
    res.json({ success: true, count: complianceCalendar.length, data: complianceCalendar });
  });

  // Services catalog endpoint
  router.get("/services-catalog", (req, res) => {
    try {
      const catalogPath = path.join(process.cwd(), "services-catalog.json");
      if (fs.existsSync(catalogPath)) {
        const data = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
        return res.json({ success: true, data });
      }
      res.json({ success: true, data: [] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to read services catalog", details: err.message });
    }
  });

  // Contact form submission
  router.post("/contact", async (req, res) => {
    let conn;
    try {
      const { name, email, phone, service, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }

      conn = await getPlatformConnection();
      const id = "sub_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await conn.query(
        `INSERT INTO \`Submission\` (id, formType, data, status, createdAt, updatedAt)
         VALUES (?, 'contact', ?, 'PENDING', ?, ?)`,
        [id, JSON.stringify({ name, email, phone, service, message }), now, now]
      );

      res.status(201).json({ success: true, message: "Contact request submitted successfully!", submissionId: id });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to submit contact form", details: err.message });
    } finally {
      if (conn) conn.release();
    }
  });

  return router;
}
