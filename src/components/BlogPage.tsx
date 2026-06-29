import React, { useState, useEffect, useMemo } from "react";
import { Calendar, User, ArrowLeft, Search, Eye, X, ArrowRight, BookOpen } from "lucide-react";
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

function markdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-[17px] font-bold text-[var(--text-primary)] mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-[20px] font-bold text-[var(--text-primary)] mt-10 mb-4 pb-2 border-b border-[var(--border-subtle)]">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-[24px] font-extrabold text-[var(--text-primary)] mt-10 mb-5">$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[var(--accent)] bg-[var(--accent-soft)] pl-5 py-3 pr-4 my-5 rounded-r-xl text-[var(--text-secondary)] italic text-[14px]">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="border-[var(--border-subtle)] my-8" />')
    .replace(/^\* (.+)$/gm, '<li class="ml-5 list-disc text-[var(--text-secondary)] text-[14px] leading-relaxed my-1">$1</li>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-[var(--text-secondary)] text-[14px] leading-relaxed my-1">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal text-[var(--text-secondary)] text-[14px] leading-relaxed my-1">$1</li>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-2xl max-w-full my-6 border border-[var(--border-subtle)] shadow-sm" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] hover:underline font-medium">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--text-primary)]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-2 py-0.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-md text-[12px] font-mono text-[var(--accent)]">$1</code>');
  html = html.split("\n").map(line => {
    const t = line.trim();
    if (!t) return "";
    if (t.startsWith("<h") || t.startsWith("<blockquote") || t.startsWith("<hr") || t.startsWith("<li") || t.startsWith("<img")) return t;
    return `<p class="text-[15px] text-[var(--text-secondary)] leading-[1.8] mb-4">${t}</p>`;
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

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    if (posts.length === 0) return;
    const match = location.pathname.match(/^\/blog\/([^/]+)/);
    const slug = match ? match[1] : null;
    if (slug) {
      const found = posts.find(p => p.slug === slug);
      setSelectedPost(found || null);
    } else { setSelectedPost(null); }
  }, [location.pathname, posts]);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog/posts");
      const data = await res.json();
      if (data.success && data.posts) {
        setPosts(data.posts.filter((p: BlogPost) => p.status === "published"));
      }
    } catch {
      try { const c = localStorage.getItem("incroute_blog_posts"); if (c) setPosts(JSON.parse(c).filter((p: BlogPost) => p.status === "published")); } catch {}
    } finally { setLoading(false); }
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p => p.title.toLowerCase().includes(q) || (p.subtitle || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q));
  }, [posts, searchQuery]);

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    navigate(`/blog/${post.slug}/`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetch(`/api/blog/posts/${post.id}/view`, { method: "POST" }).catch(() => {});
  };

  const handleBack = () => { setSelectedPost(null); navigate("/blog/"); };

  // ─── POST DETAIL VIEW ───
  if (selectedPost) {
    const htmlContent = DOMPurify.sanitize(markdownToHtml(selectedPost.content));
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-10 px-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)] mb-8 cursor-pointer transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to articles
        </button>

        {selectedPost.category && (
          <span className="inline-block text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-3">{selectedPost.category}</span>
        )}

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.15] mb-3">
          {selectedPost.title}
        </h1>
        {selectedPost.subtitle && (
          <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-6">{selectedPost.subtitle}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--text-tertiary)] mb-8 pb-6 border-b border-[var(--border-subtle)]">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedPost.date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedPost.author}</span>
          {selectedPost.views !== undefined && selectedPost.views > 0 && <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {selectedPost.views} reads</span>}
        </div>

        {selectedPost.image && (
          <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-auto max-h-[400px] object-cover rounded-2xl mb-10 border border-[var(--border-subtle)]" loading="lazy" />
        )}

        <article className="blog-article-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />

        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] text-center">
          <p className="text-[13px] text-[var(--text-tertiary)] mb-3">Found this helpful?</p>
          <button onClick={handleBack} className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[13px] font-semibold rounded-xl cursor-pointer transition-colors">
            Read More Articles <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── BLOG LIST VIEW ───
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-10 px-4">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--accent-soft)] rounded-full mb-4">
          <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wider">Knowledge Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
          INC<span className="text-[var(--accent)] italic">route</span> Blog
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] mt-3 max-w-xl mx-auto leading-relaxed">
          Expert insights on company registration, compliance, taxation, and business growth in India.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg mx-auto mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-11 py-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition-all" />
        {searchQuery && (<button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--accent)] cursor-pointer"><X className="w-4 h-4" /></button>)}
      </div>

      {/* Loading */}
      {loading && (<div className="flex items-center justify-center min-h-[30vh]"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>)}

      {/* Empty */}
      {!loading && filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-4"><BookOpen className="w-7 h-7 text-[var(--accent)]" /></div>
          <p className="text-[var(--text-secondary)] text-[15px] font-medium">{searchQuery ? "No articles match your search." : "No blog posts published yet."}</p>
          <p className="text-[var(--text-tertiary)] text-[13px] mt-1">Check back soon for new content.</p>
        </div>
      )}

      {/* Featured post (first one, larger) */}
      {!loading && filteredPosts.length > 0 && (
        <div className="space-y-8">
          {/* Featured */}
          <article onClick={() => handleSelectPost(filteredPosts[0])} className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden cursor-pointer hover:border-[var(--accent)] hover:shadow-[0_12px_40px_rgba(91,108,255,0.08)] transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {filteredPosts[0].image && (
                <div className="h-[240px] lg:h-full overflow-hidden">
                  <img src={filteredPosts[0].image} alt={filteredPosts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              )}
              <div className="p-8 flex flex-col justify-center">
                {filteredPosts[0].category && (<span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2">{filteredPosts[0].category}</span>)}
                <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] leading-tight mb-3 group-hover:text-[var(--accent)] transition-colors">{filteredPosts[0].title}</h2>
                {filteredPosts[0].subtitle && (<p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3">{filteredPosts[0].subtitle}</p>)}
                <div className="flex items-center gap-4 text-[11px] text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(filteredPosts[0].date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {filteredPosts[0].author}</span>
                </div>
                <div className="mt-5"><span className="text-[12px] font-semibold text-[var(--accent)] flex items-center gap-1 group-hover:gap-2 transition-all">Read Article <ArrowRight className="w-3.5 h-3.5" /></span></div>
              </div>
            </div>
          </article>

          {/* Grid of remaining posts */}
          {filteredPosts.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.slice(1).map((post) => (
                <article key={post.id} onClick={() => handleSelectPost(post)} className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden cursor-pointer hover:border-[var(--accent)] hover:shadow-[0_8px_24px_rgba(91,108,255,0.06)] transition-all duration-200">
                  {post.image && (<div className="h-[180px] overflow-hidden"><img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" /></div>)}
                  <div className="p-5 space-y-2.5">
                    {post.category && (<span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">{post.category}</span>)}
                    <h2 className="text-[15px] font-bold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{post.title}</h2>
                    {post.subtitle && (<p className="text-[12px] text-[var(--text-secondary)] line-clamp-2">{post.subtitle}</p>)}
                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)] pt-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
