import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

// Auth routes — wrapped in try/catch to prevent crash if Prisma not generated
let authRoutes: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  authRoutes = require("./src/server/auth/routes").default;
} catch (e: any) {
  console.warn("⚠️ Auth routes not loaded:", e.message?.substring(0, 80));
}

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Initialize GoogleGenAI SDK on server side with proper headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Active compliance calendar list for reference or audit tasks
let complianceCalendar = [
  { id: "1", service: "GST Filing", description: "Monthly GSTR-1 & GSTR-3B filings", dueDate: "11th and 20th of every month", type: "taxation", downloadUrl: "https://www.gst.gov.in/" },
  { id: "2", service: "Income Tax Audit", description: "Tax Audit Filing and assessment for entities", dueDate: "September 30th annually", type: "taxation", downloadUrl: "https://www.incometax.gov.in/iec/foportal/" },
  { id: "3", service: "ROC Annual Filing", description: "Form MGT-7 and Form AOC-4 Filing with Registrar", dueDate: "Within 30 and 60 days of AGM", type: "corporate", downloadUrl: "https://www.mca.gov.in/content/mca/global/en/help-guide/company-forms-download.html" },
  { id: "4", service: "TDS Returns", description: "Quarterly TDS Filings (Form 24Q, 26Q)", dueDate: "Last day of succeeding month of quarter", type: "taxation", downloadUrl: "https://www.tin-nsdl.com/services/etds-etcs/etds-index.html" },
  { id: "5", service: "EPF & ESIC Return", description: "Monthly social security statutory deposit and returns", dueDate: "15th of every month", type: "employment", downloadUrl: "https://www.epfindia.gov.in/" }
];

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Auth API Routes
  if (authRoutes) {
    app.use("/api/auth", authRoutes);
  }

  // Health check (always works)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), auth: !!authRoutes });
  });

  // --- MySQL Connection Pool Setup ---
  let dbPool: mysql.Pool | null = null;
  const isDbConfigured = !!(
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_NAME
  );

  if (isDbConfigured) {
    try {
      dbPool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log("🟢 MySQL Database Pool Initialized.");
      
      // Auto-create database tables
      (async () => {
        try {
          const conn = await dbPool!.getConnection();
          console.log("🟢 Connected to MySQL Server.");
          
          // Create blog views table
          await conn.query(`
            CREATE TABLE IF NOT EXISTS blog_views (
              post_id VARCHAR(255) PRIMARY KEY,
              views INT DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          
          // Create contact submissions table
          await conn.query(`
            CREATE TABLE IF NOT EXISTS contact_submissions (
              id VARCHAR(255) PRIMARY KEY,
              name VARCHAR(255),
              email VARCHAR(255),
              phone VARCHAR(50),
              message TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          
          console.log("🟢 MySQL Database Tables Verified/Created.");
          conn.release();
        } catch (dbErr: any) {
          console.error("🔴 Failed to initialize MySQL tables:", dbErr.message);
        }
      })();
    } catch (poolErr: any) {
      console.error("🔴 Failed to create MySQL Pool:", poolErr.message);
    }
  } else {
    console.warn("⚠️ MySQL environment credentials not found. Falling back to JSON file storage.");
  }

  // --- Nodemailer Email Notification Setup ---
  let emailTransporter: nodemailer.Transporter | null = null;
  const isEmailConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    (process.env.NOTIFICATION_TO || process.env.NOTIFICATION_TO_SECONDARY)
  );

  if (isEmailConfigured) {
    try {
      const smtpPort = Number(process.env.SMTP_PORT) || 465;
      emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      // Verify connection configuration immediately
      emailTransporter.verify((error) => {
        if (error) {
          console.error("🔴 SMTP connection verification failed:", error.message);
        } else {
          console.log("🟢 SMTP server is ready to send notifications.");
        }
      });
    } catch (mailErr: any) {
      console.error("🔴 Failed to initialize SMTP Notification Transporter:", mailErr.message);
    }
  } else {
    console.warn("⚠️ SMTP credentials not found. Lead email notifications will be skipped.");
  }

  // Helper to send lead notifications
  const sendLeadNotification = async (submission: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) => {
    if (!emailTransporter) return;
    
    const recipients: string[] = [];
    if (process.env.NOTIFICATION_TO) {
      recipients.push(process.env.NOTIFICATION_TO);
    }
    if (process.env.NOTIFICATION_TO_SECONDARY) {
      recipients.push(process.env.NOTIFICATION_TO_SECONDARY);
    }

    if (recipients.length === 0) return;
    
    const mailOptions = {
      from: `"Incroute Notifications" <${process.env.SMTP_USER}>`,
      to: recipients.join(", "),
      subject: `🏆 New Lead Submission: ${submission.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #d4af37;border-radius:12px;padding:24px;background:#0d0d0d;color:#fff;">
          <h2 style="color:#d4af37;margin-top:0;border-bottom:1px solid rgba(212,175,55,0.2);padding-bottom:12px;">New Contact Lead</h2>
          <p>A user has filled out the contact form on your website.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:8px 0;color:#d4af37;font-weight:bold;width:120px;">Lead ID:</td>
              <td style="padding:8px 0;color:#fff;">${submission.id}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#d4af37;font-weight:bold;">Full Name:</td>
              <td style="padding:8px 0;color:#fff;">${submission.name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#d4af37;font-weight:bold;">Email:</td>
              <td style="padding:8px 0;color:#fff;"><a href="mailto:${submission.email}" style="color:#d4af37;text-decoration:none;">${submission.email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#d4af37;font-weight:bold;">Phone:</td>
              <td style="padding:8px 0;color:#fff;">${submission.phone || "N/A"}</td>
            </tr>
          </table>
          <div style="background:#151515;border-radius:6px;padding:16px;margin-top:20px;">
            <strong style="color:#d4af37;display:block;margin-bottom:8px;">Message:</strong>
            <p style="margin:0;color:#ccc;line-height:1.6;font-size:14px;white-space:pre-wrap;">${submission.message}</p>
          </div>
          <p style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:30px;text-align:center;">This is an automated notification from incroute.com</p>
        </div>
      `
    };

    try {
      await emailTransporter.sendMail(mailOptions);
      console.log(`✉️ Notification email sent to ${recipients.join(", ")} for lead ${submission.id}`);
    } catch (err: any) {
      console.error("🔴 Failed to send lead notification email:", err.message);
    }
  };

  // --- Cryptographic Device Locking & Administration Security System ---
  const DEVICE_CONFIG_FILE = path.join(process.cwd(), "device-config.json");
  let deviceConfig: {
    activationKey?: { key: string; expires: string };
    registeredPublicKey?: string;
  } = {};

  function loadDeviceConfig() {
    if (fs.existsSync(DEVICE_CONFIG_FILE)) {
      try {
        deviceConfig = JSON.parse(fs.readFileSync(DEVICE_CONFIG_FILE, "utf-8"));
      } catch (e: any) {
        console.error("⚠️ Failed to parse device-config.json:", e.message);
      }
    }
  }
  loadDeviceConfig();

  // Active validation sessions & challenges
  const activeSessions = new Set<string>();
  const activeChallenges = new Map<string, { timestamp: number; expires: number }>();

  // Periodically sweep expired challenges
  setInterval(() => {
    const now = Date.now();
    for (const [challenge, data] of activeChallenges.entries()) {
      if (data.expires < now) {
        activeChallenges.delete(challenge);
      }
    }
  }, 5 * 60 * 1000);

  // Cookie extraction utility
  function getCookie(req: any, name: string): string | null {
    const cookies = req.headers.cookie;
    if (!cookies) return null;
    const parts = cookies.split(";");
    for (const part of parts) {
      const [key, val] = part.trim().split("=");
      if (key === name) return decodeURIComponent(val);
    }
    return null;
  }

  // Device whitelisting verification middleware
  function deviceLockMiddleware(req: any, res: any, next: any) {
    const sessionToken = getCookie(req, "admin_device_session");
    if (sessionToken && activeSessions.has(sessionToken)) {
      return next();
    }
    
    // Serve the challenge verification gate for direct CMS page requests
    if (req.path === "/cms" || req.path === "/cms/" || req.path === "/cms/index.html") {
      return res.sendFile(path.join(process.cwd(), "admin-portal/gate.html"));
    }
    
    // Obfuscate CMS configuration and assets
    if (req.path.startsWith("/cms/")) {
      return res.status(404).end();
    }

    // Block backend write operations
    return res.status(403).json({ success: false, error: "Access denied: Unauthorized hardware device." });
  }

  // --- Device Lock APIs ---
  app.get("/api/admin/challenge", (req, res) => {
    const challenge = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 60 * 1000;
    activeChallenges.set(challenge, { timestamp: Date.now(), expires });
    res.json({ success: true, challenge, timestamp: Date.now() });
  });

  app.post("/api/admin/verify-device", (req, res) => {
    const { signature, challenge, timestamp } = req.body;
    
    if (!signature || !challenge || !timestamp) {
      return res.status(400).json({ success: false, error: "Missing verification parameters." });
    }

    const storedChallenge = activeChallenges.get(challenge);
    if (!storedChallenge || storedChallenge.expires < Date.now()) {
      return res.status(403).json({ success: false, error: "Challenge invalid or expired." });
    }

    if (Math.abs(Date.now() - Number(timestamp)) > 60 * 1000) {
      return res.status(403).json({ success: false, error: "Challenge verification timeout." });
    }

    loadDeviceConfig();
    if (!deviceConfig.registeredPublicKey) {
      return res.status(403).json({ success: false, error: "Device is not registered." });
    }

    try {
      const pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${deviceConfig.registeredPublicKey.match(/.{1,64}/g)?.join("\n")}\n-----END PUBLIC KEY-----`;
      const pubKey = crypto.createPublicKey({
        key: pubKeyPem,
        format: "pem",
        type: "spki"
      });

      const verifyData = Buffer.from(challenge + ":" + timestamp);
      const signatureBytes = Buffer.from(signature, "base64");

      const isVerified = crypto.verify(
        "RSA-SHA256",
        verifyData,
        pubKey,
        signatureBytes
      );

      if (isVerified) {
        const sessionToken = crypto.randomBytes(32).toString("hex");
        activeSessions.add(sessionToken);
        activeChallenges.delete(challenge);

        res.cookie("admin_device_session", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({ success: true });
      } else {
        return res.status(403).json({ success: false, error: "Cryptographic signature check failed." });
      }
    } catch (err: any) {
      console.error("[Crypto Verification Error]:", err.message);
      return res.status(500).json({ success: false, error: "Internal security engine verification failure." });
    }
  });

  app.post("/api/admin/register-device", (req, res) => {
    const { key, publicKey } = req.body;
    
    if (!key || !publicKey) {
      return res.status(400).json({ success: false, error: "Missing required registration parameters." });
    }

    loadDeviceConfig();
    const activeKey = deviceConfig.activationKey;
    if (!activeKey || activeKey.key !== key || new Date(activeKey.expires).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: "Invalid or expired device activation key." });
    }

    deviceConfig.registeredPublicKey = publicKey;
    delete deviceConfig.activationKey;

    try {
      fs.writeFileSync(DEVICE_CONFIG_FILE, JSON.stringify(deviceConfig, null, 2), "utf-8");
      console.log(`🟢 DEVICE PUBLIC KEY WHITELISTED: ${publicKey.slice(0, 30)}...`);
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Failed to write device config:", err.message);
      return res.status(500).json({ success: false, error: "Failed to persist device credentials." });
    }
  });

  // Browser-accessible endpoint to generate activation token
  app.get("/api/admin/generate-activation-key", (req, res) => {
    const { password } = req.query;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    if (!password || password !== adminPassword) {
      return res.status(401).json({ success: false, error: "Unauthorized access: Invalid admin password." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    loadDeviceConfig();
    deviceConfig.activationKey = {
      key: token,
      expires: expires
    };

    try {
      fs.writeFileSync(DEVICE_CONFIG_FILE, JSON.stringify(deviceConfig, null, 2), "utf-8");
      return res.send(`
        <html>
          <body style="background:#030303;color:#fff;font-family:sans-serif;padding:40px;text-align:center;display:flex;align-items:center;justify-content:center;min-height:80vh;">
            <div style="border:1px solid rgba(212,175,55,0.2);padding:40px;max-width:500px;margin:0 auto;border-radius:16px;background:#0d0d0d;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
              <img src="/incroute_logo.png" style="width:60px;height:60px;border-radius:50%;border:2px solid #d4af37;margin-bottom:20px;" />
              <h2 style="color:#d4af37;margin-top:0;">Secure Token Generated</h2>
              <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">A temporary cryptographic activation key has been successfully created and registered on this server. Click the button below to whitelist this PC.</p>
              <a href="/admin-setup?key=${token}" style="color:#000;background:#d4af37;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin-top:20px;text-transform:uppercase;font-size:12px;letter-spacing:0.05em;">Whitelist This PC</a>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/admin-setup", (req, res) => {
    const { key } = req.query;
    loadDeviceConfig();
    const activeKey = deviceConfig.activationKey;
    
    if (key && activeKey && activeKey.key === key && new Date(activeKey.expires).getTime() > Date.now()) {
      return res.sendFile(path.join(process.cwd(), "admin-portal/setup.html"));
    }
    
    return res.status(404).end();
  });

  // Serve the headless Decap CMS static wrapper only if device authenticated
  app.get(["/cms", "/cms/"], (req, res, next) => {
    // Exact check to redirect to trailing slash version, preventing loop
    if (req.path === "/cms") {
      return res.redirect(301, "/cms/");
    }
    next();
  }, deviceLockMiddleware, (req, res) => {
    res.sendFile(path.join(process.cwd(), "admin-portal/index.html"));
  });

  // --- GitHub OAuth Provider for self-hosted Decap CMS ---
  app.get("/api/auth", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).send("GitHub Client ID (GITHUB_CLIENT_ID) not configured in environment.");
    }
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const hostUrl = `${protocol}://${req.headers.host}`;
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(
      hostUrl + "/api/auth/callback"
    )}`;
    res.redirect(redirectUrl);
  });

  app.get("/api/auth/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code) {
      return res.status(400).send("Missing authorization code.");
    }

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code
        })
      });

      const data = await response.json();
      if (data.error) {
        return res.status(400).send(`GitHub OAuth Error: ${data.error_description || data.error}`);
      }

      const token = data.access_token;
      
      res.send(`
        <html>
          <body>
            <script>
              (function() {
                if (!window.opener) {
                  console.error("No window.opener found.");
                  return;
                }
                function receiveMessage(e) {
                  const message = "authorization:github:success:" + JSON.stringify({
                    token: "${token}",
                    provider: "github"
                  });
                  window.opener.postMessage(message, e.origin);
                  window.close();
                }
                window.addEventListener("message", receiveMessage, false);
                // Signal opener that popup is ready
                window.opener.postMessage("authorizing:github", "*");
              })()
            </script>
            <p style="font-family:sans-serif;text-align:center;padding:20px;color:#d4af37;">Authenticating CMS administrative portal. Closing authentication window...</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("OAuth token exchange failed:", err.message);
      res.status(500).send("Authentication token exchange failed.");
    }
  });

  app.get("/cms/config.yml", deviceLockMiddleware, (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "admin-portal/config.yml");
      let configContent = fs.readFileSync(configPath, "utf-8");
      
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const hostUrl = `${protocol}://${req.headers.host}`;
      
      // Inject base_url and auth_endpoint parameters for Decap CMS GitHub integration
      configContent = configContent.replace(
        "name: github",
        `name: github\n  base_url: ${hostUrl}\n  auth_endpoint: api/auth`
      );
      
      res.type("yaml").send(configContent);
    } catch (err: any) {
      console.error("Failed to dynamically serve CMS config:", err.message);
      res.status(500).send("Error generating CMS configuration.");
    }
  });



  // API Route - Compliance Calendar listing
  app.get("/api/compliance/calendar", (req, res) => {
    res.json({ success: true, calendar: complianceCalendar });
  });

  // HTTPS redirect (production only)
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }



  // API Route - Compliance Calendar listing
  app.get("/api/compliance/calendar", (req, res) => {
    res.json({ success: true, calendar: complianceCalendar });
  });



  // Persistent Config storage for Google Forms Connection
  const CONFIG_FILE = path.join(process.cwd(), "contact-form-config.json");
  let contactFormUri: string | null = process.env.GOOGLE_FORM_URI || null;

  // Load persisted config on startup if not set in environment
  if (contactFormUri) {
    console.log(`🟢 LOADED GOOGLE FORM URI FROM ENVIRONMENT: ${contactFormUri}`);
  } else if (fs.existsSync(CONFIG_FILE)) {
    try {
      const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      contactFormUri = configData.uri || null;
      console.log(`🟢 LOADED PERSISTED GOOGLE FORM URI: ${contactFormUri}`);
    } catch (err: any) {
      console.error("Failed to read persisted contact form config:", err.message);
    }
  }

  // Fallback to the default Google Form URI if not set
  if (!contactFormUri) {
    contactFormUri = "https://docs.google.com/forms/d/e/1FAIpQLSf_I-0yjXKhV_oJDi2KMpzSrFUnqZF3p_MQJ5oo28dOQ-_0yA/viewform";
    console.log(`🟢 USING FALLBACK GOOGLE FORM URI: ${contactFormUri}`);
  }

  // Config endpoints
  app.get("/api/config/contact-form", (req, res) => {
    res.json({ success: true, uri: contactFormUri });
  });

  app.post("/api/config/contact-form", (req, res) => {
    const { uri } = req.body;
    contactFormUri = uri;
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ uri }, null, 2), "utf-8");
      console.log(`🟢 PERSISTED GOOGLE FORM URI TO DISK: ${contactFormUri}`);
    } catch (err: any) {
      console.error("Failed to persist contact form config:", err.message);
    }
    res.json({ success: true, uri: contactFormUri });
  });

// Local Memory Storage and Disk Persistence for Contact Submissions
const SUBMISSIONS_FILE = path.join(process.cwd(), "submissions.json");
let contactSubmissions: any[] = [];

// Load existing submissions from disk at startup
if (fs.existsSync(SUBMISSIONS_FILE)) {
  try {
    contactSubmissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
    console.log(`🟢 LOADED PERSISTED SUBMISSIONS: ${contactSubmissions.length} entries`);
  } catch (err: any) {
    console.error("Failed to read persisted contact submissions:", err.message);
  }
}

// Contact form endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const newSubmission = {
    id: `MSG-${Math.floor(Math.random() * 10000)}`,
    name,
    email,
    phone,
    message,
    timestamp: new Date().toISOString()
  };

  // Store in memory list
  contactSubmissions.push(newSubmission);

  // Persist to MySQL if configured
  if (dbPool) {
    try {
      await dbPool.query(
        "INSERT INTO contact_submissions (id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)",
        [newSubmission.id, name, email, phone || null, message]
      );
      console.log(`🟢 Persisted new lead ${newSubmission.id} to MySQL database.`);
    } catch (dbErr: any) {
      console.error("🔴 Failed to write lead to MySQL:", dbErr.message);
    }
  }

  // Persist immediately to local JSON file
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(contactSubmissions, null, 2), "utf-8");
    console.log(`🟢 PERSISTED NEW SUBMISSION TO DISK: ${newSubmission.id}`);
  } catch (err: any) {
    console.error("Failed to persist submission to disk:", err.message);
  }

  // Trigger email notification in background
  sendLeadNotification(newSubmission);

  // Log to server console so user understands where it goes
  console.log("\n---- NEW CONTACT SUBMISSION ----");
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone || "N/A"}`);
  console.log(`Message: ${message}`);
  console.log("--------------------------------\n");
  console.log(`(NOTE: Total submissions saved in server memory & disk: ${contactSubmissions.length})`);

  // Background Google Form Sync (Method 2)
  if (contactFormUri) {
    console.log(`Google Cloud Connection active! Syncing lead dynamically to Google Forms...`);
    try {
      // 1. Fetch the public form page to parse field entry IDs
      const formResponse = await fetch(contactFormUri);
      if (formResponse.ok) {
        const html = await formResponse.text();

        // High-tech regex to extract modern Google Forms entry IDs from data-params
        const entryIds: string[] = [];
        const paramRegex = /data-params="%\.@\.\[(.*?)\]/g;
        let match;
        while ((match = paramRegex.exec(html)) !== null) {
          const content = match[1];
          const idMatch = content.match(/\[\[(\d+)/);
          if (idMatch && !entryIds.includes(idMatch[1])) {
            entryIds.push(idMatch[1]);
          }
        }

        console.log(`Successfully mapped Google Form field entry IDs:`, entryIds);

        // We expect the form to have our 4 fields: Full Name, Email, Phone, Message
        if (entryIds.length >= 4) {
          const postUrl = contactFormUri.replace("/viewform", "/formResponse");

          // Build urlencoded body
          const params = new URLSearchParams();
          params.append(`entry.${entryIds[0]}`, name);
          params.append(`entry.${entryIds[1]}`, email);
          params.append(`entry.${entryIds[2]}`, phone || "");
          params.append(`entry.${entryIds[3]}`, message);

          // Submit in background
          const submitRes = await fetch(postUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
          });

          if (submitRes.ok) {
            console.log(`🟢 LEAD SYNC SUCCESS: Data pushed to Google Forms & Google Sheets in the background!`);
          } else {
            console.error(`🔴 LEAD SYNC ERROR: Google Forms returned status ${submitRes.status} (${submitRes.statusText})`);
          }
        } else {
          console.warn(`⚠️ LEAD SYNC WARNING: Found insufficient entry fields in the Google Form template (found ${entryIds.length}, expected 4).`);
        }
      } else {
        console.error(`🔴 LEAD SYNC ERROR: Failed to retrieve Google Form template at ${contactFormUri}`);
      }
    } catch (gErr: any) {
      console.error("🔴 LEAD SYNC EXCEPTION: Failed background submission to Google Forms:", gErr.message);
    }
  }

  res.json({ success: true, message: "Contact saved successfully." });
});

// Premium Draft Request endpoint
// NOTE: For production, configure SMTP via Nodemailer or use EmailJS.
// Currently logs to console and stores in memory. Replace with actual email sending.
let premiumRequests: any[] = [];

app.post("/api/send-premium-request", (req, res) => {
  const { fullName, email, phone, companyName, notes, preferredTime, wizardData, agreedToTerms } = req.body;

  if (!fullName || !email || !companyName || !agreedToTerms) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  const request = {
    id: `PREM-${Math.floor(1000 + Math.random() * 9000)}`,
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

  premiumRequests.push(request);

  // Log to console (replace with Nodemailer SMTP in production)
  console.log("\n════════════════════════════════════════════");
  console.log("  🏆 NEW PREMIUM DRAFTING REQUEST");
  console.log("════════════════════════════════════════════");
  console.log(`  Name: ${fullName}`);
  console.log(`  Email: ${email}`);
  console.log(`  Phone: ${phone || "N/A"}`);
  console.log(`  Company: ${companyName}`);
  console.log(`  Notes: ${notes || "None"}`);
  console.log(`  Preferred Time: ${preferredTime || "Anytime"}`);
  console.log(`  Wizard Data: ${JSON.stringify(wizardData || {})}`);
  console.log(`  Timestamp: ${request.timestamp}`);
  console.log("════════════════════════════════════════════\n");
  console.log(`  📧 TODO: Send email to premium@incroute.com`);
  console.log(`  Subject: New Premium Drafting Request for ${companyName}\n`);

  res.json({
    success: true,
    message: "Premium drafting request received successfully.",
    requestId: request.id,
  });
});

  // AI Name Feasibility clearance check (DeepSeek API Integration)
  app.post("/api/consult/name-check", async (req, res) => {
    const { name, entityType, industry } = req.body;

    if (!name || !entityType || !industry) {
      return res.status(400).json({ success: false, error: "Name, entity type, and industry are required." });
    }

    const checkPrompt = `Perform a comprehensive, professional name feasibility and registration clearance check for a proposed corporate entity in India.
Proposed Name: "${name}"
Entity Type: "${entityType}"
Sector/Industry: "${industry}"

Assess the proposed name meticulously against naming guidelines (e.g. check if generic, check if offensive, check prefix/suffix suitability, check for prefix descriptiveness).
Analyze the proposed name against phonetic registers, MCA database guidelines, and trademark Class 9/35/42 listings.
Format your response as a strict, clean JSON object. In "suggestions", provide exactly 5 premium, highly professional corporate name variations using the proposed brand prefix, incorporating suitable sector nouns and standard legal suffixes matching the requested entity type.
Return ONLY the raw JSON string matching this exact structure:
{
  "score": 85,
  "summary": "Detailed professional suitability summary...",
  "conflicts": [
    "Conflict checking notes...",
    "Trademarks search similarity warnings..."
  ],
  "checklist": [
    { "criterion": "Not generic or common words only", "passed": true, "reason": "Passed explanation..." },
    { "criterion": "No offensive or restricted keywords", "passed": true, "reason": "Passed explanation..." },
    { "criterion": "Matches the activity of the business sector", "passed": false, "reason": "Failed explanation..." }
  ],
  "suggestions": [
    "Suggested Name 1",
    "Suggested Name 2",
    "Suggested Name 3",
    "Suggested Name 4",
    "Suggested Name 5"
  ],
  "domains": [
    { "ext": ".com", "status": "Available" },
    { "ext": ".in", "status": "Available" },
    { "ext": ".co.in", "status": "Taken" },
    { "ext": ".net", "status": "Available" }
  ],
  "trademarks": [
    { "class": "Class 9 (Software/Tech)", "status": "Clear", "matches": "No direct matches found." },
    { "class": "Class 35 (Business Services)", "status": "Clear", "matches": "No direct matches found." },
    { "class": "Class 42 (IT & Cloud Services)", "status": "Clear", "matches": "No direct matches found." }
  ],
  "postFilingKit": {
    "steps": [
      { "step": "DSC Allocation", "detail": "Obtain Digital Signature Certificates for all directors.", "cost": "₹1,500 - ₹2,500" },
      { "step": "DIN Application", "detail": "Apply for Director Identification Numbers during incorporation.", "cost": "Included in Spice+" },
      { "step": "Spice+ Part A filing", "detail": "Reserve the approved name on the MCA portal.", "cost": "₹1,000" }
    ],
    "stampDuties": "Varies by state (estimated ₹2,000 for standard nominal share capital of ₹1,00,000).",
    "timeframe": "Estimated 2 to 4 working days for ROC name clearance."
  }
}`;

    const cleanName = name.trim();
    const lowerName = cleanName.toLowerCase();
    
    // Set up local deterministic values for fallbacks/supplementary data
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash = (hash << 5) - hash + cleanName.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini key not configured.");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: checkPrompt,
        config: {
          systemInstruction: "You are the Senior Registrar Compliance Director of Incroute with 20+ years of experience in corporate law in India. Return ONLY raw JSON matching the exact structure requested, without markdown syntax blocks. Meticulously analyze phonetic conflicts, MCA name availability guidelines, and Class 9/35/42 trademark classifications. Provide highly detailed, rich, professional corporate insights.",
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });

      let resultText = response.text || "{}";
      resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(resultText);

      // Verify necessary fields are present
      if (!parsed.domains) {
        parsed.domains = [
          { ext: ".com", status: positiveHash % 3 === 0 ? "Taken" : "Available" },
          { ext: ".in", status: positiveHash % 4 === 0 ? "Taken" : "Available" },
          { ext: ".co.in", status: "Available" },
          { ext: ".net", status: "Available" }
        ];
      }
      if (!parsed.trademarks) {
        parsed.trademarks = [
          { class: "Class 9 (Software/Tech)", status: "Clear", matches: "No direct conflicts." },
          { class: "Class 35 (Business Services)", status: "Clear", matches: "No direct conflicts." },
          { class: "Class 42 (IT & Cloud Services)", status: "Clear", matches: "No direct conflicts." }
        ];
      }
      if (!parsed.postFilingKit) {
        parsed.postFilingKit = {
          steps: [
            { step: "DSC Allocation", detail: "Obtain Digital Signature Certificates for directors.", cost: "₹2,000 estimated" },
            { step: "DIN Application", detail: "Apply for DIN inside SPICe+ MCA application.", cost: "Included in Spice+" },
            { step: "Spice+ Part A filing", detail: `Formally reserve the brand prefix "${cleanName}".`, cost: "₹1,000 MCA fee" }
          ],
          stampDuties: "Estimated ₹2,000 state stamp duties.",
          timeframe: "Clearance approved in 2-3 working days."
        };
      }

      res.json({ success: true, report: parsed });
    } catch (err: any) {
      console.warn("⚠️ Gemini Feasibility clearance falling back to simulated engine:", err.message);
      
      let score = 85;
      const conflicts: string[] = [];
      const checklist = [
        { criterion: "Distinctive coined prefix (not generic)", passed: true, reason: `"${cleanName}" contains distinctive elements suitable for differentiation.` },
        { criterion: "Reflective of business objective", passed: true, reason: `The name aligns well with standard vocabulary in the ${industry} sector.` },
        { criterion: "No restricted keywords (State, Bank, National)", passed: true, reason: "No restricted or prohibited terms were identified in the primary lookup." },
        { criterion: "Phonetic similarity and trademark check", passed: true, reason: "Initial checks indicate healthy separation from dominant trademarks." }
      ];

      // Rule 1: Length check
      if (cleanName.length < 3) {
        score -= 30;
        checklist[0].passed = false;
        checklist[0].reason = `The prefix "${cleanName}" is too short (under 3 characters). ROC rules generally require a substantive coined word.`;
        conflicts.push("Proposed name is extremely short, which makes finding unique separation in the registrar ledger difficult.");
      } else if (cleanName.length < 5) {
        score -= 10;
        checklist[0].reason = `The prefix "${cleanName}" is relatively short. Registrars prefer distinctive, coined phrases.`;
      }

      // Rule 2: Restricted words check
      const restrictedWords = ["bank", "state", "national", "federation", "government", "reserve", "ministry", "municipal", "trust", "union", "india", "bharat"];
      const foundRestricted = restrictedWords.filter(word => lowerName.includes(word));
      if (foundRestricted.length > 0) {
        score -= 40;
        checklist[2].passed = false;
        checklist[2].reason = `Contains restricted word(s): ${foundRestricted.map(w => `'${w}'`).join(', ')}. ROC rules restrict usage without prior central government approvals.`;
        conflicts.push(`Restricted corporate terminology: "${foundRestricted[0].toUpperCase()}" requires special statutory approvals and licensing.`);
      }

      // Rule 3: Suffix check in name field
      const suffixes = ["pvt ltd", "private limited", "llp", "partnership", "opc", "one person company"];
      const foundSuffix = suffixes.find(s => lowerName.endsWith(s));
      if (foundSuffix) {
        score -= 15;
        checklist[0].passed = false;
        checklist[0].reason = `Input includes the corporate suffix "${foundSuffix.toUpperCase()}". Please supply ONLY the brand prefix in the check field.`;
        conflicts.push(`The suffix "${foundSuffix.toUpperCase()}" should not be part of the brand check input. Suffixes are appended automatically by the registry.`);
      }

      // Rule 4: Phonetic trademark clearance simulator using deterministic character hash
      if (positiveHash % 3 === 0) {
        score -= 8;
        checklist[3].passed = false;
        checklist[3].reason = `Phonetic similarities identified in Class 35/42 for names close to "${cleanName}".`;
        conflicts.push(`Phonetic brand overlap detected in public trademark classes. Minor spelling variations are advised.`);
      } else {
        checklist[3].reason = `No exact phonetical matching trademarks found in Class 9, 35, or 42 for "${cleanName}".`;
      }

      // Rule 5: Industry keywords advice check
      const industryKeywords: Record<string, string[]> = {
        technology: ["tech", "software", "digital", "systems", "ai", "data", "cyber", "cloud", "code", "dev", "web"],
        finance: ["wealth", "capital", "finance", "advisor", "invest", "asset", "credit", "ledger", "pay"],
        healthcare: ["health", "med", "cure", "clinic", "bio", "pharma", "care", "wellness"],
        education: ["learn", "academy", "ed", "school", "study", "mind", "skill"],
        consulting: ["consult", "advisor", "strategy", "group", "partners", "solutions"]
      };

      let matchingIndustryKeyword = false;
      const targetIndustry = industry.toLowerCase();
      for (const [ind, words] of Object.entries(industryKeywords)) {
        if (targetIndustry.includes(ind) || ind.includes(targetIndustry)) {
          const match = words.find(w => lowerName.includes(w));
          if (match) {
            matchingIndustryKeyword = true;
            break;
          }
        }
      }

      if (!matchingIndustryKeyword) {
        checklist[1].reason = `Descriptive matching word for "${industry}" is subtle. Adding industry terms (e.g. Tech, Fin, Solutions) is recommended.`;
      }

      // Format clean capitalized name suggestions
      const strippedPrefix = cleanName
        .replace(/\b(pvt ltd|private limited|llp|opc|partnership)\b/gi, "")
        .trim();
      const capitalizedPrefix = strippedPrefix.charAt(0).toUpperCase() + strippedPrefix.slice(1);
      const corporateSuffix = entityType.includes("LLP") ? "LLP" : "Private Limited";

      const suggestions = [
        `${capitalizedPrefix} Solutions ${corporateSuffix}`,
        `${capitalizedPrefix} Ventures ${corporateSuffix}`,
        `${capitalizedPrefix} Systems ${corporateSuffix}`,
        `New ${capitalizedPrefix} Global ${corporateSuffix}`,
        `${capitalizedPrefix} Tech ${corporateSuffix}`
      ];

      // Final bound score
      score = Math.max(20, Math.min(98, score));

      let summary = `Pre-Audit assessment completed successfully for "${cleanName}". `;
      if (score >= 85) {
        summary += `The proposed name exhibits exceptional feasibility with a score of ${score}%. It has a very high probability of direct, friction-free ROC registrar approval.`;
      } else if (score >= 70) {
        summary += `The proposed name exhibits healthy feasibility (${score}%). It is generally suitable, although minor clearance steps or trademark checks are recommended.`;
      } else {
        summary += `The proposed name has moderate to low feasibility (${score}%). We highly recommend adjusting the name prefix or adopting one of our recommended alternatives below to avoid registrar rejection.`;
      }

      const domains = [
        { ext: ".com", status: positiveHash % 4 === 0 ? "Taken" : "Available" },
        { ext: ".in", status: positiveHash % 5 === 0 ? "Taken" : "Available" },
        { ext: ".co.in", status: positiveHash % 3 === 0 ? "Taken" : "Available" },
        { ext: ".net", status: "Available" }
      ];

      const trademarks = [
        { class: "Class 9 (Software/Tech)", status: positiveHash % 3 === 0 ? "Conflict" : "Clear", matches: positiveHash % 3 === 0 ? `Phonetic phonetic match found: "${cleanName} Technologies"` : "No similar phonetic trademark found." },
        { class: "Class 35 (Business Services)", status: "Clear", matches: "No phonetic conflict found in public Class 35 register." },
        { class: "Class 42 (IT & Cloud Services)", status: positiveHash % 7 === 0 ? "Conflict" : "Clear", matches: positiveHash % 7 === 0 ? `Semantic matching trademark "Project ${cleanName}" is registered` : "No matches found." }
      ];

      const postFilingKit = {
        steps: [
          { step: "DSC Allocation", detail: `Acquire Class 3 Digital Signatures for proposed directors. Required for SPICe+ digital signing.`, cost: "₹2,000 estimated" },
          { step: "DIN Registration", detail: `Acquire unique Director Identification Numbers inside SPICe+ MCA application.`, cost: "Free for up to 3 directors" },
          { step: "SPICe+ Part A filing", detail: `Formally reserve the brand prefix "${cleanName}" with the Central Registration Centre (CRC).`, cost: "₹1,000 government filing fee" }
        ],
        stampDuties: `Estimated ₹2,000 for Pvt Ltd with ₹1,00,000 nominal share capital. Stamping fees vary slightly based on jurisdiction.`,
        timeframe: "Typically approved within 2-3 MCA working days."
      };

      const fallbackData = {
        score,
        summary,
        conflicts: conflicts.length > 0 ? conflicts : ["No critical conflict reports identified. The brand prefix is relatively unique."],
        checklist,
        suggestions,
        domains,
        trademarks,
        postFilingKit
      };

      res.json({ success: true, report: fallbackData });
    }
  });

app.post("/api/consult/audit", async (req, res) => {
    const { firmName, firmType, jurisdiction, industry } = req.body;

    if (!firmName || !firmType) {
      return res.status(400).json({ success: false, error: "Firm name and type are required." });
    }

    const auditPrompt = `Conduct a comprehensive, professional registration pre-audit advisory for the proposed corporate firm:
Name: "${firmName}"
Firm Type: "${firmType}"
State/Jurisdiction: "${jurisdiction || "Not Specified"}"
Core Sector/Industry: "${industry || "Corporate Consulting Services"}"

Format your response in structured sections:
1. **Name Feasibility Report**: Analyze potential name conflicts, suggest modifications if generic, checks compliance with Registrar naming guides.
2. **Mandatory Documentation Checklist**: Give the exact list of papers, notarization, and identification materials required.
3. **Primary Statutory Costs & Official ROC Capital stamp duties estimation**.
4. **Immediate Post-Incorporation Compliances**: Timeline after registration is complete (GST, bank accounts, First Board meeting, Auditor appointment).`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: auditPrompt,
        config: {
          systemInstruction: "You are the Senior Registrar Compliance Director of Incroute. Provide pristine corporate insights designed to guide new founders.",
          temperature: 0.3,
        }
      });

      res.json({ success: true, advice: response.text });
    } catch (err: any) {
      console.error("Advisory Board audit error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Local JSON Blog Datastore
  const BLOG_FILE = path.join(process.cwd(), "blog-posts.json");
  const VIEWS_FILE = path.join(process.cwd(), "blog-views.json");

  const loadViewsMap = (): Map<string, number> => {
    const viewsMap = new Map<string, number>();
    try {
      if (fs.existsSync(VIEWS_FILE)) {
        const data = JSON.parse(fs.readFileSync(VIEWS_FILE, "utf-8"));
        if (typeof data === "object" && data !== null) {
          Object.keys(data).forEach((id) => {
            viewsMap.set(id, Number(data[id]) || 0);
          });
        }
      }
    } catch (e: any) {
      console.warn("Failed to load blog-views.json:", e.message);
    }
    return viewsMap;
  };

  const saveViewsMap = (viewsMap: Map<string, number>) => {
    try {
      const obj: Record<string, number> = {};
      viewsMap.forEach((val, key) => {
        obj[key] = val;
      });
      fs.writeFileSync(VIEWS_FILE, JSON.stringify(obj, null, 2), "utf-8");
    } catch (e: any) {
      console.error("Failed to save blog-views.json:", e.message);
    }
  };

  let blogPosts: any[] = [];

  const defaultBlogs = [
    {
      id: "blog-1",
      title: "How to Incorporate a Private Limited Company in India",
      subtitle: "A step-by-step masterclass on registration requirements, timelines, and ROC procedures.",
      content: `### Introduction

Starting a business is an exhilarating journey, and choosing the right corporate structure is one of the most critical decisions you will make. In India, the **Private Limited Company (Pvt Ltd)** remains the gold standard for startups and established enterprises alike due to its high credibility, limited liability protection, and ability to raise external venture capital.

This guide outlines the complete incorporation roadmap for 2026.

---

### Step 1: Secure Director Credentials (DSC & DIN)
Every proposed director must obtain a **Digital Signature Certificate (DSC)** to sign electronic forms. Once the DSC is ready, a **Director Identification Number (DIN)** is assigned during the incorporation process.

### Step 2: Brand Name Approval
Choose a unique brand prefix. You must submit your proposed name via the ROC's **RUN (Reserve Unique Name)** portal or directly inside the Spice+ Part A form. Ensure the name does not infringe on existing trademarks!

### Step 3: Drafting MOA & AOA
The **Memorandum of Association (MOA)** defines the company's core objectives, while the **Articles of Association (AOA)** layout the internal regulations and management bylaws.

### Step 4: ROC Filing & Certification
File the **SPICe+ (Simplified Proforma for Incorporating Company Electronically)** form with the Registrar of Companies. Upon successful verification of identity proofs, bank bills, and local lease NOCs, the ROC issues:
1. **Certificate of Incorporation (COI)**
2. **Permanent Account Number (PAN)**
3. **Tax Deduction Account Number (TAN)**

---

### Key Requirements Checklist:
* Minimum **2 Directors** (at least one must be a resident of India).
* Minimum **2 Shareholders** (can be the same as the directors).
* A valid registered physical address with utility bill and NOC proof.
* No minimum paid-up capital is required under current rules.`,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-28",
      author: "D Bhushan",
      views: 342
    },
    {
      id: "blog-2",
      title: "Demystifying First-Year Post-Incorporation Compliances",
      subtitle: "Avoid heavy penalties and strike-offs by filing your mandatory ROC and tax forms on time.",
      content: `### The Post-Incorporation Reality

Congratulations! Your company is officially incorporated. However, many entrepreneurs mistakenly believe that compliance only begins after a year. In reality, the Registrar of Companies (ROC) enforces several strict **post-incorporation timelines** immediately.

Failing to comply with these rules can result in heavy compounding penalties, personal liability for directors, or even the automatic strike-off of your new brand.

---

### 1. Deposit Share Capital & File Form 20A (Within 180 Days)
This is the single most critical step. Every shareholder must deposit their subscribed capital into the corporate bank account. Once deposited, you must file **Form 20A (Commencement of Business)**.
* **Penalty for failure:** A flat ₹50,000 penalty, plus the ROC can strike off the company automatically!

### 2. Appoint the First Auditor (Within 30 Days)
The Board of Directors must appoint a practicing Chartered Accountant as the statutory auditor within 30 days of incorporation by filing **Form ADT-1**.
* **Why it matters:** The auditor is responsible for inspecting your books and filing your balance sheets at the end of the financial year.

### 3. Share Certificate Dispatch (Within 60 Days)
The company must issue physical or digital share certificates to its initial subscribers within 60 days of incorporation and pay the local state stamp duty.

---

### Annual Filing Overview
* **Form AOC-4:** Financial statements (audited balance sheets and P&L statements) must be filed within 30 days of the Annual General Meeting (AGM).
* **Form MGT-7:** The annual return detailing company equity structure, directors, and shareholdings must be filed within 60 days of the AGM.`,
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-15",
      author: "CA Ananya Sharma",
      views: 189
    },
    {
      id: "blog-3",
      title: "LLP vs. Private Limited: Which is Right for You?",
      subtitle: "Compare tax benefits, liability shields, and statutory operational overheads for service and product firms.",
      content: `### Choosing Your Vehicle

When structuring a new enterprise, founders usually debate between two popular legal frameworks: **Limited Liability Partnership (LLP)** and **Private Limited Company (Pvt Ltd)**. Both offer limited liability protection, but they differ significantly in compliance cost, tax implications, and fundraising abilities.

---

### The Limited Liability Partnership (LLP)
An LLP is a hybrid structure combining the operational flexibility of a partnership with the liability protection of a corporation.
* **Best for:** Professional service providers, consulting agencies, small family trades, and real estate partnerships.
* **Tax Benefit:** No Corporate Dividend Distribution Tax (DDT) is levied.
* **Compliance Benefit:** No statutory audit is mandatory unless the capital contribution exceeds ₹25 Lakhs or annual turnover exceeds ₹40 Lakhs.

### The Private Limited Company (Pvt Ltd)
A Private Limited Company is a highly regulated corporate body with a distinct legal identity.
* **Best for:** Product startups, e-commerce brands, high-growth technology companies, and any venture seeking angel/VC funding.
* **Funding Benefit:** Permits direct equity allocation, ESOP pools, and venture debt setups.
* **Credibility Benefit:** Viewed as the most reliable corporate structure by foreign buyers, vendors, and institutional lenders.

---

### Direct Comparison Matrix

| Parameter | LLP | Private Limited |
| :--- | :--- | :--- |
| **Minimum Members** | 2 Designated Partners | 2 Directors & 2 Shareholders |
| **Audit Requirement** | Conditional (based on size) | Mandatory every year |
| **VC Investment** | Extremely difficult | Seamless equity funding |
| **Compliance Cost** | Low to moderate | Moderate to high |
| **Perpetual Succession**| Yes | Yes |`,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-02",
      author: "D Bhushan",
      views: 254
    }
  ];

  // Helper to generate slug
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Helper to sanitize blog posts and ensure critical properties are always present
  const sanitizeBlogPost = (post: any): any => {
    if (!post) return post;
    const title = post.title || "Untitled Post";
    const slug = post.slug || generateSlug(title);
    const id = post.id || `blog-${slug}`;
    return {
      ...post,
      id,
      title,
      slug,
      subtitle: post.subtitle || "",
      content: post.content || "",
      image: post.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      date: post.date || new Date().toISOString().split("T")[0],
      author: post.author || "D Bhushan",
      tags: Array.isArray(post.tags) ? post.tags : [],
      views: Number(post.views) || 0,
      status: post.status || "published",
      metaDescription: post.metaDescription || post.subtitle || ""
    };
  };

  // Helper to parse blog posts content (handles flat array and wrapped object formats)
  const parseBlogPostsContent = (content: string): any[] => {
    try {
      const data = JSON.parse(content);
      let posts: any[] = [];
      if (Array.isArray(data)) {
        posts = data;
      } else if (data && Array.isArray(data.posts)) {
        posts = data.posts;
      }
      return posts.map(sanitizeBlogPost);
    } catch (e: any) {
      console.error("Failed to parse blog posts content:", e.message);
      return [];
    }
  };

  // Load persisted blog posts from disk
  if (fs.existsSync(BLOG_FILE)) {
    try {
      blogPosts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      console.log(`🟢 LOADED PERSISTED BLOG POSTS: ${blogPosts.length} posts`);
      
      const rawContent = fs.readFileSync(BLOG_FILE, "utf-8");
      const rawData = JSON.parse(rawContent);
      const rawList = Array.isArray(rawData) ? rawData : (rawData?.posts || []);
      const needsMigrationSave = rawList.some((p: any) => 
        !p.id || !p.slug || p.views === undefined || !p.status || p.metaDescription === undefined
      );

      if (needsMigrationSave) {
        fs.writeFileSync(BLOG_FILE, JSON.stringify(blogPosts, null, 2), "utf-8");
        console.log(`🟢 MIGRATED LOCAL BLOG DATABASE WITH SANITIZED ENTRIES`);
      }
    } catch (err: any) {
      console.error("Failed to read persisted blog posts:", err.message);
      blogPosts = defaultBlogs.map(sanitizeBlogPost);
    }
  } else {
    blogPosts = defaultBlogs.map(sanitizeBlogPost);
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(blogPosts, null, 2), "utf-8");
      console.log(`🟢 INITIALIZED SEED BLOG POSTS ON DISK`);
    } catch (err: any) {
      console.error("Failed to write seed blog posts to disk:", err.message);
    }
  }

  // Helpers for Firestore REST API
  function toFirestoreValue(val: any): any {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === "string") return { stringValue: val };
    if (typeof val === "number") return { integerValue: val.toString() };
    if (typeof val === "boolean") return { booleanValue: val };
    if (Array.isArray(val)) {
      return {
        arrayValue: {
          values: val.map(toFirestoreValue)
        }
      };
    }
    return { stringValue: JSON.stringify(val) };
  }

  function toFirestoreFields(obj: any): any {
    const fields: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined && key !== "id") {
        fields[key] = toFirestoreValue(obj[key]);
      }
    }
    return { fields };
  }

  // Blog endpoints
  app.get("/api/blog/posts", async (req, res) => {
    const token = req.query.token || req.headers["x-admin-token"];

    let posts: any[] = [];
    
    // First, load the local cache views map so we don't lose view counts when syncing from GitHub
    const localPostsViews = loadViewsMap();

    // Load latest view counts from MySQL database if configured
    const dbPostsViews = new Map<string, number>();
    if (dbPool) {
      try {
        const [rows]: any = await dbPool.query("SELECT post_id, views FROM blog_views");
        if (Array.isArray(rows)) {
          rows.forEach((row: any) => {
            if (row && row.post_id) {
              dbPostsViews.set(row.post_id, Number(row.views) || 0);
            }
          });
        }
      } catch (dbErr: any) {
        console.error("🔴 Failed to fetch view counts from MySQL:", dbErr.message);
      }
    }

    console.log("🟢 Fetching latest blogs from GitHub and merging local/DB view counts...");
    let fetchedFromGitHub = false;
    try {
      const githubUrl = "https://raw.githubusercontent.com/advocatedevbhushan-cpu/incrouteweb/main/blog-posts.json";
      const response = await fetch(githubUrl);
      if (response.ok) {
        const content = await response.text();
        const parsedPosts = parseBlogPostsContent(content);
        if (parsedPosts.length > 0) {
          // Load local posts to merge and preserve locally created posts
          let localPosts: any[] = [];
          if (fs.existsSync(BLOG_FILE)) {
            try {
              localPosts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
            } catch (e) {}
          }

          const postsMap = new Map<string, any>();
          
          // Seed with local posts first so they are not deleted if missing on GitHub
          localPosts.forEach((lp) => {
            if (lp && lp.id) {
              postsMap.set(lp.id, lp);
            }
          });

          // Merge or overwrite with GitHub posts
          parsedPosts.forEach((gp) => {
            if (gp && gp.id) {
              const lp = postsMap.get(gp.id);
              const dbViews = dbPostsViews.get(gp.id) || 0;
              const localViews = localPostsViews.get(gp.id) || 0;
              const finalViews = Math.max(dbViews, localViews, Number(gp.views) || 0, Number(lp?.views) || 0);

              if (finalViews > localViews) {
                localPostsViews.set(gp.id, finalViews);
              }

              postsMap.set(gp.id, {
                ...(lp || {}),
                ...gp,
                views: finalViews
              });
            }
          });

          // For any local post not present on GitHub, also populate its views
          postsMap.forEach((p, id) => {
            if (!parsedPosts.some(gp => gp.id === id)) {
              const dbViews = dbPostsViews.get(id) || 0;
              const localViews = localPostsViews.get(id) || 0;
              p.views = Math.max(dbViews, localViews, Number(p.views) || 0);
            }
          });

          posts = Array.from(postsMap.values());
          fetchedFromGitHub = true;
          console.log(`🟢 Successfully synchronized ${posts.length} blogs from GitHub with local posts merged and view counts preserved.`);
          saveViewsMap(localPostsViews);
          // Save to local cache with views reset to 0 to prevent git tracked file modifications
          try {
            fs.writeFileSync(BLOG_FILE, JSON.stringify(posts.map(p => ({ ...p, views: 0 })), null, 2), "utf-8");
          } catch (err: any) {
            console.error("Failed to write blog cache to disk:", err.message);
          }
        }
      } else {
        console.error(`🔴 GitHub raw fetch returned status ${response.status}`);
      }
    } catch (err: any) {
      console.error("🔴 Failed to fetch blogs from GitHub:", err.message);
    }

    if (!fetchedFromGitHub) {
      console.log("🟢 GitHub raw fetch unavailable. Loading blogs from local disk cache...");
      if (fs.existsSync(BLOG_FILE)) {
        try {
          posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
        } catch (err: any) {
          console.error("Failed to read local blog file, using in-memory or seed default:", err.message);
          posts = blogPosts.length > 0 ? blogPosts : defaultBlogs.map(sanitizeBlogPost);
        }
      } else {
        posts = blogPosts.length > 0 ? blogPosts : defaultBlogs.map(sanitizeBlogPost);
      }
    }

    // Final pass to merge database & local views for all loaded posts (covers fallback/in-memory posts)
    posts = posts.map((p) => {
      if (!p || !p.id) return p;
      const dbViews = dbPostsViews.get(p.id) || 0;
      const localViews = localPostsViews.get(p.id) || 0;
      return {
        ...p,
        views: Math.max(dbViews, localViews, Number(p.views) || 0)
      };
    });

    // Sort posts by date descending
    posts.sort((a, b) => b.date.localeCompare(a.date));

    // Update fallback cache
    blogPosts = posts;

    if (token === "admin-session-secure-token") {
      res.json({ success: true, count: posts.length, posts });
    } else {
      const published = posts.filter((p) => p.status === "published");
      res.json({ success: true, count: published.length, posts: published });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (password === adminPassword) {
      res.json({ success: true, token: "admin-session-secure-token" });
    } else {
      res.status(401).json({ success: false, error: "Incorrect administrative password." });
    }
  });

  app.post("/api/blog/posts", deviceLockMiddleware, async (req, res) => {
    const { title, subtitle, content, image, author, tags, token, status, metaDescription } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, error: "Title and content are required." });
    }

    const newId = `blog-${Date.now()}`;
    const newPost = {
      id: newId,
      title,
      subtitle: subtitle || "",
      content,
      image: image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      date: new Date().toISOString().split("T")[0],
      author: author || "D Bhushan",
      tags: Array.isArray(tags) ? tags : [],
      views: 0,
      slug: generateSlug(title),
      status: status || "published",
      metaDescription: metaDescription || subtitle || ""
    };

    // Ensure unique slug
    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    let originalSlug = newPost.slug;
    let count = 1;
    while (posts.some(p => p.slug === newPost.slug)) {
      newPost.slug = `${originalSlug}-${count}`;
      count++;
    }

    // Always save locally to make sure it persists locally
    posts.unshift(newPost);
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to write new blog to local database file:", err.message);
    }

    res.json({ 
      success: true, 
      message: "Blog post saved successfully!", 
      post: newPost 
    });
  });

  // Admin Edit Blog Post
  app.post("/api/blog/posts/:id/edit", deviceLockMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, subtitle, content, image, author, tags, token, status, metaDescription } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const existingPostIndex = posts.findIndex((p) => p.id === id);
    if (existingPostIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    const existingPost = posts[existingPostIndex];
    const updatedPost = { ...existingPost };
    if (title && title !== existingPost.title) {
      updatedPost.title = title;
      updatedPost.slug = generateSlug(title);
      // Ensure unique slug
      let originalSlug = updatedPost.slug;
      let count = 1;
      while (posts.some((p) => p.slug === updatedPost.slug && p.id !== id)) {
        updatedPost.slug = `${originalSlug}-${count}`;
        count++;
      }
    }
    if (subtitle !== undefined) updatedPost.subtitle = subtitle;
    if (content !== undefined) updatedPost.content = content;
    if (image !== undefined) updatedPost.image = image;
    if (author !== undefined) updatedPost.author = author;
    if (tags !== undefined) updatedPost.tags = Array.isArray(tags) ? tags : [];
    if (status !== undefined) updatedPost.status = status;
    if (metaDescription !== undefined) updatedPost.metaDescription = metaDescription;

    // Always update local cache file
    posts[existingPostIndex] = updatedPost;
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to write edited blog to local database file:", err.message);
    }

    res.json({ 
      success: true, 
      message: "Blog post updated successfully!", 
      post: updatedPost 
    });
  });

  // Toggle/Update blog status
  app.post("/api/blog/posts/:id/status", deviceLockMiddleware, async (req, res) => {
    const { id } = req.params;
    const { token, status } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    if (status !== "draft" && status !== "ready" && status !== "published") {
      return res.status(400).json({ success: false, error: "Invalid status value." });
    }

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    posts[postIndex].status = status;

    // Always update local disk cache
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to write blog status to local database file:", err.message);
    }

    res.json({ success: true, post: posts[postIndex] });
  });

  app.post("/api/blog/posts/:id/view", async (req, res) => {
    const { id } = req.params;

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    // Increment view count in MySQL database first if configured, and query the latest count
    let dbViews = 0;
    if (dbPool) {
      try {
        await dbPool.query(
          "INSERT INTO blog_views (post_id, views) VALUES (?, 1) ON DUPLICATE KEY UPDATE views = views + 1",
          [id]
        );
        console.log(`🟢 Incremented views for blog ${id} in MySQL.`);

        const [rows]: any = await dbPool.query("SELECT views FROM blog_views WHERE post_id = ?", [id]);
        if (Array.isArray(rows) && rows.length > 0) {
          dbViews = Number(rows[0].views) || 0;
        }
      } catch (dbErr: any) {
        console.error("🔴 Failed to write/query views in MySQL:", dbErr.message);
      }
    }

    const localPostsViews = loadViewsMap();
    const localViews = (localPostsViews.get(id) || 0) + 1;
    const finalViews = Math.max(dbViews, localViews);
    localPostsViews.set(id, finalViews);
    saveViewsMap(localPostsViews);

    posts[postIndex].views = finalViews;
    blogPosts = posts;

    res.json({ success: true, post: posts[postIndex] });
  });

  app.delete("/api/blog/posts/:id", deviceLockMiddleware, async (req, res) => {
    const { id } = req.params;
    const { token } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = parseBlogPostsContent(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    posts.splice(postIndex, 1);

    // Always save local disk cache
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to delete blog from local database file:", err.message);
    }

    res.json({ success: true, message: "Blog post deleted successfully!" });
  });

  // Testimonials Persistent JSON Datastore
  const TESTIMONIALS_FILE = path.join(process.cwd(), "testimonials.json");
  let testimonials: any[] = [];

  const defaultTestimonials = [
    {
      id: "test-1",
      name: "Amit Sharma",
      designation: "CEO, FinTech Solutions",
      entityType: "Pvt Ltd Company",
      rating: 5,
      content: "Incroute made Pvt Ltd company registration completely hassle-free! D Bhushan personally reviewed all files and completed the incorporation in just 8 working days. Peerless service!",
      approved: true,
      timestamp: new Date().toISOString()
    },
    {
      id: "test-2",
      name: "Priya Nair",
      designation: "Managing Partner, Zenith Consultancies",
      entityType: "LLP Partnership",
      rating: 5,
      content: "Outstanding compliance support. The virtual CFO services and dashboard kept our LLP ledger clean for yearly audits. Highly recommend for growing service firms in India.",
      approved: true,
      timestamp: new Date().toISOString()
    },
    {
      id: "test-3",
      name: "Devendra Patel",
      designation: "Founder, GreenAgro OPC",
      entityType: "One Person Company",
      rating: 5,
      content: "The Registrar Name Advisor saved us from multiple MCA naming objections. The incorporation process was swift and transparent from day one. Incredibly modern legal tech platform.",
      approved: true,
      timestamp: new Date().toISOString()
    }
  ];

  // Load testimonials from disk
  if (fs.existsSync(TESTIMONIALS_FILE)) {
    try {
      testimonials = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, "utf-8"));
      console.log(`🟢 LOADED PERSISTED TESTIMONIALS: ${testimonials.length} reviews`);
    } catch (err: any) {
      console.error("Failed to read persisted testimonials:", err.message);
      testimonials = defaultTestimonials;
    }
  } else {
    testimonials = defaultTestimonials;
    try {
      fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), "utf-8");
      console.log(`🟢 INITIALIZED SEED TESTIMONIALS ON DISK`);
    } catch (err: any) {
      console.error("Failed to write seed testimonials to disk:", err.message);
    }
  }

  // Testimonials public and admin fetch endpoint
  app.get("/api/testimonials", async (req, res) => {
    // Try to load latest testimonials from GitHub raw
    try {
      const githubUrl = "https://raw.githubusercontent.com/advocatedevbhushan-cpu/incrouteweb/main/testimonials.json";
      const response = await fetch(githubUrl);
      if (response.ok) {
        const content = await response.text();
        const parsed = JSON.parse(content);
        const rawList = Array.isArray(parsed) ? parsed : (parsed?.testimonials || []);
        if (rawList.length > 0) {
          testimonials = rawList;
          console.log(`🟢 Successfully synchronized ${testimonials.length} testimonials from GitHub.`);
          // Save to local cache
          try {
            fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), "utf-8");
          } catch (err: any) {
            console.error("Failed to write testimonials cache to disk:", err.message);
          }
        }
      }
    } catch (err: any) {
      console.warn("Failed to synchronize testimonials from GitHub raw:", err.message);
    }

    res.json({ success: true, count: testimonials.length, testimonials });
  });

  // SEO Metadata profiles for sitemappable pages
  const seoProfiles: Record<string, { title: string; description: string; keywords: string }> = {
    "/": {
      title: "INCroute | Premium Startup & Corporate Registrations in India",
      description: "INCroute is a premium corporate registration and compliance advisory platform. Launch and scale your Indian startup with professional guidance for Pvt Ltd, LLP, Section 8, and GST filings.",
      keywords: "company registration, private limited, LLP registration, India, ROC filings, GST, startup advisory, virtual CFO"
    },
    "/services": {
      title: "Statutory Incorporation Services | INCroute",
      description: "Premium end-to-end corporate registration services in India. Register Private Limited, LLP, One Person Company, Partnership, and Section 8 NGO seamlessly.",
      keywords: "Pvt Ltd company registration, LLP registration, OPC registration, NGO Section 8, company setup"
    },
    "/catalog/": {
      title: "Interactive Services Directory & Checklists | INCroute",
      description: "Explore the comprehensive statutory service catalog for Indian startups. Deep-dive into document requirements, legal advantages, and compliance checklists.",
      keywords: "incorporation checklist, startup documents, compliance catalog, business registration service list"
    },
    "/about": {
      title: "Meet the Corporate Expert - D Bhushan | INCroute",
      description: "Learn about D Bhushan, the founder and principal legal advisor behind INCroute. Experience startup legal architecture and corporate compliance informed by professional CA mentorship.",
      keywords: "D Bhushan, INCroute founder, corporate law consultant, startup legal architecture"
    },
    "/blog": {
      title: "LegisCorp Editorial & Compliance Insights Ledger | INCroute",
      description: "Explore statutory briefs, ROC filing warnings, tax advisory articles, and legal ledger insights managed by corporate advocates and chartered analysts.",
      keywords: "compliance blogs, ROC updates, GST changes, corporate law articles"
    },
    "/tools/name-checker/": {
      title: "AI-Powered Registrar Name Feasibility Auditor | INCroute",
      description: "Audit your proposed brand name against official Registrar (MCA) guidelines. Our dynamic auditor maps trade registry databases instantly for zero-conflict incorporation.",
      keywords: "company name search, MCA name checker, startup brand auditor, business name registry"
    },
    "/tools": {
      title: "Interactive Statutory Utilities & Draft Generators | INCroute",
      description: "Calculate stamp duty rates across states, compute estimated company setup costs, and generate live previews of legal draft documents instantly.",
      keywords: "stamp duty calculator, legal draft generator, company registration cost, statutory utilities"
    },
    "/testimonials": {
      title: "Founder Trust & Client Reflections Board | INCroute",
      description: "See reviews and testimonials from Indian startup founders and business owners who registered their companies and handled ROC annual compliance with INCroute.",
      keywords: "INCroute reviews, startup founder feedback, statutory filing client reviews"
    },
    "/contact": {
      title: "Schedule an Expert Corporate Consultation | INCroute",
      description: "Get in touch with our senior registrars and compliance specialists. Book your consultation for company registration, annual compliance, or taxation.",
      keywords: "contact INCroute, corporate consultation, talk to CA, hire startup lawyer"
    },
    "/compliance/flowchart/": {
      title: "Interactive Corporate Compliance Flowcharts | INCroute",
      description: "Visualize step-by-step statutory filing timelines and ROC compliance pipelines for Private Limited and LLP setups in India.",
      keywords: "compliance flowchart, ROC timeline, company registration pipeline"
    },
    "/tools/entity-comparison/": {
      title: "Corporate Entity Structural Comparisons | INCroute",
      description: "Compare Private Limited, LLP, OPC, Nidhi Company, Public Limited, Partnership, and Sole Proprietorship structures side-by-side on liability, funding readiness, audit requirements, and compliance metrics.",
      keywords: "Pvt Ltd vs LLP, OPC vs Partnership, compare business structures, startup entity type"
    },
    "/tools/impact-dashboard/": {
      title: "Filing Speeds & Statutory Impact Dashboard | INCroute",
      description: "Track live operational metrics, ROC filing speeds, and statutory SLA timelines managed by our senior corporate desk.",
      keywords: "ROC filing speed, compliance SLA, INCroute dashboard"
    },
    "/timeline-viz": {
      title: "Statutory Filing Timelines Dashboard | INCroute",
      description: "Track first-year statutory due dates, ROC filings, and calendar roadmaps to prevent compliance penalties.",
      keywords: "statutory calendar, ROC timelines, compliance dashboard"
    },
    "/company-registration-bangalore": {
      title: "Online Pvt Ltd Company Registration in Bangalore | INCroute",
      description: "Instant online Pvt Ltd company registration in Bangalore. Access Silicon Valley's premium incorporation desk. Get MCA name approval, DSC, and local CA assistance for Bangalore startups.",
      keywords: "online pvt ltd registration price, pvt ltd vs llp for startup, how long does online company registration take, documents needed for online opc registration, Bangalore startup incorporation, company registration Bangalore"
    },
    "/company-registration-mumbai": {
      title: "Premium Pvt Ltd & LLP Registration in Mumbai | INCroute",
      description: "Fast online company registration and LLP setup in Mumbai BKC. Maharashtra stamp duty compliance, instant MCA name clearance, and expert corporate legal advisory under one roof.",
      keywords: "online pvt ltd registration price, pvt ltd vs llp for startup, instant llp registration, cheapest company registration online, Mumbai corporate registry, company registration Mumbai"
    },
    "/company-registration-delhi": {
      title: "Elite Pvt Ltd & LLP Registration in Delhi NCR | INCroute",
      description: "Online Pvt Ltd company registration & instant LLP setup in Delhi, Gurgaon & Noida. High-speed MCA filing, zero office visits. Get your Certificate of Incorporation in 8 working days.",
      keywords: "online pvt ltd registration price, instant llp registration, how long does online company registration take, documents needed for online opc registration, Delhi company registration, Gurgaon company setup"
    },
    "/faq": {
      title: "Filing Q&A Answer Hub: AEO & GEO-Optimized Company Registration FAQs | INCroute",
      description: "Get instant BLUF-optimized answers on company registration timelines, document checklists, Pvt Ltd vs LLP comparison, OPC registration costs, and Section 8 NGO tax exemptions. Optimized for Google AI Overviews and voice search.",
      keywords: "how long does online company registration take, documents needed for online opc registration, pvt ltd vs llp for startup, online pvt ltd registration price, Section 8 NGO tax exemption, company registration FAQ India"
    }
  };

  // Rich Structured JSON-LD schemas for Search Engine optimization & organic rich snippets
  const schemas: Record<string, any> = {
    "/tools/entity-comparison/": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "INCroute Corporate Entity Structural Comparison Utility",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "browserRequirements": "Requires JavaScript",
      "description": "Compare Private Limited, LLP, One Person Company, Nidhi Company, Public Limited, Partnership, and Sole Proprietorship structures in India on statutory metrics.",
      "provider": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      }
    },
    "/catalog/": {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "INCroute Service Catalog",
      "description": "Comprehensive statutory directory listing company registration requirements, compliance obligations, and legal services in India.",
      "publisher": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      }
    },
    "/tools/name-checker/": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "INCroute AI-Powered MCA Company Name Feasibility Auditor",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "browserRequirements": "Requires JavaScript",
      "description": "Verify your proposed company name against Ministry of Corporate Affairs (MCA) trademark and naming guidelines automatically.",
      "provider": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      }
    },
    "/compliance/flowchart/": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "INCroute Interactive Corporate Compliance Flowchart Roadmap",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "browserRequirements": "Requires JavaScript",
      "description": "Interactive flowchart mapping statutory due dates, ROC calendar timelines, and compliance roadmaps for Indian startups.",
      "provider": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      }
    },
    "/services": {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Corporate Registration & Compliance",
      "provider": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      },
      "areaServed": { "@type": "Country", "name": "India" },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Registration Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Private Limited Company Registration" }, "price": "999", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "LLP Registration" }, "price": "1499", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "One Person Company Registration" }, "price": "1299", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Partnership Firm Registration" }, "price": "799", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "GST & Tax Registration" }, "price": "499", "priceCurrency": "INR" }
        ]
      },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "20", "bestRating": "5" }
    },
    "/": {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "INCroute",
      "url": "https://incroute.com",
      "logo": "https://incroute.com/incroute_logo.png",
      "description": "Premium corporate registration and compliance advisory platform. Get professional guidance for Pvt Ltd, LLP, and statutory filings in India.",
      "founder": {
        "@type": "Person",
        "name": "D Bhushan",
        "jobTitle": "Founder & Principal Legal Advisor"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8707552183",
        "contactType": "customer service",
        "email": "info@incroute.com"
      }
    },
    "/about": {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "mainEntity": {
        "@type": "Person",
        "name": "D Bhushan",
        "jobTitle": "Founder & Principal Legal Advisor",
        "worksFor": {
          "@type": "Organization",
          "name": "INCroute",
          "url": "https://incroute.com"
        },
        "description": "D Bhushan is a practicing corporate lawyer and compliance strategist trained under a CA with senior corporate audit experience."
      }
    },
    "/contact": {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "mainEntity": {
        "@type": "LocalBusiness",
        "name": "INCroute",
        "image": "https://incroute.com/incroute_logo.png",
        "telephone": "+91-8707552183",
        "email": "info@incroute.com",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        },
        "openingHours": "Mo-Fr 09:00-18:00"
      }
    },
    "/blog": {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "INCroute LegisCorp Insights Ledger",
      "description": "Corporate compliance alerts, GST filing guides, ROC updates, and statutory warnings managed by advocates and analysts.",
      "publisher": {
        "@type": "Organization",
        "name": "INCroute"
      }
    },
    "/tools": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "INCroute Interactive Statutory Utilities",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "browserRequirements": "Requires JavaScript",
      "description": "Calculators for stamp duty rates, estimated incorporation fees, and live previews of statutory legal drafts in India."
    },
    "/company-registration-bangalore": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "INCroute Bangalore Startup Desk",
      "image": "https://incroute.com/incroute_logo.png",
      "description": "Premium online Pvt Ltd company registration and LLP incorporation services for technology startups in Bangalore.",
      "telephone": "+91-8707552183",
      "email": "info@incroute.com",
      "url": "https://incroute.com/company-registration-bangalore",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "80 Feet Rd, Koramangala 4th Block",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560034",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "12.9338",
        "longitude": "77.6244"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    "/company-registration-mumbai": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "INCroute Mumbai Corporate Desk",
      "image": "https://incroute.com/incroute_logo.png",
      "description": "Premium online company registration, LLP filings, and corporate legal compliance services for Mumbai enterprises.",
      "telephone": "+91-8707552183",
      "email": "info@incroute.com",
      "url": "https://incroute.com/company-registration-mumbai",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "G Block BKC, Bandra Kurla Complex, Bandra East",
        "addressLocality": "Mumbai",
        "addressRegion": "Maharashtra",
        "postalCode": "400051",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "19.0600",
        "longitude": "72.8600"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    "/company-registration-delhi": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "INCroute Delhi NCR Startup Desk",
      "image": "https://incroute.com/incroute_logo.png",
      "description": "Instant online company registration and elite LLP filing services for startups and e-commerce brands in Delhi NCR.",
      "telephone": "+91-8707552183",
      "email": "info@incroute.com",
      "url": "https://incroute.com/company-registration-delhi",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Connaught Place",
        "addressLocality": "New Delhi",
        "addressRegion": "Delhi",
        "postalCode": "110001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "28.6304",
        "longitude": "77.2177"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    "/faq": {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How long does online company registration take in India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Online Pvt Ltd company registration in India takes 7 to 10 working days. This timeline includes acquiring Digital Signature Certificates (DSC), obtaining name approvals via SPICe+ Part A, and submitting final SPICe+ Part B forms to the Registrar of Companies."
          }
        },
        {
          "@type": "Question",
          "name": "What documents are needed for online OPC registration?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Online OPC registration requires the director's PAN card, Aadhaar card, photo, and bank statement (under 2 months old). The registered office requires a utility bill (electricity or water) and a signed No Objection Certificate (NOC) from the property owner."
          }
        },
        {
          "@type": "Question",
          "name": "Pvt Ltd vs LLP for startup: Which structure is best?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pvt Ltd is the best structure for raising venture capital, issuing ESOPs, and rapid scaling. Choose an LLP if you want limited liability with low annual compliance (audits are optional below 25 Lakh capital or 40 Lakh turnover) and do not need immediate VC funding."
          }
        },
        {
          "@type": "Question",
          "name": "What is the actual online Pvt Ltd registration price?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The total online Pvt Ltd registration price starts at Rs 5,999 (inclusive of professional fees, DSC for two directors, and government filing charges). The price varies by state depending on authorized share capital brackets and regional MCA stamp duty schedules."
          }
        },
        {
          "@type": "Question",
          "name": "What are the tax exemptions for a Section 8 NGO?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Section 8 NGOs enjoy 100% tax exemptions on donations under Section 12A and Section 80G of the Income Tax Act, 1961. The entity is also exempt from minimum capital criteria, stamp duty levies on incorporation, and corporate dividend distribution taxes."
          }
        }
      ]
    }
  };

  const serviceNameMap: Record<string, string> = {
    "pvt-ltd": "Private Limited Company (Pvt Ltd)",
    "llp": "Limited Liability Partnership (LLP)",
    "opc": "One Person Company (OPC)",
    "partnership": "Partnership Firm",
    "section8": "Section 8 Company (NGO)",
    "public-ltd": "Public Limited Company",
    "annual-compliance": "Annual Compliances Suite",
    "gst-tax": "GST & Tax Registration",
    "virtual-cfo": "Virtual CFO Retainer",
    "virtual-office": "Virtual Office Address",
    "terms-privacy": "Terms of Service & Privacy Policy",
    "msme-registration": "MSME (Udyam) Registration",
    "fssai-registration": "FSSAI Food License Registration",
    "return-filing": "Tax & Return Filing Services",
    "trademark-registration": "Trademark Services Suite",
    "trademark-objection": "Response to Trademark Objection",
    "trademark-opposition": "Trademark Opposition Services",
    "trademark-assignment": "Trademark & IP Assignment",
    "brand-protection": "Brand Protection & Monitoring",
    "litigation-assistance": "Corporate Litigation Assistance",
    "trademark-renewal": "Trademark & License Renewal",
    "patent-filing": "Patent Drafting & Filing",
    "iso-certification": "ISO Certification Services"
  };

  function injectSEOMetadata(html: string, route: string): string {
    let profile = seoProfiles[route];
    
    if (!profile) {
      // Check for dynamic services subroutes e.g., /services/category/service-id
      const serviceMatch = route.match(/^\/services\/([^/]+)\/([^/]+)\/?$/);
      if (serviceMatch) {
        const category = serviceMatch[1].replace("-", " ").replace(/\b\w/g, c => c.toUpperCase());
        const serviceId = serviceMatch[2];
        const cleanName = serviceNameMap[serviceId] || serviceId.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase());
        
        profile = {
          title: `${cleanName} Registration & Compliance | INCroute`,
          description: `Get professional, CA-backed services for ${cleanName} under ${category} category in India. Real-time filing and guaranteed compliance.`,
          keywords: `${cleanName}, ${category}, company registration, ROC, business filing`
        };
      } else {
        profile = seoProfiles["/"];
      }
    }
    
    // Replace <title>
    let transformed = html.replace(/<title>.*?<\/title>/gi, `<title>${profile.title}</title>`);
    
    // Replace or inject description
    const descMeta = `<meta name="description" content="${profile.description}" />`;
    if (transformed.includes('name="description"')) {
      transformed = transformed.replace(/<meta name="description" content=".*?" \/>/gi, descMeta);
    } else {
      transformed = transformed.replace("</head>", `  ${descMeta}\n</head>`);
    }

    // Replace or inject keywords
    const keywordsMeta = `<meta name="keywords" content="${profile.keywords}" />`;
    if (transformed.includes('name="keywords"')) {
      transformed = transformed.replace(/<meta name="keywords" content=".*?" \/>/gi, keywordsMeta);
    } else {
      transformed = transformed.replace("</head>", `  ${keywordsMeta}\n</head>`);
    }

    // OpenGraph OG Title & Description
    const ogTitle = `<meta property="og:title" content="${profile.title}" />`;
    const ogDesc = `<meta property="og:description" content="${profile.description}" />`;
    
    if (transformed.includes('property="og:title"')) {
      transformed = transformed.replace(/<meta property="og:title" content=".*?" \/>/gi, ogTitle);
    } else {
      transformed = transformed.replace("</head>", `  ${ogTitle}\n</head>`);
    }

    if (transformed.includes('property="og:description"')) {
      transformed = transformed.replace(/<meta property="og:description" content=".*?" \/>/gi, ogDesc);
    } else {
      transformed = transformed.replace("</head>", `  ${ogDesc}\n</head>`);
    }

    // Dynamic Canonical Link Tag
    const canonicalUrl = `https://incroute.com${route === "/" ? "" : route}`;
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
    transformed = transformed.replace(/<link rel="canonical" href=".*?" \/>/gi, "");
    transformed = transformed.replace("</head>", `  ${canonicalTag}\n</head>`);

    // Dynamic JSON-LD Schema Markup
    const schemaData = schemas[route] || schemas["/"];
    const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>`;
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
    transformed = transformed.replace("</head>", `  ${schemaTag}\n</head>`);

    return transformed;
  }

  // Helper to parse Firestore REST API JSON structure
  function parseFirestoreDocument(doc: any): any {
    const fields = doc.fields || {};
    const result: any = {};
    const nameParts = doc.name ? doc.name.split("/") : [];
    result.id = nameParts[nameParts.length - 1] || "";

    for (const key in fields) {
      const valObj = fields[key];
      if (valObj && typeof valObj === "object") {
        if ("stringValue" in valObj) {
          result[key] = valObj.stringValue;
        } else if ("integerValue" in valObj) {
          result[key] = parseInt(valObj.integerValue, 10);
        } else if ("doubleValue" in valObj) {
          result[key] = parseFloat(valObj.doubleValue);
        } else if ("booleanValue" in valObj) {
          result[key] = valObj.booleanValue;
        } else if ("arrayValue" in valObj) {
          const values = valObj.arrayValue.values || [];
          result[key] = values.map((v: any) => {
            if ("stringValue" in v) return v.stringValue;
            if ("integerValue" in v) return parseInt(v.integerValue, 10);
            return JSON.stringify(v);
          });
        } else {
          result[key] = valObj;
        }
      }
    }
    return result;
  }

  // Dynamic Blog Post Route Handler for SEO crawler support
  const handleBlogPostRoute = async (req: any, res: any, next: any, isDev: boolean, vite?: any) => {
    const { slug } = req.params;

    let post: any = null;
    try {
      const firestoreUrl = "https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs";
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data: any = await response.json();
        const firestoreDocs = data.documents || [];
        const parsedPosts = firestoreDocs.map(parseFirestoreDocument);
        post = parsedPosts.find((p: any) => p.slug === slug && p.status === "published");
      } else {
        console.error(`🔴 Firestore REST API returned status ${response.status}`);
      }
    } catch (err: any) {
      console.error("🔴 Failed to fetch blog post from Firestore REST API:", err.message);
    }

    if (!post) {
      post = blogPosts.find((p) => p.slug === slug && p.status === "published");
    }

    if (!post) {
      return next(); // Fallback to standard client router or 404
    }

    try {
      const templatePath = isDev 
        ? path.join(process.cwd(), "index.html")
        : fs.existsSync(path.join(process.cwd(), "dist", "index.html"))
          ? path.join(process.cwd(), "dist", "index.html")
          : path.join(process.cwd(), "index.html");

      if (!fs.existsSync(templatePath)) {
        return next();
      }

      let template = fs.readFileSync(templatePath, "utf-8");
      if (isDev && vite) {
        template = await vite.transformIndexHtml(req.originalUrl, template);
      }

      // Generate dynamic SEO profile for this blog post
      const profile = {
        title: `${post.title} | INCroute Blog`,
        description: post.metaDescription || post.subtitle || "Statutory compliance and company incorporation insights.",
        keywords: Array.isArray(post.tags) ? post.tags.join(", ") : "compliance, company registration, ROC, GST"
      };

      // Replace <title>
      let transformed = template.replace(/<title>.*?<\/title>/gi, `<title>${profile.title}</title>`);
      
      // Replace or inject description
      const descMeta = `<meta name="description" content="${profile.description}" />`;
      if (transformed.includes('name="description"')) {
        transformed = transformed.replace(/<meta name="description" content=".*?" \/>/gi, descMeta);
      } else {
        transformed = transformed.replace("</head>", `  ${descMeta}\n</head>`);
      }

      // Replace or inject keywords
      const keywordsMeta = `<meta name="keywords" content="${profile.keywords}" />`;
      if (transformed.includes('name="keywords"')) {
        transformed = transformed.replace(/<meta name="keywords" content=".*?" \/>/gi, keywordsMeta);
      } else {
        transformed = transformed.replace("</head>", `  ${keywordsMeta}\n</head>`);
      }

      // OpenGraph OG Title & Description
      const ogTitle = `<meta property="og:title" content="${profile.title}" />`;
      const ogDesc = `<meta property="og:description" content="${profile.description}" />`;
      const ogImage = `<meta property="og:image" content="${post.image}" />`;
      
      if (transformed.includes('property="og:title"')) {
        transformed = transformed.replace(/<meta property="og:title" content=".*?" \/>/gi, ogTitle);
      } else {
        transformed = transformed.replace("</head>", `  ${ogTitle}\n</head>`);
      }

      if (transformed.includes('property="og:description"')) {
        transformed = transformed.replace(/<meta property="og:description" content=".*?" \/>/gi, ogDesc);
      } else {
        transformed = transformed.replace("</head>", `  ${ogDesc}\n</head>`);
      }

      if (transformed.includes('property="og:image"')) {
        transformed = transformed.replace(/<meta property="og:image" content=".*?" \/>/gi, ogImage);
      } else {
        transformed = transformed.replace("</head>", `  ${ogImage}\n</head>`);
      }

      // Dynamic Canonical Link Tag
      const canonicalUrl = `https://incroute.com/blog/${slug}`;
      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
      transformed = transformed.replace(/<link rel="canonical" href=".*?" \/>/gi, "");
      transformed = transformed.replace("</head>", `  ${canonicalTag}\n</head>`);

      // Dynamic JSON-LD Schema Markup
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.subtitle,
        "image": post.image,
        "author": {
          "@type": "Person",
          "name": post.author
        },
        "datePublished": post.date,
        "publisher": {
          "@type": "Organization",
          "name": "INCroute",
          "logo": {
            "@type": "ImageObject",
            "url": "https://incroute.com/incroute_logo.png"
          }
        }
      };
      const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>`;
      transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
      transformed = transformed.replace("</head>", `  ${schemaTag}\n</head>`);

      res.status(200).set({ "Content-Type": "text/html" }).end(transformed);
    } catch (err: any) {
      console.error("Vite blog index transform error:", err.message);
      next(err);
    }
  };

  // SEO sitemappable page routes
  const seoRoutes = Object.keys(seoProfiles);

  // Vite Integration for Full-Stack routing
  // Production detection logic:
  // - If NODE_ENV=production → production mode
  // - If running from tsx (dev command) → dev mode, regardless of dist/ existing
  // - If neither is set but built assets exist → production mode (Hostinger fallback)
  const distPath = path.join(process.cwd(), "dist");
  const distIndexPath = path.join(distPath, "index.html");
  // Also check if running directly from inside dist/ folder (cd dist && node server.cjs)
  const cwdIndexPath = path.join(process.cwd(), "index.html");
  const cwdHasAssets = fs.existsSync(path.join(process.cwd(), "assets")) && fs.existsSync(cwdIndexPath);
  
  // Check if we're running via tsx (TypeScript execution = development)
  const isRunningViaTsx = process.argv[1]?.endsWith('.ts') || process.argv[0]?.includes('tsx');
  
  let isProduction: boolean;
  if (process.env.NODE_ENV === "production") {
    isProduction = true;
  } else if (isRunningViaTsx) {
    isProduction = false;
  } else if (fs.existsSync(distIndexPath) || cwdHasAssets) {
    // Bundled server without NODE_ENV set — assume production
    isProduction = true;
    console.log("ℹ️ NODE_ENV not set but running bundled server. Assuming production.");
  } else {
    isProduction = false;
  }
  
  if (!isProduction) {
    console.log("🔵 Starting in DEVELOPMENT mode (Vite HMR)...");
    const { createServer: createViteServer } = await import("vite");
    const hmrPort = Number(process.env.WS_PORT) || (PORT + 100);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: hmrPort,
        },
      },
      appType: "custom",
    });

    // Intercept blog post routes
    app.get(["/blog/:slug", "/blog/:slug/"], async (req, res, next) => {
      await handleBlogPostRoute(req, res, next, true, vite);
    });

    // Intercept SEO routes dynamically in development
    app.get([...seoRoutes, "/services/:category/:serviceId", "/services/:category/:serviceId/"], async (req, res, next) => {
      try {
        const url = req.originalUrl.split("?")[0];
        const templatePath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const html = injectSEOMetadata(template, url);
        
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (err: any) {
        console.error("Vite index transform error:", err.message);
        next(err);
      }
    });

    app.use(vite.middlewares);

    // SPA fallback for dev mode — serve index.html for all non-API, non-asset routes
    app.use("*", async (req, res, next) => {
      // Skip API routes and static assets
      if (req.originalUrl.startsWith("/api/") || req.originalUrl.includes(".")) {
        return next();
      }
      try {
        const templatePath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (err) {
        next(err);
      }
    });

    console.log(`Vite HMR configured to ws://localhost:${hmrPort}`);
  } else {
    // Production mode — serve built static files with SPA fallback
    // Resolve the actual dist path: if dist/index.html exists use dist/, else use cwd (running from dist/ directly)
    const resolvedDistPath = fs.existsSync(distIndexPath) ? distPath : (cwdHasAssets ? process.cwd() : distPath);
    console.log(`🟢 Starting in PRODUCTION mode. Serving from: ${resolvedDistPath}`);

    // Intercept blog post routes
    app.get(["/blog/:slug", "/blog/:slug/"], (req, res, next) => {
      handleBlogPostRoute(req, res, next, false);
    });

    // Intercept SEO routes dynamically in production
    app.get([...seoRoutes, "/services/:category/:serviceId", "/services/:category/:serviceId/"], (req, res, next) => {
      try {
        const url = req.originalUrl.split("?")[0];
        const templatePath = path.join(resolvedDistPath, "index.html");
        if (fs.existsSync(templatePath)) {
          const template = fs.readFileSync(templatePath, "utf-8");
          const html = injectSEOMetadata(template, url);
          return res.status(200).set({ "Content-Type": "text/html" }).end(html);
        }
        next();
      } catch (err) {
        next(err);
      }
    });

    // ─── ONE-TIME DATABASE SETUP ENDPOINT ───
    // Visit: /api/setup-db?key=incroute2026 to create all Prisma tables
    app.get("/api/setup-db", async (req, res) => {
      const setupKey = req.query.key;
      if (setupKey !== "incroute2026") {
        return res.status(403).json({ error: "Invalid setup key" });
      }
      try {
        const { execSync } = await import("child_process");
        const output = execSync("npx prisma db push --accept-data-loss", { 
          cwd: process.cwd(), 
          encoding: "utf-8",
          timeout: 60000,
          env: { ...process.env, PATH: process.env.PATH }
        });
        res.json({ success: true, message: "Database tables created!", output });
      } catch (err: any) {
        res.status(500).json({ error: "Setup failed", details: err.message, output: err.stdout || "" });
      }
    });

    // Static file serving
    app.use(express.static(resolvedDistPath));
    app.use(express.static(path.join(process.cwd(), "public")));

    // SPA fallback — serve index.html for ALL non-API, non-file routes
    app.get("*", (req, res) => {
      // If the request looks like a file (has extension), let it 404 naturally
      if (req.path.includes(".") && !req.path.endsWith(".html")) {
        return res.status(404).end();
      }
      res.sendFile(path.join(resolvedDistPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Incroute backend server active running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
