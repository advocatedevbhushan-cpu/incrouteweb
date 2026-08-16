import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { authenticateToken, requireRole } from "../middleware/auth";
import { generateSitemapXml, pingSearchEngines } from "../seo";

export function createBlogRouter() {
  const router = Router();
  const BLOG_FILE = path.join(process.cwd(), "blog-posts.json");
  const VIEWS_FILE = path.join(process.cwd(), "blog-views.json");

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

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
    } catch {}
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

  const parseBlogPosts = (): any[] => {
    try {
      if (fs.existsSync(BLOG_FILE)) {
        const raw = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
        const posts = Array.isArray(raw) ? raw : raw?.posts || [];
        const viewsMap = loadViewsMap();
        return posts.map((p: any) => ({
          ...p,
          views: Math.max(viewsMap.get(p.id) || 0, Number(p.views) || 0)
        }));
      }
    } catch (e: any) {
      console.error("Error reading blog posts:", e.message);
    }
    return [];
  };

  const generateSlug = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  // Helper to parse markdown with YAML frontmatter or plain markdown
  const parseMarkdownTemplate = (rawText: string) => {
    let metadata: Record<string, any> = {};
    let content = rawText;

    // Check for YAML frontmatter
    const frontmatterMatch = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (frontmatterMatch) {
      const yamlStr = frontmatterMatch[1];
      content = frontmatterMatch[2].trim();

      yamlStr.split("\n").forEach((line) => {
        const colonIdx = line.indexOf(":");
        if (colonIdx !== -1) {
          const key = line.substring(0, colonIdx).trim();
          let val = line.substring(colonIdx + 1).trim();
          // Strip quotes
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (val === "true") metadata[key] = true;
          else if (val === "false") metadata[key] = false;
          else metadata[key] = val;
        }
      });
    }

    // Extract title if not in metadata
    if (!metadata.title) {
      const h1Match = content.match(/^#\s+(.+)$/m);
      if (h1Match) metadata.title = h1Match[1].trim();
    }

    // Extract subtitle or blockquote summary if not in metadata
    if (!metadata.subtitle) {
      const quoteMatch = content.match(/^>\s*(?:\*\*)?(.*?)(?:\*\*)?$/m);
      if (quoteMatch) metadata.subtitle = quoteMatch[1].trim();
    }

    // Extract first image if not in metadata
    if (!metadata.image) {
      const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
      if (imgMatch) metadata.image = imgMatch[1];
    }

    return { metadata, content };
  };

  // ─── GET /sitemap.xml (Dynamic Live Sitemap with Instant Blog URLs) ───
  router.get("/sitemap.xml", (_req: Request, res: Response) => {
    try {
      const xml = generateSitemapXml();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err: any) {
      res.status(500).send("Error generating sitemap.");
    }
  });

  // ─── GET /api/blog/template (Download or view starter templates) ───
  router.get("/template", (_req: Request, res: Response) => {
    const mdTemplatePath = path.join(process.cwd(), "templates", "blog-template.md");
    const jsonTemplatePath = path.join(process.cwd(), "templates", "blog-template.json");

    let markdown = "";
    let json = "";

    if (fs.existsSync(mdTemplatePath)) markdown = fs.readFileSync(mdTemplatePath, "utf-8");
    if (fs.existsSync(jsonTemplatePath)) json = fs.readFileSync(jsonTemplatePath, "utf-8");

    res.json({ success: true, markdown, json });
  });

  // ─── GET /api/blog/posts ───
  router.get("/posts", (req: Request, res: Response) => {
    try {
      const posts = parseBlogPosts();
      const published = posts.filter((p: any) => p.status === "published" || !p.status);
      res.json({ success: true, count: published.length, posts: published, data: published });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // ─── GET /api/blog/posts/:slug ───
  router.get("/posts/:slug", (req: Request, res: Response) => {
    try {
      const posts = parseBlogPosts();
      const post = posts.find((p: any) => p.slug === req.params.slug || p.id === req.params.slug);
      if (!post) return res.status(404).json({ error: "Blog post not found" });
      res.json({ success: true, post, data: post });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // ─── POST /api/blog/fast-publish (One-Click Auto Publisher) ───
  router.post("/fast-publish", async (req: Request, res: Response) => {
    try {
      let { title, subtitle, content, category, author, date, image, metaDescription, rawText, status } = req.body;

      // If raw text or markdown is passed, auto-parse
      if (rawText) {
        // Check if rawText is JSON
        try {
          const parsedJson = JSON.parse(rawText);
          if (parsedJson.title && (parsedJson.content || parsedJson.body)) {
            title = parsedJson.title;
            subtitle = parsedJson.subtitle || subtitle;
            content = parsedJson.content || parsedJson.body;
            category = parsedJson.category || category;
            author = parsedJson.author || author;
            date = parsedJson.date || date;
            image = parsedJson.image || image;
            metaDescription = parsedJson.metaDescription || metaDescription;
            status = parsedJson.status || status;
          }
        } catch {
          // It's Markdown text
          const { metadata, content: parsedContent } = parseMarkdownTemplate(rawText);
          title = metadata.title || title;
          subtitle = metadata.subtitle || subtitle;
          content = parsedContent || content;
          category = metadata.category || category;
          author = metadata.author || author;
          date = metadata.date || date;
          image = metadata.image || image;
          metaDescription = metadata.metaDescription || metaDescription;
          status = metadata.status || status;
        }
      }

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required to publish." });
      }

      // Read current posts
      let posts: any[] = [];
      if (fs.existsSync(BLOG_FILE)) {
        try {
          const data = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
          posts = Array.isArray(data) ? data : data?.posts || [];
        } catch {
          posts = [];
        }
      }

      // Generate unique slug
      let baseSlug = generateSlug(title);
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (posts.some((p) => p.slug === uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Auto-extract meta description if empty (150-160 chars)
      if (!metaDescription) {
        const cleanText = (subtitle || content)
          .replace(/[#*`>_\[\]\(\)]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        metaDescription = cleanText.length > 155 ? `${cleanText.substring(0, 152)}...` : cleanText;
      }

      const newPost = {
        id: `blog-${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : "",
        slug: uniqueSlug,
        content: content.trim(),
        category: category || "Company Registration",
        author: author || "D Bhushan",
        date: date || new Date().toISOString().split("T")[0],
        image: image || "/blog-images/sample-cover.png",
        views: 0,
        status: status || "published",
        featured: Boolean(req.body.featured),
        metaDescription: metaDescription.trim()
      };

      // Add to top of posts
      posts.unshift(newPost);
      fs.writeFileSync(BLOG_FILE, JSON.stringify({ posts }, null, 2), "utf-8");

      // Regenerate dynamic sitemap & ping search engines
      generateSitemapXml();
      pingSearchEngines();

      res.json({
        success: true,
        message: "Article published successfully and synced with Google Sitemap!",
        post: newPost,
        url: `/blog?post=${newPost.slug}`,
      });
    } catch (err: any) {
      console.error("Fast publish error:", err);
      res.status(500).json({ error: err.message || "Failed to publish article." });
    }
  });

  // Upload blog cover image
  router.post("/api/blog/upload-image", upload.single("image"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const ext = path.extname(req.file.originalname) || ".png";
      const sanitizedName = `cover-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "blog-images");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, sanitizedName);
      fs.writeFileSync(filePath, req.file.buffer);

      return res.json({
        success: true,
        url: `/blog-images/${sanitizedName}`,
        filename: sanitizedName,
      });
    } catch (err: any) {
      console.error("Failed to upload blog image:", err.message);
      res.status(500).json({ error: "Failed to process image upload." });
    }
  });

  // ─── POST /api/blog/upload-template (Upload .md / .txt / .json file directly) ───
  router.post("/upload-template", upload.single("file"), async (req: any, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded." });
      const rawText = req.file.buffer.toString("utf-8");

      // Reuse fast-publish logic with rawText
      req.body.rawText = rawText;
      return (router as any).handle(
        Object.assign(req, { url: "/fast-publish", method: "POST" }),
        res
      );
    } catch (err: any) {
      res.status(500).json({ error: "Failed to process uploaded template file." });
    }
  });

  // ─── POST /api/blog/posts/:id/view ───
  router.post("/posts/:id/view", (req: Request, res: Response) => {
    try {
      const viewsMap = loadViewsMap();
      const current = (viewsMap.get(req.params.id) || 0) + 1;
      viewsMap.set(req.params.id, current);
      saveViewsMap(viewsMap);
      res.json({ success: true, views: current });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update views" });
    }
  });

  // ─── POST /api/blog/upload-image ───
  router.post("/upload-image", upload.single("file"), (req: any, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file provided" });
      const file = req.file;
      if (!file.mimetype.startsWith("image/")) return res.status(400).json({ error: "Only image files allowed" });

      const ext = path.extname(file.originalname) || ".webp";
      const filename = `blog-${Date.now()}${ext}`;
      const imgDir = path.join(process.cwd(), "public", "blog-images");
      if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
      fs.writeFileSync(path.join(imgDir, filename), file.buffer);

      const publicUrl = `/blog-images/${filename}`;
      res.json({ success: true, url: publicUrl, filename });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // FAQs
  router.get("/faqs", (_req: Request, res: Response) => {
    try {
      const faqsPath = path.join(process.cwd(), "faqs.json");
      if (fs.existsSync(faqsPath)) {
        const faqs = JSON.parse(fs.readFileSync(faqsPath, "utf-8"));
        return res.json({ success: true, data: faqs });
      }
      res.json({ success: true, data: [] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  // Testimonials
  router.get("/testimonials", (_req: Request, res: Response) => {
    try {
      const testimonialsPath = path.join(process.cwd(), "testimonials.json");
      if (fs.existsSync(testimonialsPath)) {
        const data = JSON.parse(fs.readFileSync(testimonialsPath, "utf-8"));
        return res.json({ success: true, data });
      }
      res.json({ success: true, data: [] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  return router;
}
