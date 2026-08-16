import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { withPlatformConnection } from "../db";

export function createServicesRouter(complianceCalendar: any[], emailTransporter: any) {
  const router = Router();

  // Compliance calendar endpoint
  router.get(["/compliance/calendar", "/compliance-calendar"], (req: Request, res: Response) => {
    res.json({ success: true, count: complianceCalendar.length, calendar: complianceCalendar, data: complianceCalendar });
  });

  // Services catalog endpoint
  router.get("/services-catalog", (req: Request, res: Response) => {
    try {
      const catalogPath = path.join(process.cwd(), "services-catalog.json");
      if (fs.existsSync(catalogPath)) {
        const data = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
        return res.json({ success: true, data });
      }
      res.json({ success: true, data: [] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to read services catalog" });
    }
  });

  // Contact form submission
  router.post("/contact", async (req: Request, res: Response) => {
    try {
      const { name, email, phone, service, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }

      const id = "sub_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await withPlatformConnection(async (conn) => {
        try {
          await conn.query(
            `INSERT INTO \`Submission\` (id, formType, data, status, createdAt, updatedAt)
             VALUES (?, 'contact', ?, 'PENDING', ?, ?)`,
            [id, JSON.stringify({ name, email, phone, service, message }), now, now]
          );
        } catch {}
      });

      if (emailTransporter && (process.env.NOTIFICATION_TO || process.env.NOTIFICATION_TO_SECONDARY)) {
        const recipients = [process.env.NOTIFICATION_TO, process.env.NOTIFICATION_TO_SECONDARY].filter(Boolean) as string[];
        try {
          await emailTransporter.sendMail({
            from: `"INCroute Notifications" <${process.env.SMTP_USER}>`,
            to: recipients.join(", "),
            subject: `🏆 New Contact Lead: ${name}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #d4af37;border-radius:12px;padding:24px;background:#0d0d0d;color:#fff;">
                <h2 style="color:#d4af37;margin-top:0;">New Lead Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                <p><strong>Service:</strong> ${service || "General Inquiry"}</p>
                <p><strong>Message:</strong> ${message}</p>
              </div>
            `
          });
        } catch (e: any) {
          console.error("Failed to send lead notification:", e.message);
        }
      }

      res.status(201).json({ success: true, message: "Contact request submitted successfully!", submissionId: id });
    } catch (err: any) {
      console.error("[Contact Form Error]:", err);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Premium drafting request
  router.post("/send-premium-request", async (req: Request, res: Response) => {
    try {
      const { fullName, email, phone, companyName, notes, preferredTime, wizardData, agreedToTerms } = req.body;
      if (!fullName || !email || !companyName || !agreedToTerms) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
      }

      const id = `PREM-${Math.floor(1000 + Math.random() * 9000)}`;
      const requestData = {
        id,
        fullName,
        email,
        phone: phone || "N/A",
        companyName,
        notes: notes || "None",
        preferredTime: preferredTime || "Anytime",
        wizardData: wizardData || {},
        agreedToTerms,
        timestamp: new Date().toISOString(),
      };

      console.log(`[Premium Request] ${id} for ${companyName} (${fullName})`);
      res.json({ success: true, message: "Premium drafting request received successfully.", requestId: id });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to process premium request" });
    }
  });

  return router;
}
