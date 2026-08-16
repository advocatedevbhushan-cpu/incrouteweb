import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { authenticateToken, requireRole } from "../middleware/auth";

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

  // Get all blog posts
  router.get("/posts", (req: Request, res: Response) => {
    try {
      const posts = parseBlogPosts();
      const published = posts.filter((p: any) => p.status === "published" || !p.status);
      res.json({ success: true, count: published.length, posts: published, data: published });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Get single blog post by slug or ID
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

  // Increment view count
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

  // Admin image upload
  router.post("/upload-image", authenticateToken, requireRole("ADMIN", "SUPER_ADMIN", "TEAM_MEMBER"), upload.single("file"), (req: any, res: Response) => {
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
  router.get("/faqs", (req: Request, res: Response) => {
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
  router.get("/testimonials", (req: Request, res: Response) => {
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
