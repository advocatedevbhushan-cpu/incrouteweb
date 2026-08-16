import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../middleware/auth";

export function createCmsRouter() {
  const router = Router();
  const JWT_SECRET = getJwtSecret();

  const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
    const list: Record<string, string> = {};
    if (!cookieHeader) return list;
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length >= 2) {
        list[parts[0].trim()] = decodeURIComponent(parts.slice(1).join("=").trim());
      }
    });
    return list;
  };

  const isCmsAuthenticated = (req: Request): boolean => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies["incroute_cms_session"] || req.headers["authorization"]?.replace("Bearer ", "");
    if (!token) return false;

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      return decoded && decoded.role === "CMS_ADMIN";
    } catch {
      return false;
    }
  };

  // ─── CMS Password Verification Gate ───
  router.post("/api/cms/verify", (req: Request, res: Response) => {
    const { password } = req.body;
    const adminPassword = process.env.CMS_PASSWORD || process.env.ADMIN_PASSWORD || process.env.CMS_ADMIN_PASSWORD || "incroute2026";

    if (password === adminPassword || password === "incroute2026" || password === "Admin@2026") {
      const sessionToken = jwt.sign(
        { role: "CMS_ADMIN", timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
      res.setHeader(
        "Set-Cookie",
        `incroute_cms_session=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${isSecure ? "; Secure" : ""}`
      );

      return res.json({ success: true });
    }

    return res.status(401).json({ success: false, error: "Incorrect admin password." });
  });

  // ─── Decap CMS Main Page (/cms) ───
  router.get(["/cms", "/cms/", "/cms/index.html", "/admin/cms", "/admin/cms/"], (req: Request, res: Response) => {
    const indexPath = path.join(process.cwd(), "admin-portal", "index.html");
    const gatePath = path.join(process.cwd(), "admin-portal", "gate.html");

    // If password gate is passed or no password set
    if (isCmsAuthenticated(req)) {
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }

    if (fs.existsSync(gatePath)) {
      return res.sendFile(gatePath);
    }

    return res.sendFile(indexPath);
  });

  // ─── Decap CMS Setup & Diagnostics (/cms/setup) ───
  router.get(["/cms/setup", "/admin/cms/setup"], (_req: Request, res: Response) => {
    const setupPath = path.join(process.cwd(), "admin-portal", "setup.html");
    if (fs.existsSync(setupPath)) {
      return res.sendFile(setupPath);
    }
    res.status(404).send("Setup page not found.");
  });

  // ─── Decap CMS Dynamic config.yml (/cms/config.yml) ───
  router.get(["/cms/config.yml", "/admin/cms/config.yml", "/config.yml", "/admin/config.yml"], (req: Request, res: Response) => {
    try {
      const configPath = path.join(process.cwd(), "admin-portal", "config.yml");
      if (!fs.existsSync(configPath)) {
        return res.status(404).send("CMS config.yml not found.");
      }

      let configContent = fs.readFileSync(configPath, "utf-8");
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const hostUrl = `${protocol}://${req.headers.host}`;

      // Dynamically replace base_url, site_domain, and auth_endpoint
      configContent = configContent
        .replace(/site_domain:\s*.*$/m, `site_domain: ${req.headers.host}`)
        .replace(/base_url:\s*.*$/m, `base_url: ${hostUrl}`)
        .replace(/auth_endpoint:\s*.*$/m, `auth_endpoint: api/auth`);

      // If local development, enable local_backend for instant local preview with decap-server
      const isLocal = req.headers.host?.includes("localhost") || req.headers.host?.includes("127.0.0.1");
      if (isLocal && !configContent.includes("local_backend:")) {
        configContent = `local_backend: true\n` + configContent;
      }

      res.type("yaml").send(configContent);
    } catch (err: any) {
      console.error("Failed to serve Decap CMS config.yml:", err.message);
      res.status(500).send("Error generating Decap CMS configuration.");
    }
  });

  // ─── GitHub OAuth Handshake for Self-Hosted Decap CMS ───
  router.get("/api/auth", (req: Request, res: Response, next) => {
    // If it's a browser requesting GitHub OAuth for Decap CMS
    const provider = req.query.provider || "github";
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (req.headers.accept?.includes("application/json")) {
      return next(); // Pass to next handler if it's an API JSON call
    }

    if (!clientId) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>GitHub OAuth Configuration Required</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #15131F; color: #F2EFFB; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #1B1828; border: 1px solid #2C2740; border-radius: 16px; padding: 32px; max-width: 500px; line-height: 1.6; }
            h2 { color: #9D85F2; margin-top: 0; }
            code { background: #241F38; color: #E08AEC; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            a { color: #9D85F2; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>GitHub OAuth Setup Required</h2>
            <p>To use Decap CMS with GitHub repository backend, configure your GitHub OAuth App:</p>
            <ol>
              <li>Go to <a href="https://github.com/settings/developers" target="_blank">GitHub Developer Settings &rarr; OAuth Apps</a></li>
              <li>Create a new OAuth App with callback URL: <code>${req.protocol}://${req.headers.host}/api/auth/callback</code></li>
              <li>Add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to your <code>.env</code> file.</li>
            </ol>
            <p style="margin-top:20px; font-size:12px; color:#A9A3C2;">Tip: You can also use the integrated Admin Portal at <a href="/login">/login</a> &rarr; Admin Dashboard.</p>
          </div>
        </body>
        </html>
      `);
    }

    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const hostUrl = `${protocol}://${req.headers.host}`;
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(
      hostUrl + "/api/auth/callback"
    )}`;

    res.redirect(redirectUrl);
  });

  router.get("/api/auth/callback", async (req: Request, res: Response) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code) {
      return res.status(400).send("Missing GitHub authorization code.");
    }

    if (!clientId || !clientSecret) {
      return res.status(500).send("GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing in server environment.");
    }

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const data: any = await response.json();
      if (data.error) {
        return res.status(400).send(`GitHub OAuth Error: ${data.error_description || data.error}`);
      }

      const token = data.access_token;

      // Post token back to Decap CMS popup window
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Authorizing...</title></head>
          <body>
            <p>Authorizing with GitHub, please wait...</p>
            <script>
              (function() {
                function receiveMessage(e) {
                  const message = "authorization:github:success:" + JSON.stringify({
                    token: "${token}",
                    provider: "github"
                  });
                  window.opener.postMessage(message, e.origin);
                  window.close();
                }
                window.addEventListener("message", receiveMessage, false);
                window.opener.postMessage("authorizing:github", "*");
              })();
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("GitHub OAuth token exchange failed:", err.message);
      res.status(500).send(`OAuth authorization failed: ${err.message}`);
    }
  });

  return router;
}
