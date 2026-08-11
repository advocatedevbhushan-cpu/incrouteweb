import { Router } from "express";
import fs from "fs";
import path from "path";

export function createBlogRouter() {
  const router = Router();

  // Blog posts list
  router.get("/posts", (req, res) => {
    try {
      const postsPath = path.join(process.cwd(), "blog-posts.json");
      if (fs.existsSync(postsPath)) {
        const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));
        return res.json({ success: true, count: posts.length, data: posts });
      }
      res.json({ success: true, count: 0, data: [] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch blog posts", details: err.message });
    }
  });

  // Blog post by slug
  router.get("/posts/:slug", (req, res) => {
    try {
      const postsPath = path.join(process.cwd(), "blog-posts.json");
      if (fs.existsSync(postsPath)) {
        const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));
        const post = posts.find((p: any) => p.slug === req.params.slug || p.id === req.params.slug);
        if (post) return res.json({ success: true, data: post });
      }
      res.status(404).json({ error: "Blog post not found" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch blog post", details: err.message });
    }
  });

  // FAQs
  router.get("/faqs", (req, res) => {
    try {
      const faqsPath = path.join(process.cwd(), "faqs.json");
      if (fs.existsSync(faqsPath)) {
        const faqs = JSON.parse(fs.readFileSync(faqsPath, "utf-8"));
        return res.json({ success: true, data: faqs });
      }
      res.json({ success: true, data: [] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch FAQs", details: err.message });
    }
  });

  // Testimonials
  router.get("/testimonials", (req, res) => {
    try {
      const testimonialsPath = path.join(process.cwd(), "testimonials.json");
      if (fs.existsSync(testimonialsPath)) {
        const data = JSON.parse(fs.readFileSync(testimonialsPath, "utf-8"));
        return res.json({ success: true, data });
      }
      res.json({ success: true, data: [] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch testimonials", details: err.message });
    }
  });

  return router;
}
