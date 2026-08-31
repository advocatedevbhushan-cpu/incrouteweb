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

  // Helper to send admin lead notification email
  const sendLeadNotification = async (
    title: string,
    subtitle: string,
    fields: Record<string, string | undefined>
  ) => {
    const adminEmail = process.env.NOTIFICATION_TO || process.env.ADMIN_EMAIL || "d.bhushan@incroute.com";
    const recipients = [adminEmail, process.env.NOTIFICATION_TO_SECONDARY].filter(Boolean).join(", ");

    if (!emailTransporter || !process.env.SMTP_USER) {
      console.warn(`⚠️ [Lead Alert Skipped - SMTP Not Configured]: A lead was captured but could not be emailed because SMTP settings are missing in .env.`);
      console.log(`📋 Lead Details [${title}]:`, JSON.stringify(fields, null, 2));
      console.log(`👉 To receive email alerts, configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and NOTIFICATION_TO in .env`);
      return;
    }

    const rowsHtml = Object.entries(fields)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .map(
        ([k, v]) =>
          `<tr><td style="padding:10px 14px;font-weight:600;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9;width:160px;">${k}</td><td style="padding:10px 14px;color:#0f172a;font-size:13px;border-bottom:1px solid #f1f5f9;font-weight:500;">${v}</td></tr>`
      )
      .join("");

    try {
      await emailTransporter.sendMail({
        from: `"INCroute Lead Alerts" <${process.env.SMTP_USER}>`,
        to: recipients,
        subject: `${title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);">
              <div style="background:linear-gradient(135deg,#0b0f19 0%,#1e1b4b 100%);padding:28px 28px;border-bottom:3px solid #d4af37;">
                <div style="font-size:20px;font-weight:900;color:#fff;">${title}</div>
                <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${subtitle}</p>
              </div>
              <div style="padding:24px 28px;">
                <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                  <tbody>${rowsHtml}</tbody>
                </table>
                <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;">INCroute Admin Notification • ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log(`✓ [Lead Alert Sent] -> ${recipients}`);
    } catch (leadMailErr: any) {
      console.error("❌ [Lead Notification Failed]:", leadMailErr.message);
    }
  };

  // Helper to send instant client confirmation / welcome email
  const sendClientConfirmationEmail = async ({
    recipientEmail,
    recipientName,
    subject,
    serviceTitle,
    summaryDetails,
    ticketId,
  }: {
    recipientEmail: string;
    recipientName: string;
    subject?: string;
    serviceTitle: string;
    summaryDetails?: Record<string, string | undefined>;
    ticketId?: string;
  }) => {
    if (!emailTransporter || !recipientEmail || !process.env.SMTP_USER) {
      return;
    }

    const nameDisplay = recipientName && recipientName.trim() ? recipientName.trim() : "Valued Founder";
    const detailsHtml = summaryDetails
      ? Object.entries(summaryDetails)
          .filter(([_, v]) => v !== undefined && v !== null && v !== "")
          .map(
            ([k, v]) =>
              `<tr><td style="padding:10px 14px;font-weight:600;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9;width:140px;">${k}</td><td style="padding:10px 14px;color:#0f172a;font-size:13px;border-bottom:1px solid #f1f5f9;font-weight:500;">${v}</td></tr>`
          )
          .join("")
      : "";

    const appUrl = process.env.APP_URL || "https://incroute.com";

    try {
      await emailTransporter.sendMail({
        from: `"INCroute Legal & Corporate Advisory" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        replyTo: process.env.NOTIFICATION_TO || process.env.SMTP_USER,
        subject: subject || `Thank You for Connecting with INCroute [Ref: #${ticketId || "INCR"}]`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>INCroute Confirmation</title>
          </head>
          <body style="margin:0;padding:24px 12px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);">
              
              <!-- Brand Header -->
              <div style="background:linear-gradient(135deg, #0b0f19 0%, #1e1b4b 100%);padding:36px 32px;text-align:left;border-bottom:3px solid #d4af37;">
                <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                  INC<span style="color:#d4af37;font-style:italic;">route</span>
                </div>
                <p style="margin:6px 0 0 0;color:#94a3b8;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">
                  Corporate Registrations • Legal & Statutory Advisory
                </p>
              </div>

              <!-- Main Content Body -->
              <div style="padding:36px 32px;">
                <h1 style="margin:0 0 16px 0;color:#0f172a;font-size:22px;font-weight:800;line-height:1.3;">
                  Hello ${nameDisplay},
                </h1>
                
                <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.6;">
                  Thank you for reaching out to <strong>INCroute</strong>. We have successfully logged your request regarding <strong>${serviceTitle}</strong>.
                </p>

                ${
                  ticketId
                    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px 18px;border-radius:10px;margin:20px 0;font-size:13px;color:#166534;display:flex;align-items:center;justify-content:space-between;">
                        <span>Inquiry Tracking Reference:</span>
                        <strong style="font-family:monospace;font-size:14px;color:#15803d;">#${ticketId}</strong>
                       </div>`
                    : ""
                }

                ${
                  detailsHtml
                    ? `<div style="margin:24px 0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                        <div style="background:#f8fafc;padding:10px 16px;font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid #e2e8f0;">
                          Summary of Submission
                        </div>
                        <table style="width:100%;border-collapse:collapse;">
                          <tbody>${detailsHtml}</tbody>
                        </table>
                      </div>`
                    : ""
                }

                <!-- Roadmap / Next Steps -->
                <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px;margin:28px 0;">
                  <h2 style="margin:0 0 10px 0;font-size:14px;color:#6b21a8;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">
                    ⚡ What Happens Next?
                  </h2>
                  <ul style="margin:0;padding-left:20px;color:#475569;font-size:13.5px;line-height:1.7;">
                    <li>A dedicated statutory legal specialist is reviewing your requirements.</li>
                    <li>We will reach out to you within <strong>15–30 minutes</strong> during working hours (Mon–Sat, 9:30 AM – 7:30 PM IST).</li>
                    <li>You will receive clear step-by-step guidance, pricing breakdown, and document checklists.</li>
                  </ul>
                </div>

                <!-- Instant WhatsApp Direct Reachout -->
                <div style="text-align:center;margin:32px 0 12px 0;padding:24px;background:#f8fafc;border-radius:12px;border:1px dashed #cbd5e1;">
                  <p style="margin:0 0 14px 0;font-size:14px;color:#334155;font-weight:600;">
                    Have an urgent question or need immediate filing?
                  </p>
                  <a href="https://wa.me/918707552183?text=Hi%20INCroute%20Team%2C%20I%20just%20submitted%20an%20inquiry%20for%20${encodeURIComponent(serviceTitle)}%20(Ref:%20${ticketId || "General"})" 
                     target="_blank"
                     style="display:inline-block;background:#25D366;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;box-shadow:0 4px 12px rgba(37,211,102,0.25);">
                    💬 Connect on WhatsApp (+91 87075 52183)
                  </a>
                </div>
              </div>

              <!-- Helpful Knowledge Links -->
              <div style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;">
                <div style="font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
                  📘 Free Founder & Compliance Hub
                </div>
                <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
                  Check out our statutory compliance calendars, entity comparison guides, and AI company name checker at 
                  <a href="${appUrl}" target="_blank" style="color:#4f46e5;font-weight:600;text-decoration:none;"> incroute.com</a>.
                </p>
              </div>

              <!-- Professional Footer -->
              <div style="background:#0b0f19;padding:28px 32px;color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;">
                <p style="margin:0 0 6px 0;color:#f1f5f9;font-weight:700;font-size:13px;">INCroute Corporate Services & Legal Advisory</p>
                <p style="margin:0;color:#94a3b8;">Helpline: +91 87075 52183 &nbsp;•&nbsp; Support: info@incroute.com</p>
                <p style="margin:12px 0 0 0;font-size:11px;color:#64748b;">
                  This is an automated confirmation sent to ${recipientEmail}.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log(`[Client Confirmation Sent] -> ${recipientEmail}`);
    } catch (clientMailErr: any) {
      console.warn("[Client Confirmation Email Warning]:", clientMailErr.message);
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

      // Failsafe local JSON backup
      try {
        const subFile = path.join(process.cwd(), "submissions.json");
        let list: any[] = [];
        if (fs.existsSync(subFile)) {
          try { list = JSON.parse(fs.readFileSync(subFile, "utf-8")); } catch {}
        }
        list.unshift({
          id,
          name,
          email,
          phone,
          service: service || "Corporate Advisory",
          message,
          timestamp: new Date().toISOString()
        });
        fs.writeFileSync(subFile, JSON.stringify(list.slice(0, 100), null, 2), "utf-8");
      } catch (err: any) {
        console.warn("[Failsafe Lead File Warning]:", err.message);
      }

      // 1. Admin lead alert
      await sendLeadNotification(`🏆 New Contact Lead: ${name}`, "New Contact Form Submission", {
        "Full Name": name,
        "Email Address": email,
        "Phone Number": phone || "N/A",
        "Service Interested": service || "General Inquiry",
        "Message": message
      });

      // 2. Client welcome & confirmation email
      await sendClientConfirmationEmail({
        recipientEmail: email,
        recipientName: name,
        serviceTitle: service || "Corporate & Compliance Advisory",
        ticketId: id.toUpperCase(),
        summaryDetails: {
          "Service": service || "General Inquiry",
          "Contact Number": phone || "N/A",
          "Submitted Message": message
        }
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

      // 1. Admin notification
      await sendLeadNotification(`🔥 New Free Consultation Lead: ${phone}`, "New Lead Captured", {
        "Name": name || "Founder",
        "Phone Number": phone,
        "Entity Type": entityType || "Not Specified",
        "Email": email || "N/A",
        "Source": source || "Website Lead Form"
      });

      // 2. Client confirmation email (if email provided)
      if (email && email.includes("@")) {
        await sendClientConfirmationEmail({
          recipientEmail: email,
          recipientName: name || "Founder",
          serviceTitle: `Free 1-on-1 CA Consultation (${entityType || "Startup"})`,
          ticketId: id.toUpperCase(),
          summaryDetails: {
            "Phone Number": phone,
            "Proposed Structure": entityType || "Standard Incorporation",
            "Offer": "Free 1-on-1 CA Consultation & Startup Blueprint"
          }
        });
      }

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

      // 1. Admin notification
      await sendLeadNotification(`📄 New Career Application: ${name} (${position || "Applicant"})`, "New Career Application", {
        "Applicant Name": name,
        "Email Address": email,
        "Phone Number": phone,
        "Position": position || role || "Applicant",
        "Resume Link": resumeLink || "N/A",
        "Attached File": fileName || "N/A",
        "Cover Note / Details": details || "N/A"
      });

      // 2. Candidate acknowledgment email
      await sendClientConfirmationEmail({
        recipientEmail: email,
        recipientName: name,
        subject: `Application Received: ${position || "Legal Associate"} at INCroute [Ref: #${id.toUpperCase()}]`,
        serviceTitle: `Career Application (${position || "Legal Associate"})`,
        ticketId: id.toUpperCase(),
        summaryDetails: {
          "Applied Role": position || role || "Associate",
          "Contact Phone": phone,
          "Resume": fileName || resumeLink || "Profile submitted"
        }
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

      // 1. Admin notification
      await sendLeadNotification(`⚡ Custom Drafting / Enterprise Request: ${companyName || email}`, "Custom Legal Drafting Request", {
        "Request ID": id,
        "Name": fullName || "Client",
        "Email Address": email,
        "Phone Number": phone,
        "Document / Company": companyName || "N/A",
        "Preferred Time": preferredTime || "Anytime",
        "Notes / Instructions": notes || "None"
      });

      // 2. Client drafting confirmation email
      await sendClientConfirmationEmail({
        recipientEmail: email,
        recipientName: fullName || "Client",
        subject: `Custom Legal Drafting Request Received: ${companyName || "Draft"} [Ref: #${id}]`,
        serviceTitle: `Custom Legal Drafting (${companyName || "Statutory Document"})`,
        ticketId: id,
        summaryDetails: {
          "Document Title": companyName || "Statutory Template",
          "Phone Number": phone,
          "Preferred Time": preferredTime || "Anytime",
          "Special Requests": notes || "None"
        }
      });

      res.json({ success: true, message: "Drafting request received successfully.", requestId: id });
    } catch (err: any) {
      console.error("[Premium Request Error]:", err);
      res.status(500).json({ error: "Failed to process premium request" });
    }
  });

  return router;
}
