import React, { useState, useEffect, useMemo } from "react";
import { Calendar, User, ArrowLeft, Search, Eye, Clock, Tag, X } from "lucide-react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  date: string;
  author: string;
  slug: string;
  status: string;
  views?: number;
  category?: string;
  metaDescription?: string;
}

// Simple markdown to HTML (headings, bold, italic, lists, links, images, blockquotes, hr)
function markdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-[var(--text-primary)] mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[var(--text-primary)] mt-8 mb-4">$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[var(--accent)] bg-[var(--accent-soft)] pl-4 py-2 my-4 rounded-r text-[var(--text-secondary)] italic">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="border-[var(--border-subtle)] my-6" />')
    .replace(/^\* (.+)$/gm, '<li class="ml-4 list-disc text-[var(--text-secondary)] text-sm leading-relaxed">$1</li>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-[var(--text-secondary)] text-sm leading-relaxed">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-[var(--text-secondary)] text-sm leading-relaxed">$1</li>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl max-w-full my-4 border border-[var(--border-subtle)]" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] hover:underline font-medium">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[var(--text-primary)]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-[var(--bg-surface-alt)] rounded text-[12px] font-mono">$1</code>');

  // Wrap remaining lines in paragraphs
  html = html.split("\n").map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("<h") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<hr") || trimmed.startsWith("<li") || trimmed.startsWith("<img")) return trimmed;
    return `<p class="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-3">${trimmed}</p>`;
  }).join("\n");

  return html;
}

export default function BlogPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  // URL sync — open post based on slug in URL
  useEffect(() => {
    if (posts.length === 0) return;
    const match = location.pathname.match(/^\/blog\/([^/]+)/);
    const slug = match ? match[1] : null;
    if (slug) {
      const found = posts.find(p => p.slug === slug);
      setSelectedPost(found || null);
    } else {
      setSelectedPost(null);
    }
  }, [location.pathname, posts]);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog/posts");
      const data = await res.json();
      if (data.success && data.posts) {
        setPosts(data.posts.filter((p: BlogPost) => p.status === "published"));
      }
    } catch {
      // Fallback to cached
      try {
        const cached = localStorage.getItem("incroute_blog_posts");
        if (cached) setPosts(JSON.parse(cached).filter((p: BlogPost) => p.status === "published"));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.subtitle || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    navigate(`/blog/${post.slug}/`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Increment view
    fetch(`/api/blog/posts/${post.id}/view`, { method: "POST" }).catch(() => {});
  };

  const handleBack = () => {
    setSelectedPost(null);
    navigate("/blog/");
  };

  // ─── POST DETAIL VIEW ───
  if (selectedPost) {
    const htmlContent = DOMPurify.sanitize(markdownToHtml(selectedPost.content));
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto py-8 px-4"
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)] mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all posts
        </button>

        {/* Featured image */}
        {selectedPost.image && (
          <img
            src={selectedPost.image}
            alt={selectedPost.title}
            className="w-full h-[280px] sm:h-[360px] object-cover rounded-2xl mb-6 border border-[var(--border-subtle)]"
            loading="lazy"
          />
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--text-tertiary)] mb-4">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {selectedPost.date}</span>
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedPost.author}</span>
          {selectedPost.views !== undefined && <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {selectedPost.views} views</span>}
          {selectedPost.category && <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {selectedPost.category}</span>}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-2">
          {selectedPost.title}
        </h1>
        {selectedPost.subtitle && (
          <p className="text-[15px] text-[var(--text-secondary)] mb-6">{selectedPost.subtitle}</p>
        )}

        {/* Content */}
        <article
          className="prose-incroute"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </motion.div>
    );
  }

  // ─── BLOG LIST VIEW ───
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-8 px-4"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          INC<span className="text-[var(--accent)] italic font-bold">route</span> Blog
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-2 max-w-lg mx-auto">
          Expert insights on company registration, compliance, taxation, and business growth in India.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--accent)] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredPosts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--text-tertiary)] text-sm">
            {searchQuery ? "No articles match your search." : "No blog posts published yet."}
          </p>
        </div>
      )}

      {/* Post grid */}
      {!loading && filteredPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => handleSelectPost(post)}
              className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden cursor-pointer hover:border-[var(--accent)] hover:shadow-[0_8px_24px_rgba(91,108,255,0.08)] transition-all duration-200"
            >
              {/* Image */}
              {post.image && (
                <div className="h-[160px] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              {/* Content */}
              <div className="p-5 space-y-2.5">
                {post.category && (
                  <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">{post.category}</span>
                )}
                <h2 className="text-[15px] font-bold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h2>
                {post.subtitle && (
                  <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2">{post.subtitle}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)] pt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </motion.div>
  );
}
