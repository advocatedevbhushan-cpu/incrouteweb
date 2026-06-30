import React, { useState, useEffect, useMemo } from "react";
import { Calendar, User, ArrowLeft, Search, Eye, X, ArrowRight, BookOpen, TrendingUp, Clock, Tag } from "lucide-react";
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
    .replace(/^## (.+)$/gm, '<h2 class="text-[20px] font-bold text-[var(--text-primary)] mt-10 mb-4 pb-2 border-b border-[var(--border-subtle)]">$2</h2>')
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
  const [activeCategory, setActiveCategory] = useState("All");

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

  const categories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)] as string[];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeCategory !== "All") result = result.filter(p => p.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || (p.subtitle || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q));
    }
    return result;
  }, [posts, searchQuery, activeCategory]);

  // Sorted by views for sidebar
  const trendingPosts = useMemo(() => [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5), [posts]);
  const recentPosts = useMemo(() => [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5), [posts]);

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    navigate(`/blog/${post.slug}/`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetch(`/api/blog/posts/${post.id}/view`, { method: "POST" }).catch(() => {});
  };

  const handleBack = () => { setSelectedPost(null); navigate("/blog/"); };

  const formatViews = (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : String(v);

  // ─── POST DETAIL VIEW (with sidebar) ───
  if (selectedPost) {
    const htmlContent = DOMPurify.sanitize(markdownToHtml(selectedPost.content));
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto py-10 px-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)] mb-8 cursor-pointer transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to articles
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* Main Content */}
          <div>
            {selectedPost.category && (
              <span className="inline-block text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-3 px-3 py-1 bg-[var(--accent-soft)] rounded-full">{selectedPost.category}</span>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.15] mb-3">{selectedPost.title}</h1>
            {selectedPost.subtitle && (<p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-6">{selectedPost.subtitle}</p>)}

            <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--text-tertiary)] mb-8 pb-6 border-b border-[var(--border-subtle)]">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedPost.date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedPost.author}</span>
              {(selectedPost.views || 0) > 0 && <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {formatViews(selectedPost.views!)} views</span>}
            </div>

            {selectedPost.image && (<img src={selectedPost.image} alt={selectedPost.title} className="w-full h-auto max-h-[400px] object-cover rounded-2xl mb-10 border border-[var(--border-subtle)]" loading="lazy" />)}
            <article className="blog-article-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Trending Posts */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[var(--accent)]" /> Trending Articles
              </h3>
              <div className="space-y-3">
                {trendingPosts.map((p, i) => (
                  <button key={p.id} onClick={() => handleSelectPost(p)} className="w-full text-left flex items-start gap-3 py-2 hover:bg-[var(--accent-soft)] rounded-lg px-2 -mx-2 cursor-pointer transition-colors">
                    <span className="text-[18px] font-extrabold text-[var(--accent)] opacity-40 shrink-0 w-6">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-[var(--text-primary)] line-clamp-2 leading-snug">{p.title}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{formatViews(p.views || 0)}</span>
                        <span>{new Date(p.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[var(--accent)]" /> Recent Articles
              </h3>
              <div className="space-y-3">
                {recentPosts.filter(p => p.id !== selectedPost.id).slice(0, 4).map(p => (
                  <button key={p.id} onClick={() => handleSelectPost(p)} className="w-full text-left py-2 hover:bg-[var(--accent-soft)] rounded-lg px-2 -mx-2 cursor-pointer transition-colors">
                    <p className="text-[12px] font-medium text-[var(--text-primary)] line-clamp-2 leading-snug">{p.title}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{new Date(p.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-[var(--accent)]" /> Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c !== "All").map(cat => (
                  <button key={cat} onClick={() => { handleBack(); setActiveCategory(cat); }} className="text-[10px] font-medium px-3 py-1.5 rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer transition-colors">{cat}</button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    );
  }

  // ─── BLOG LIST VIEW (with right sidebar) ───
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto py-10 px-4">
      {/* Hero Header */}
      <div className="text-center mb-10">
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

      {/* Search + Category Filters */}
      <div className="space-y-4 mb-10">
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-11 py-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-all" />
          {searchQuery && (<button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--accent)] cursor-pointer"><X className="w-4 h-4" /></button>)}
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`text-[11px] font-medium px-4 py-2 rounded-full border cursor-pointer transition-all ${activeCategory === cat ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold" : "border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (<div className="flex items-center justify-center min-h-[30vh]"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>)}

      {!loading && filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-4"><BookOpen className="w-7 h-7 text-[var(--accent)]" /></div>
          <p className="text-[var(--text-secondary)] text-[15px] font-medium">{searchQuery ? "No articles match your search." : "No blog posts published yet."}</p>
        </div>
      )}

      {/* Main content with sidebar layout */}
      {!loading && filteredPosts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Left — Blog posts */}
          <div className="space-y-8">
            {/* Featured post */}
            <article onClick={() => handleSelectPost(filteredPosts[0])} className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden cursor-pointer hover:border-[var(--accent)] hover:shadow-[0_12px_40px_rgba(91,108,255,0.08)] transition-all duration-300">
              {filteredPosts[0].image && (
                <div className="h-[260px] overflow-hidden relative">
                  <img src={filteredPosts[0].image} alt={filteredPosts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    {filteredPosts[0].category && (<span className="inline-block text-[9px] font-bold text-white uppercase tracking-wider bg-[var(--accent)] px-2.5 py-1 rounded-full mb-2">{filteredPosts[0].category}</span>)}
                    <h2 className="text-xl font-extrabold text-white leading-tight">{filteredPosts[0].title}</h2>
                  </div>
                </div>
              )}
              <div className="p-6">
                {!filteredPosts[0].image && filteredPosts[0].category && (<span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2 inline-block">{filteredPosts[0].category}</span>)}
                {!filteredPosts[0].image && (<h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-2">{filteredPosts[0].title}</h2>)}
                {filteredPosts[0].subtitle && (<p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-4">{filteredPosts[0].subtitle}</p>)}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[11px] text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(filteredPosts[0].date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {filteredPosts[0].author}</span>
                  </div>
                  {(filteredPosts[0].views || 0) > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]"><Eye className="w-3 h-3" /> {formatViews(filteredPosts[0].views!)}</span>
                  )}
                </div>
              </div>
            </article>

            {/* Grid */}
            {filteredPosts.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredPosts.slice(1).map(post => (
                  <article key={post.id} onClick={() => handleSelectPost(post)} className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden cursor-pointer hover:border-[var(--accent)] hover:shadow-[0_8px_24px_rgba(91,108,255,0.06)] transition-all duration-200">
                    {post.image && (<div className="h-[160px] overflow-hidden"><img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" /></div>)}
                    <div className="p-4 space-y-2">
                      {post.category && (<span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-wider">{post.category}</span>)}
                      <h2 className="text-[14px] font-bold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{post.title}</h2>
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] pt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                        {(post.views || 0) > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatViews(post.views!)}</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Trending */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[var(--accent)]" /> Most Read
              </h3>
              <div className="space-y-3">
                {trendingPosts.map((p, i) => (
                  <button key={p.id} onClick={() => handleSelectPost(p)} className="w-full text-left flex items-start gap-3 py-2 hover:bg-[var(--accent-soft)] rounded-lg px-2 -mx-2 cursor-pointer transition-colors">
                    <span className="text-[16px] font-extrabold text-[var(--accent)] opacity-30 shrink-0 w-5 text-center">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[var(--text-primary)] line-clamp-2 leading-snug">{p.title}</p>
                      <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1.5">
                        <Eye className="w-3 h-3" />{formatViews(p.views || 0)} views
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[var(--accent)]" /> Latest
              </h3>
              <div className="space-y-3">
                {recentPosts.slice(0, 4).map(p => (
                  <button key={p.id} onClick={() => handleSelectPost(p)} className="w-full text-left py-2 hover:bg-[var(--accent-soft)] rounded-lg px-2 -mx-2 cursor-pointer transition-colors">
                    <p className="text-[11px] font-medium text-[var(--text-primary)] line-clamp-2 leading-snug">{p.title}</p>
                    <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">{new Date(p.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-[var(--accent)]" /> Topics
              </h3>
              <div className="space-y-1.5">
                {categories.filter(c => c !== "All").map(cat => {
                  const count = posts.filter(p => p.category === cat).length;
                  return (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className="w-full flex items-center justify-between py-2 px-2 -mx-2 hover:bg-[var(--accent-soft)] rounded-lg cursor-pointer transition-colors">
                      <span className="text-[11px] font-medium text-[var(--text-secondary)]">{cat}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-surface-alt)] px-2 py-0.5 rounded-full">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--gradient-end)] rounded-2xl p-5 text-center">
              <h3 className="text-[14px] font-bold text-white mb-1">Stay Updated</h3>
              <p className="text-[11px] text-white/70 mb-3">Get compliance alerts & guides delivered weekly.</p>
              <a href="/contact" className="inline-block px-4 py-2 bg-white text-[var(--accent)] text-[11px] font-bold rounded-xl hover:bg-white/90 transition-colors">Subscribe Free</a>
            </div>
          </aside>
        </div>
      )}
    </motion.div>
  );
}
