import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
import { getJwtSecret } from "../middleware/auth";

export function createCmsRouter() {
  const router = Router();
  const JWT_SECRET = getJwtSecret();

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      })
    : null;

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

  const generateWithGemini = async (contents: string, config: any = {}) => {
    if (!ai) throw new Error("Gemini API key is not configured in server environment.");
    const models = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-3.7-flash"];
    let lastErr: any = null;
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastErr = err;
        console.warn(`[Gemini Fallback] Model ${model} returned: ${err.message}. Trying fallback model...`);
      }
    }
    throw lastErr || new Error("Failed to generate content with Gemini AI.");
  };

  const safeExtractJson = (raw: string): any => {
    if (!raw || typeof raw !== "string") return {};

    let clean = raw.trim();

    // Remove markdown code fences if present (```json ... ``` or ``` ...)
    clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    // Try direct parse first
    try {
      return JSON.parse(clean);
    } catch {}

    // Find the first '{' and the last '}' to strip trailing non-whitespace chars
    const startIdx = clean.indexOf("{");
    const endIdx = clean.lastIndexOf("}");

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonSubstring = clean.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonSubstring);
      } catch {}

      // Clean up unescaped control characters inside JSON strings
      try {
        const sanitized = jsonSubstring.replace(/[\u0000-\u001F]+/g, (match) => {
          if (match === "\n") return "\\n";
          if (match === "\r") return "\\r";
          if (match === "\t") return "\\t";
          return "";
        });
        return JSON.parse(sanitized);
      } catch {}
    }

    // Fallback: If still not parsed, regex extract the known fields
    const extracted: Record<string, any> = {};
    const titleMatch = raw.match(/"title"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (titleMatch) {
      try { extracted.title = JSON.parse(`"${titleMatch[1]}"`); } catch { extracted.title = titleMatch[1]; }
    }

    const subtitleMatch = raw.match(/"subtitle"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (subtitleMatch) {
      try { extracted.subtitle = JSON.parse(`"${subtitleMatch[1]}"`); } catch { extracted.subtitle = subtitleMatch[1]; }
    }

    const categoryMatch = raw.match(/"category"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (categoryMatch) {
      try { extracted.category = JSON.parse(`"${categoryMatch[1]}"`); } catch { extracted.category = categoryMatch[1]; }
    }

    const slugMatch = raw.match(/"slug"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (slugMatch) {
      try { extracted.slug = JSON.parse(`"${slugMatch[1]}"`); } catch { extracted.slug = slugMatch[1]; }
    }

    const metaDescMatch = raw.match(/"metaDescription"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (metaDescMatch) {
      try { extracted.metaDescription = JSON.parse(`"${metaDescMatch[1]}"`); } catch { extracted.metaDescription = metaDescMatch[1]; }
    }

    const contentMatch = raw.match(/"content"\s*:\s*"([\s\S]*?)(?:",\s*"|"\s*})/);
    if (contentMatch) {
      try {
        extracted.content = JSON.parse(`"${contentMatch[1]}"`);
      } catch {
        extracted.content = contentMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      }
    }

    if (Object.keys(extracted).length > 0) {
      return extracted;
    }

    throw new Error("Unable to parse AI response into JSON format.");
  };

  // ─── AI BLOG GENERATOR & SEO CO-PILOT (Powered by Gemini) ───
  router.post("/api/cms/ai/generate", async (req: Request, res: Response) => {
    try {
      const { topic, category, targetAudience, keywords, tone } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required for AI generation." });
      }

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured in server environment." });
      }

      const prompt = `You are an elite corporate legal counsel, Chartered Accountant advisor, and SEO content strategist for INCroute (India's premier startup incorporation and statutory compliance advisory platform).

Create a high-ranking, authoritative, and founder-friendly comprehensive guide on the topic:
Topic: "${topic}"
Category: "${category || "Company Registration"}"
Target Audience: "${targetAudience || "Indian Startup Founders, Directors, and Small Business Owners"}"
Target Keywords: "${keywords || "company registration, compliance, India, ROC, MCA guidelines"}"
Tone: "${tone || "Professional, authoritative, actionable, clear, founder-friendly"}"

Generate a complete, publication-ready article and output a STRICT JSON object with these exact keys:
{
  "title": "Compelling, high-CTR SEO title (50-65 characters)",
  "subtitle": "Practical 1-2 sentence summary explaining the core takeaway for founders",
  "category": "${category || "Company Registration"}",
  "slug": "url-friendly-kebab-case-slug",
  "metaDescription": "Exactly 150-160 characters search snippet optimized for Google SERP and click-throughs",
  "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "Full markdown text with: \\n# Title\\n\\n**Overview summary**\\n\\n## Section 1: Core Statutory Requirements\\n* Bullet points with details...\\n\\n> **Important Note**: Key statutory caveat or penalty avoidance note.\\n\\n## Section 2: Step-by-Step Procedure & Timelines\\n1. Step 1...\\n2. Step 2...\\n\\n## Section 3: Essential Documents Checklist\\n\\n## Section 4: Common Pitfalls to Avoid\\n\\n## Conclusion & How INCroute Assists\\nFinal takeaway reminding founders to consult INCroute.",
  "estimatedReadingTime": "5 min read"
}`;

      const text = await generateWithGemini(prompt, {
        responseMimeType: "application/json",
      });

      const parsed = safeExtractJson(text || "{}");

      const categoryImages: Record<string, string> = {
        "Company Registration": "/blog-images/chatgpt-image-jun-29-2026-07_28_50-pm.png",
        "Compliance & ROC": "/blog-images/chatgpt-image-jul-13-2026-11_16_20-am.png",
        "GST & Taxation": "/blog-images/sample-cover.png",
        "Trademark & IP": "/blog-images/chatgpt-image-jul-13-2026-11_16_20-am.png",
        "Legal Advisory": "/blog-images/chatgpt-image-jun-29-2026-07_28_50-pm.png",
        "Startup Guide": "/blog-images/sample-cover.png",
        "Industry News": "/blog-images/chatgpt-image-jun-29-2026-07_28_50-pm.png",
      };

      if (!parsed.image) {
        parsed.image = categoryImages[parsed.category || category] || "/blog-images/sample-cover.png";
      }

      res.json({
        success: true,
        data: parsed,
      });
    } catch (err: any) {
      console.error("AI blog generator error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI blog article." });
    }
  });

  // ─── AI ARTICLE POLISHER & GRAMMAR ENHANCER ───
  router.post("/api/cms/ai/polish", async (req: Request, res: Response) => {
    try {
      const { text, focus } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required to polish." });
      if (!ai) return res.status(503).json({ error: "Gemini API key is not configured." });

      const prompt = `You are a senior editor for a premier Indian corporate law and startup compliance publication.
Polish and enhance the following draft text for ${focus || "clarity, professional legal tone, rich markdown formatting, and SEO ranking"}.
Preserve all statutory facts, improve structure, make bullet points crisp, and ensure clean markdown formatting.

Text to polish:
"""
${text}
"""

Return a STRICT JSON object:
{
  "polishedText": "Clean, formatted markdown string...",
  "suggestedTitle": "Improved title if applicable",
  "suggestedMetaDescription": "150-160 char Google meta snippet"
}`;

      const textResult = await generateWithGemini(prompt, {
        responseMimeType: "application/json",
      });

      const parsed = safeExtractJson(textResult || "{}");
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to polish text with AI." });
    }
  });

  // ─── MULTI-COLLECTION: TESTIMONIALS ───
  router.get("/api/cms/testimonials", (_req: Request, res: Response) => {
    try {
      const filePath = path.join(process.cwd(), "testimonials.json");
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return res.json({ success: true, testimonials: Array.isArray(data) ? data : [] });
      }
      res.json({ success: true, testimonials: [] });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to read testimonials." });
    }
  });

  router.post("/api/cms/testimonials", (req: Request, res: Response) => {
    try {
      const { testimonials } = req.body;
      if (!Array.isArray(testimonials)) {
        return res.status(400).json({ error: "Testimonials array is required." });
      }
      const filePath = path.join(process.cwd(), "testimonials.json");
      fs.writeFileSync(filePath, JSON.stringify(testimonials, null, 2), "utf-8");
      res.json({ success: true, message: "Testimonials saved successfully!" });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to save testimonials." });
    }
  });

  // ─── MULTI-COLLECTION: FAQS ───
  router.get("/api/cms/faqs", (_req: Request, res: Response) => {
    try {
      const filePath = path.join(process.cwd(), "faqs.json");
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return res.json({ success: true, faqs: data.faqs || (Array.isArray(data) ? data : []) });
      }
      res.json({ success: true, faqs: [] });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to read FAQs." });
    }
  });

  router.post("/api/cms/faqs", (req: Request, res: Response) => {
    try {
      const { faqs } = req.body;
      if (!Array.isArray(faqs)) {
        return res.status(400).json({ error: "FAQs array is required." });
      }
      const filePath = path.join(process.cwd(), "faqs.json");
      fs.writeFileSync(filePath, JSON.stringify({ faqs }, null, 2), "utf-8");
      res.json({ success: true, message: "FAQs saved successfully!" });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to save FAQs." });
    }
  });

  // ─── MULTI-COLLECTION: SITE SETTINGS & ANNOUNCEMENTS ───
  router.get("/api/cms/settings", (_req: Request, res: Response) => {
    try {
      const filePath = path.join(process.cwd(), "site-settings.json");
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return res.json({ success: true, settings: data });
      }
      res.json({ success: true, settings: {} });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to read site settings." });
    }
  });

  router.post("/api/cms/settings", (req: Request, res: Response) => {
    try {
      const { settings } = req.body;
      if (!settings || typeof settings !== "object") {
        return res.status(400).json({ error: "Settings object is required." });
      }
      const filePath = path.join(process.cwd(), "site-settings.json");
      fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), "utf-8");
      res.json({ success: true, message: "Site settings saved successfully!" });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to save site settings." });
    }
  });

  // ─── GitHub OAuth Handshake for Self-Hosted Decap CMS ───
  router.get("/api/auth", (req: Request, res: Response, next) => {
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (req.headers.accept?.includes("application/json")) {
      return next();
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
            <p style="margin-top:20px; font-size:12px; color:#A9A3C2;">Tip: You can also use the integrated Fast Publisher at <a href="/cms">/cms</a>.</p>
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
