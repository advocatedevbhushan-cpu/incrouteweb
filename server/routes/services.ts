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

  // Helper to send lead notifications
  const sendLeadNotification = async (subject: string, title: string, fields: Record<string, string | undefined>) => {
    if (!emailTransporter || (!process.env.NOTIFICATION_TO && !process.env.NOTIFICATION_TO_SECONDARY)) {
      return;
    }
    const recipients = [process.env.NOTIFICATION_TO, process.env.NOTIFICATION_TO_SECONDARY].filter(Boolean) as string[];
    const rowsHtml = Object.entries(fields)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `<tr><td style="padding:8px 12px;font-weight:bold;color:#a3a3a3;border-bottom:1px solid #262626;width:140px;">${k}</td><td style="padding:8px 12px;color:#ffffff;border-bottom:1px solid #262626;">${v}</td></tr>`)
      .join("");

    try {
      await emailTransporter.sendMail({
        from: `"INCroute Notifications" <${process.env.SMTP_USER}>`,
        to: recipients.join(", "),
        subject: subject,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;border:1px solid #d4af37;border-radius:12px;overflow:hidden;color:#ffffff;">
            <div style="background:#171717;padding:20px 24px;border-bottom:1px solid #333;">
              <h2 style="margin:0;color:#d4af37;font-size:20px;font-weight:700;">${title}</h2>
              <p style="margin:4px 0 0 0;color:#888;font-size:12px;">Received on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
            </div>
            <div style="padding:24px;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </div>
            <div style="background:#141414;padding:12px 24px;font-size:11px;color:#666;border-top:1px solid #222;text-align:center;">
              INCroute Platform Automated Notification System
            </div>
          </div>
        `
      });
      console.log(`[Notification Sent] ${subject} -> ${recipients.join(", ")}`);
    } catch (e: any) {
      console.error("[Email Notification Error]:", e.message);
    }
  };

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
        } catch (dbErr: any) {
          console.warn("[Submission DB Warning]:", dbErr.message);
        }
      });

      await sendLeadNotification(`🏆 New Contact Lead: ${name}`, "New Contact Form Submission", {
        "Full Name": name,
        "Email Address": email,
        "Phone Number": phone || "N/A",
        "Service Interested": service || "General Inquiry",
        "Message": message
      });

      res.status(201).json({ success: true, message: "Contact request submitted successfully!", submissionId: id });
    } catch (err: any) {
      console.error("[Contact Form Error]:", err);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Leads & Free Consultation popup submissions (/api/leads)
  router.post("/leads", async (req: Request, res: Response) => {
    try {
      const { name, phone, entityType, email, source } = req.body;
      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const id = "lead_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await withPlatformConnection(async (conn) => {
        try {
          await conn.query(
            `INSERT INTO \`Submission\` (id, formType, data, status, createdAt, updatedAt)
             VALUES (?, 'lead', ?, 'PENDING', ?, ?)`,
            [id, JSON.stringify({ name, phone, entityType, email, source }), now, now]
          );
        } catch (dbErr: any) {
          console.warn("[Lead DB Warning]:", dbErr.message);
        }
      });

      await sendLeadNotification(`🔥 New Free Consultation Lead: ${phone}`, "New Lead Captured", {
        "Name": name || "Founder",
        "Phone Number": phone,
        "Entity Type": entityType || "Not Specified",
        "Email": email || "N/A",
        "Source": source || "Website Lead Form"
      });

      res.status(201).json({ success: true, message: "Lead recorded successfully", leadId: id });
    } catch (err: any) {
      console.error("[Leads Error]:", err);
      res.status(500).json({ error: "Failed to process lead" });
    }
  });

  // Career application submission (/api/apply)
  router.post("/apply", async (req: Request, res: Response) => {
    try {
      const { name, email, phone, role, position, resumeLink, fileName, details } = req.body;
      if (!name || !email || !phone) {
        return res.status(400).json({ error: "Name, email, and phone are required" });
      }

      const id = "app_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");

      await withPlatformConnection(async (conn) => {
        try {
          await conn.query(
            `INSERT INTO \`Submission\` (id, formType, data, status, createdAt, updatedAt)
             VALUES (?, 'career_application', ?, 'PENDING', ?, ?)`,
            [id, JSON.stringify({ name, email, phone, role, position, resumeLink, fileName, details }), now, now]
          );
        } catch (dbErr: any) {
          console.warn("[Career Application DB Warning]:", dbErr.message);
        }
      });

      await sendLeadNotification(`📄 New Career Application: ${name} (${position || "Applicant"})`, "New Career Application", {
        "Applicant Name": name,
        "Email Address": email,
        "Phone Number": phone,
        "Position": position || role || "Applicant",
        "Resume Link": resumeLink || "N/A",
        "Attached File": fileName || "N/A",
        "Cover Note / Details": details || "N/A"
      });

      res.status(201).json({ success: true, message: "Application submitted successfully!", applicationId: id });
    } catch (err: any) {
      console.error("[Career Application Error]:", err);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Premium drafting / Enterprise consultation request
  router.post("/send-premium-request", async (req: Request, res: Response) => {
    try {
      const { fullName, email, phone, companyName, notes, preferredTime, wizardData, agreedToTerms } = req.body;
      if (!email || !phone) {
        return res.status(400).json({ success: false, error: "Email and phone are required." });
      }

      const id = `PREM-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const requestData = {
        id,
        fullName: fullName || "Client",
        email,
        phone,
        companyName: companyName || "N/A",
        notes: notes || "None",
        preferredTime: preferredTime || "Anytime",
        wizardData: wizardData || {},
        agreedToTerms: !!agreedToTerms,
        timestamp: new Date().toISOString(),
      };

      await withPlatformConnection(async (conn) => {
        try {
          await conn.query(
            `INSERT INTO \`Submission\` (id, formType, data, status, createdAt, updatedAt)
             VALUES (?, 'premium_request', ?, 'PENDING', ?, ?)`,
            [id, JSON.stringify(requestData), now, now]
          );
        } catch (dbErr: any) {
          console.warn("[Premium Request DB Warning]:", dbErr.message);
        }
      });

      await sendLeadNotification(`⚡ Custom Drafting / Enterprise Request: ${companyName || email}`, "Custom Legal Drafting Request", {
        "Request ID": id,
        "Name": fullName || "Client",
        "Email Address": email,
        "Phone Number": phone,
        "Document / Company": companyName || "N/A",
        "Preferred Time": preferredTime || "Anytime",
        "Notes / Instructions": notes || "None"
      });

      res.json({ success: true, message: "Drafting request received successfully.", requestId: id });
    } catch (err: any) {
      console.error("[Premium Request Error]:", err);
      res.status(500).json({ error: "Failed to process premium request" });
    }
  });

  return router;
}
