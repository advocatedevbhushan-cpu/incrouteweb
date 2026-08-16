import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import compression from "compression";

// Modular routers and utilities
import { getPlatformConnection, getBooksConnection, withPlatformConnection, withBooksConnection } from "./server/db";
import { createAuthRouter } from "./server/routes/auth";
import { createAdminRouter } from "./server/routes/admin";
import { createPartnerRouter } from "./server/routes/partner";
import { createPortalRouter } from "./server/routes/portal";
import { createTimesheetRouter } from "./server/routes/timesheet";
import { createAiRouter } from "./server/routes/ai";
import { createBlogRouter } from "./server/routes/blog";
import { createServicesRouter } from "./server/routes/services";
import { registerBooksRoutes } from "./server/books/routes";
import { seoProfiles, injectSEOMetadata } from "./server/seo";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Active compliance calendar definition
const complianceCalendar = [
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
  app.use(compression());

  // Security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.removeHeader("X-Powered-By");
    next();
  });

  // INCroute Books & Subdomain Routing Middleware
  app.use((req, res, next) => {
    const host = (req.headers.host || "").toLowerCase().split(":")[0];
    const isBooksDomain = /^books\./.test(host);

    if (isBooksDomain) {
      if (req.url.startsWith("/books")) {
        const subPath = req.url.replace(/^\/books/, "") || "/";
        return res.redirect(301, subPath);
      }
    }
    next();
  });

  // Cloudflare R2 Client Setup
  const r2Client = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: "auto",
        endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

  // Nodemailer Transporter Setup
  let emailTransporter: nodemailer.Transporter | null = null;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
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
    } catch (mailErr: any) {
      console.warn("⚠️ SMTP initialization skipped:", mailErr.message);
    }
  }

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    let dbStatus = "unknown";
    try {
      const count = await withPlatformConnection(async (conn) => {
        const [rows]: any = await conn.query("SELECT COUNT(*) as count FROM `User`");
        return rows[0]?.count || 0;
      });
      dbStatus = `connected (${count} users)`;
    } catch (e: any) {
      dbStatus = `error: ${e.message?.substring(0, 50)}`;
    }
    res.json({ status: "ok", timestamp: new Date().toISOString(), db: dbStatus });
  });

  // Document download streaming endpoint
  app.get(["/api/admin/documents/:id/download", "/api/portal/documents/:id/download"], async (req, res) => {
    try {
      const doc = await withPlatformConnection(async (conn) => {
        const [docs]: any = await conn.query(
          "SELECT storageKey, storageProvider, publicUrl, title, fileName, originalName, mimeType FROM `Document` WHERE id = ?",
          [req.params.id]
        );
        return docs[0] || null;
      });

      if (!doc) return res.status(404).json({ error: "Document not found" });
      const fileName = doc.originalName || doc.fileName || "download";

      if ((doc.storageProvider === "cloudflare_r2" || doc.storageProvider === "r2") && doc.storageKey && r2Client) {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || "incroute-documents",
            Key: doc.storageKey
          });
          const response = await r2Client.send(command);

          res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
          res.setHeader("Content-Type", doc.mimeType || response.ContentType || "application/octet-stream");
          if (response.ContentLength) res.setHeader("Content-Length", String(response.ContentLength));

          const stream = response.Body as any;
          if (stream?.pipe) return stream.pipe(res);
          if (stream?.transformToByteArray) {
            const bytes = await stream.transformToByteArray();
            return res.send(Buffer.from(bytes));
          }
          return res.send(stream);
        } catch (r2Err: any) {
          console.error("R2 download stream error:", r2Err.message);
        }
      }

      // Local file fallback
      const possiblePaths = [
        doc.storageKey ? path.join(process.cwd(), "uploads", doc.storageKey.replace(/^clients\//, "")) : null,
        doc.publicUrl?.startsWith("/uploads") ? path.join(process.cwd(), doc.publicUrl) : null,
        doc.storageKey ? path.join(process.cwd(), "uploads", path.basename(doc.storageKey)) : null,
        doc.fileName ? path.join(process.cwd(), "uploads", doc.fileName) : null,
      ].filter(Boolean) as string[];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
          res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
          return fs.createReadStream(p).pipe(res);
        }
      }

      return res.status(404).json({ error: "File not found on storage." });
    } catch (err: any) {
      console.error("[Download Error]:", err);
      res.status(500).json({ error: "Download failed" });
    }
  });

  // Serve uploads folder statically for local storage fallback
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Register Modular Routers
  app.use("/api/auth", createAuthRouter());
  app.use("/api/admin", createAdminRouter(emailTransporter, r2Client));
  app.use("/api/partner/timesheet", createTimesheetRouter());
  app.use("/api/partner", createPartnerRouter());
  app.use("/api/portal", createPortalRouter(r2Client));
  app.use("/api/ai", createAiRouter());
  app.use("/api/consult", createAiRouter());
  app.use("/api/blog", createBlogRouter());
  app.use("/api", createServicesRouter(complianceCalendar, emailTransporter));

  // Register INCroute Books Accounting Engine
  registerBooksRoutes(app, getPlatformConnection, getBooksConnection);

  // Initialize DB Startup tables
  (async () => {
    try {
      await withPlatformConnection(async (conn) => {
        await conn.query(`
          CREATE TABLE IF NOT EXISTS \`Timesheet\` (
            \`id\` VARCHAR(30) NOT NULL,
            \`userId\` VARCHAR(30) NOT NULL,
            \`clientId\` VARCHAR(30) NULL,
            \`customClient\` VARCHAR(100) NULL,
            \`description\` TEXT NOT NULL,
            \`startTime\` DATETIME NOT NULL,
            \`endTime\` DATETIME NULL,
            \`duration\` INT NOT NULL DEFAULT 0,
            \`billable\` TINYINT(1) NOT NULL DEFAULT 0,
            \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
            PRIMARY KEY (\`id\`),
            INDEX \`Timesheet_userId_idx\` (\`userId\`),
            INDEX \`Timesheet_clientId_idx\` (\`clientId\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
      });
      console.log("[DB Startup] Platform database tables verified.");
    } catch (err: any) {
      console.warn("[DB Startup Warning] Platform table verification:", err.message);
    }

    try {
      await withBooksConnection(async (conn) => {
        const [tables]: any = await conn.query("SHOW TABLES LIKE 'BooksTenant'");
        if (!tables || tables.length === 0) {
          console.log("[DB Startup] Initializing INCroute Books schema and seed...");
          const migrationPath = path.join(process.cwd(), "migrations", "20260713_incroute_books_mvp.sql");
          if (fs.existsSync(migrationPath)) {
            await conn.query(fs.readFileSync(migrationPath, "utf-8"));
          }
          const seedPath = path.join(process.cwd(), "seeds", "20260713_incroute_books_reference_seed.sql");
          if (fs.existsSync(seedPath)) {
            await conn.query(fs.readFileSync(seedPath, "utf-8"));
          }
          console.log("[DB Startup] INCroute Books tables initialized.");
        }
      });
    } catch (err: any) {
      console.warn("[DB Startup Warning] Books tables verification:", err.message);
    }
  })();

  // SEO sitemappable page routes
  const seoRoutes = Object.keys(seoProfiles);

  // Vite Integration & SPA fallback
  const distPath = path.join(process.cwd(), "dist");
  const distIndexPath = path.join(distPath, "index.html");
  const cwdIndexPath = path.join(process.cwd(), "index.html");
  const cwdHasAssets = fs.existsSync(path.join(process.cwd(), "assets")) && fs.existsSync(cwdIndexPath);
  const isRunningViaTsx = process.argv[1]?.endsWith(".ts") || process.argv[0]?.includes("tsx");

  let isProduction: boolean;
  if (process.env.NODE_ENV === "production") {
    isProduction = true;
  } else if (isRunningViaTsx) {
    isProduction = false;
  } else if (fs.existsSync(distIndexPath) || cwdHasAssets) {
    isProduction = true;
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
          protocol: "ws",
          host: "localhost",
          port: hmrPort,
        },
      },
      appType: "custom",
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
        next(err);
      }
    });

    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
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
  } else {
    const resolvedDistPath = fs.existsSync(distIndexPath) ? distPath : (cwdHasAssets ? process.cwd() : distPath);
    console.log(`🟢 Starting in PRODUCTION mode. Serving from: ${resolvedDistPath}`);

    app.get([...seoRoutes, "/services/:category/:serviceId", "/services/:category/:serviceId/"], (req, res, next) => {
      try {
        const url = req.originalUrl.split("?")[0];
        const templatePath = path.join(resolvedDistPath, "index.html");
        if (fs.existsSync(templatePath)) {
          const template = fs.readFileSync(templatePath, "utf-8");
          const html = injectSEOMetadata(template, url);
          return res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache, no-store, must-revalidate" }).end(html);
        }
        next();
      } catch (err) {
        next(err);
      }
    });

    app.use(express.static(resolvedDistPath, { maxAge: 0, etag: false, lastModified: false, index: false }));
    app.use(express.static(path.join(process.cwd(), "public"), { maxAge: 0 }));

    app.get("*", (req, res) => {
      if (req.path.includes(".") && !req.path.endsWith(".html")) {
        return res.status(404).end();
      }
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path.join(resolvedDistPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 INCroute server running on http://localhost:${PORT}`);
  });
}

startServer();
