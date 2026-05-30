import React, { useState, useEffect, useMemo } from "react";
import { BlogPost } from "../types";
import { 
  BookOpen, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  Check, 
  Eye, 
  AlertCircle,
  Loader2,
  Search,
  Tag,
} from "lucide-react";
import { useLang } from "../lib/LanguageContext";

// Predefined tag taxonomy for filtering
const BLOG_TAGS = ["GST", "ROC", "LLP", "Pvt Ltd", "Startup India", "Compliance", "TDS", "OPC", "Trademark"] as const;
type BlogTag = typeof BLOG_TAGS[number];

// Auto-assign tags based on title/content keywords
function inferTags(post: BlogPost): BlogTag[] {
  const text = `${post.title} ${post.subtitle} ${post.content}`.toLowerCase();
  return BLOG_TAGS.filter((tag) => text.includes(tag.toLowerCase()));
}

export default function BlogPage() {
  const { t } = useLang();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<BlogTag | null>(null);

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Create Blog States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("Advocate Dev Bhushan");
  const [newImage, setNewImage] = useState("");
  const [imageType, setImageType] = useState<"url" | "upload">("url");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Unsplash Premium Presets
  const imagePresets = [
    { name: "Legal Authority", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800" },
    { name: "Business Consultation", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800" },
    { name: "Compliance Ledger", url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800" },
    { name: "Modern Corporate HQ", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" },
    { name: "Analytical Audit", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" }
  ];

  // Load Posts and Check Auth Session on mount
  useEffect(() => {
    fetchPosts();
    const savedToken = sessionStorage.getItem("admin_token");
    if (savedToken === "admin-session-secure-token") {
      setIsAdmin(true);
    }
  }, []);

  // Filtered posts derived from search + tag
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        !activeTag || inferTags(post).includes(activeTag);

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, activeTag]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blog/posts");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        setError(data.error || "Failed to load blog posts.");
      }
    } catch (err: any) {
      console.error("Fetch blog posts error:", err);
      setError("Unable to connect to service. Verify server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPost = async (post: BlogPost) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`/api/blog/posts/${post.id}/view`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.post) {
        setSelectedPost(data.post);
        setPosts((prev) => prev.map((p) => p.id === post.id ? data.post : p));
      }
    } catch (err) {
      console.error("Failed to increment view count:", err);
    }
  };

  // Handle Admin Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("admin_token", data.token);
        setIsAdmin(true);
        setShowLoginModal(false);
        setAdminPassword("");
      } else {
        setLoginError(data.error || "Unauthorized administrative attempt.");
      }
    } catch (err: any) {
      setLoginError("Failed reaching registration authentication server.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setIsAdmin(false);
  };

  // File to Base64 encoder
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image exceeds maximum 2MB size limit. Please choose a smaller visual file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewImage(base64String);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Handle Publish Post
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setPublishError("Please fill out both the Title and the Article Body.");
      return;
    }

    setPublishing(true);
    setPublishError(null);

    const token = sessionStorage.getItem("admin_token");
    const blogPayload = {
      title: newTitle.trim(),
      subtitle: newSubtitle.trim(),
      content: newContent,
      image: newImage || imagePresets[0].url,
      author: newAuthor.trim(),
      token
    };

    try {
      const res = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogPayload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Unshift to list
        setPosts((prev) => [data.post, ...prev]);
        setShowCreateModal(false);
        // Reset inputs
        setNewTitle("");
        setNewSubtitle("");
        setNewContent("");
        setNewImage("");
        setImagePreview(null);
      } else {
        setPublishError(data.error || "Error compiling editorial document.");
      }
    } catch (err) {
      setPublishError("Failed publishing document to secure network.");
    } finally {
      setPublishing(false);
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this corporate article?")) return;

    const token = sessionStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/blog/posts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        if (selectedPost?.id === id) {
          setSelectedPost(null);
        }
      } else {
        alert(data.error || "Failed to remove post.");
      }
    } catch (err) {
      alert("Failed sync with blog registry deletion channel.");
    }
  };

  // Custom Editorial Light Markdown Parser
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-brand-text font-bold">{part}</strong>;
      }
      return part;
    });
  };

  const renderContent = (text: string) => {
    return text.split("\n").map((para, index) => {
      const trimmed = para.trim();
      if (!trimmed) return <div key={index} className="h-4" />;
      
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={index} className="text-base sm:text-lg font-semibold text-brand-gold font-serif mt-6 mb-2.5 tracking-wide">
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={index} className="text-lg sm:text-xl font-bold text-brand-gold font-serif mt-8 mb-3 tracking-wide border-l-2 border-brand-gold/45 pl-3">
            {trimmed.replace("## ", "")}
          </h2>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={index} className="text-xl sm:text-2xl font-light text-brand-gold font-serif mt-10 mb-4 tracking-wide">
            {trimmed.replace("# ", "")}
          </h1>
        );
      }
      if (trimmed === "---") {
        return <hr key={index} className="border-brand-border/70 my-6" />;
      }
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        return (
          <li key={index} className="text-xs sm:text-sm text-brand-text-muted leading-relaxed font-sans list-disc list-inside ml-3 my-1.5">
            {parseBoldText(trimmed.substring(2))}
          </li>
        );
      }

      return (
        <p key={index} className="text-xs sm:text-sm text-brand-text-muted leading-relaxed font-sans mb-4">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-12 w-full">
      
      {/* Intro Header Section */}
      <div className="space-y-5 border-b border-brand-border/55 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-left space-y-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded font-mono uppercase tracking-widest border border-brand-gold/15">
              <Sparkles className="w-3.5 h-3.5" /> {t("blog_badge") as string}
            </div>
            <h1 className="text-3xl font-light text-brand-text tracking-tight sm:text-4xl serif">
              {t("blog_title") as string} <span className="text-brand-gold italic font-normal">{t("blog_title_accent") as string}</span>
            </h1>
            <p className="text-xs text-brand-text-muted font-sans leading-relaxed max-w-xl">
              {t("blog_subtitle") as string}
            </p>
          </div>

          {/* Admin Access Controls */}
          <div className="shrink-0 flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-brand-bg-lighter border border-brand-gold/30 rounded-xl px-3.5 py-2">
                <div className="flex items-center gap-2 text-brand-gold text-xs font-mono font-bold uppercase tracking-wider">
                  <Unlock className="w-3.5 h-3.5" /> {t("blog_admin_active") as string}
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-brand-gold text-black border border-brand-gold text-[10px] font-mono uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:bg-transparent hover:text-brand-gold"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> {t("blog_new_post") as string}
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-brand-text-muted hover:text-brand-gold border border-brand-border hover:border-brand-gold/45 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {t("blog_exit") as string}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="text-brand-text-muted hover:text-brand-gold bg-brand-bg-lighter border border-brand-border hover:border-brand-gold/25 p-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-black/5"
                title={t("blog_admin_login") as string}
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar + Tag Filters */}
        {!selectedPost && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/50" />
              <input
                type="text"
                placeholder={t("blog_search_placeholder") as string}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-brand-text-muted hover:text-brand-gold transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-brand-text-muted font-semibold">
                <Tag className="w-3 h-3" /> Tags:
              </div>
              <button
                onClick={() => setActiveTag(null)}
                className={`text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                  activeTag === null
                    ? "bg-brand-gold text-black border-brand-gold font-bold"
                    : "bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-gold/40 hover:text-brand-text"
                }`}
              >
                {t("blog_filter_all") as string}
              </button>
              {BLOG_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                    activeTag === tag
                      ? "bg-brand-gold text-black border-brand-gold font-bold"
                      : "bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-gold/40 hover:text-brand-text"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Pane */}
      {selectedPost ? (
        /* Full Article Detailed Reader */
        <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-10 space-y-6 max-w-4xl mx-auto shadow-2xl relative overflow-hidden premium-card">
          <div className="absolute top-0 right-0 w-36 h-36 bg-brand-gold/5 blur-3xl rounded-full" />
          
          <button 
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-brand-text-muted hover:text-brand-gold font-mono uppercase tracking-widest text-[10px] pb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t("blog_back") as string}
          </button>

          {/* Banner Image */}
          <div className="w-full h-[220px] sm:h-[350px] rounded-xl overflow-hidden border border-brand-border/60 shadow-inner relative">
            <img src={selectedPost.image} className="w-full h-full object-cover" alt={selectedPost.title} />
          </div>

          <div className="space-y-4 border-b border-brand-border pb-5">
            <h2 className="text-2xl sm:text-4xl font-light text-brand-text leading-tight serif">{selectedPost.title}</h2>
            <p className="text-sm sm:text-base text-brand-text-muted/80 font-sans italic">{selectedPost.subtitle}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-text-muted/75 font-mono uppercase tracking-wider pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-gold" /> {selectedPost.date}
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-gold" /> {selectedPost.author}
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-gold" /> {selectedPost.views || 0} Views
              </div>
              <span className="text-[10px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2 py-0.5 rounded">
                {t("blog_verified") as string}
              </span>
            </div>
          </div>

          {/* Render parsed light Markdown */}
          <div className="prose prose-invert max-w-none py-2">
            {renderContent(selectedPost.content)}
          </div>

          {/* Bottom Action Footer */}
          <div className="border-t border-brand-border pt-6 mt-6 flex justify-between items-center text-xs">
            <button 
              onClick={() => setSelectedPost(null)}
              className="bg-brand-bg text-brand-text-muted hover:text-brand-gold border border-brand-border hover:border-brand-gold/35 font-mono uppercase tracking-widest text-[10px] px-4 py-2.5 rounded transition-all duration-150 fast-transition snappy-press cursor-pointer font-bold"
            >
              {t("blog_close") as string}
            </button>
            
            {isAdmin && (
              <button 
                onClick={(e) => handleDeletePost(e, selectedPost.id)}
                className="text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-500 font-mono uppercase tracking-widest text-[10px] px-3.5 py-2.5 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" /> {t("blog_delete") as string}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Blog Grid List */
        <div className="space-y-10">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-brand-gold mx-auto mb-4" />
              <p className="text-xs text-brand-text-muted font-mono uppercase tracking-wider">Syncing Editorial Logs...</p>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto p-6 rounded-xl border border-red-500/10 bg-red-950/5 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <h4 className="text-sm font-semibold text-brand-text">Platform Service Connection Error</h4>
              <p className="text-xs text-brand-text-muted font-sans leading-relaxed">{error}</p>
              <button 
            onClick={fetchPosts}
            className="bg-transparent hover:bg-brand-gold text-brand-gold hover:text-black border border-brand-gold/35 hover:border-brand-gold font-mono uppercase text-[9px] tracking-widest py-2 px-4 rounded transition-all duration-150 fast-transition"
          >
                Re-establish Connection
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-brand-text-muted italic serif text-base">
              {t("blog_empty") as string}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Search className="w-8 h-8 text-brand-text-muted/40 mx-auto" />
              <p className="text-sm text-brand-text-muted italic serif">{t("blog_no_results") as string}</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveTag(null); }}
                className="text-[10px] font-mono uppercase tracking-widest text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/10 px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
                const postTags = inferTags(post);
                return (
                <div 
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className="bg-brand-bg-lighter border border-brand-border rounded-2xl overflow-hidden hover:border-brand-gold/30 transition-all duration-150 fast-transition group cursor-pointer shadow-xl flex flex-col justify-between premium-card"
                >
                  <div className="space-y-4">
                    {/* Hover Scaling Image Container */}
                    <div className="h-[180px] w-full overflow-hidden border-b border-brand-border relative">
                      <img 
                        src={post.image} 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-350 fast-transition" 
                        alt={post.title} 
                      />
                      {isAdmin && (
                        <button 
                          onClick={(e) => handleDeletePost(e, post.id)}
                          className="absolute top-3 right-3 p-2 bg-black/75 hover:bg-red-500 border border-brand-border/40 hover:border-red-600 text-brand-text hover:text-black rounded-lg transition-colors z-10 shrink-0"
                          title="Purge Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="px-5 space-y-2">
                      <span className="text-[9px] font-mono font-bold text-brand-gold uppercase tracking-widest block">
                        {post.date}
                      </span>
                      <h3 className="text-lg font-light text-brand-text group-hover:text-brand-gold transition-colors font-serif leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-brand-text-muted font-sans line-clamp-3 leading-relaxed">
                        {post.subtitle}
                      </p>
                      {/* Inferred Tag Pills */}
                      {postTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {postTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              onClick={(e) => { e.stopPropagation(); setActiveTag(tag); }}
                              className="text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/15 hover:bg-brand-gold hover:text-black transition-colors cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-4 border-t border-brand-border/50 mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-brand-text-muted">
                    <div className="flex items-center gap-3.5">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-brand-gold" /> {post.author.split(" ")[0]}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Eye className="w-3.5 h-3.5 text-brand-gold/75" /> {post.views || 0}
                      </div>
                    </div>
                    <span className="text-brand-gold font-bold flex items-center gap-1 group-hover:underline">
                      {t("blog_read") as string} <BookOpen className="w-3 h-3" />
                    </span>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- ADMINISTRATIVE LOGIN MODAL --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 premium-card">
            <button 
              onClick={() => { setShowLoginModal(false); setLoginError(null); }}
              className="absolute top-4 right-4 text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="p-3 bg-brand-gold/10 text-brand-gold border border-brand-gold/25 rounded-full inline-block">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-light text-brand-text font-serif">Administrative Portal Login</h3>
              <p className="text-xs text-brand-text-muted font-sans">
                Authenticate using secure keys to access publishing, draft modifications, and deletion gates.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-mono tracking-widest text-brand-gold font-bold">Admin Credentials Password</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter administrative password..." 
                  className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40 font-mono tracking-widest"
                  autoFocus
                  required
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/20 border border-red-500/10 text-red-400 rounded-lg text-xs leading-normal flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loginLoading}
                className="w-full bg-brand-gold disabled:bg-brand-gold/45 text-black font-mono font-bold uppercase tracking-widest text-[10px] py-3 rounded-lg transition-colors cursor-pointer shadow-lg shadow-brand-gold/10"
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Unlock Registrar Console"
                )}
              </button>
            </form>

            <div className="text-center text-[9px] text-brand-text-muted font-mono pt-2 border-t border-brand-border/60">
              Session is encrypted with local tab security keys
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE NEW BLOG MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200 premium-card">
            <button 
              onClick={() => { setShowCreateModal(false); setPublishError(null); }}
              className="absolute top-4 right-4 text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-brand-border pb-4">
              <div className="p-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/25 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-light text-brand-text font-serif">Compose Statutory Insight</h3>
                <p className="text-[9px] text-brand-text-muted font-mono tracking-widest uppercase mt-0.5">Author New Publications</p>
              </div>
            </div>

            <form onSubmit={handlePublish} className="space-y-5">
              
              {/* Grid: Title and Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-[#9E896A] font-bold">1. Article Title *</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Navigating GST Filing Changes..." 
                    className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40 font-sans"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-[#9E896A] font-bold">2. Subtitle Summary</label>
                  <input 
                    type="text" 
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="A quick summary showing on the grid card..." 
                    className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40 font-sans"
                  />
                </div>
              </div>

              {/* Grid: Author and Image Selector Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-[#9E896A] font-bold">3. Author Signature</label>
                  <input 
                    type="text" 
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Advocate Dev Bhushan" 
                    className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-[#9E896A] font-bold">4. Banner Image Option</label>
                  <div className="flex bg-brand-bg rounded-lg border border-brand-border p-0.5">
                    <button
                      type="button"
                      onClick={() => { setImageType("url"); setNewImage(""); setImagePreview(null); }}
                      className={`flex-1 text-[10px] font-mono py-1 rounded cursor-pointer ${imageType === "url" ? "bg-brand-gold text-black font-bold" : "text-brand-text-muted hover:text-brand-text"}`}
                    >
                      Image URL / Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImageType("upload"); setNewImage(""); setImagePreview(null); }}
                      className={`flex-1 text-[10px] font-mono py-1 rounded cursor-pointer ${imageType === "upload" ? "bg-brand-gold text-black font-bold" : "text-brand-text-muted hover:text-brand-text"}`}
                    >
                      Upload File (Base64)
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Input Selection Block */}
              {imageType === "url" ? (
                <div className="space-y-3 p-3.5 bg-brand-bg/60 border border-brand-border rounded-xl">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-mono tracking-wider text-brand-text-muted font-bold block">Input External Image URL</label>
                    <input 
                      type="text" 
                      value={newImage}
                      onChange={(e) => { setNewImage(e.target.value); setImagePreview(e.target.value || null); }}
                      placeholder="Paste Unsplash or static image URL..." 
                      className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40"
                    />
                  </div>
                  
                  {/* Presets Row */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase font-mono tracking-wider text-brand-text-muted font-bold block">Or Quick Premium Preset Visuals</label>
                    <div className="flex flex-wrap gap-2">
                      {imagePresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setNewImage(preset.url); setImagePreview(preset.url); }}
                          className={`text-[9px] font-sans px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                            newImage === preset.url
                              ? "bg-brand-gold/15 text-brand-gold border-brand-gold"
                              : "bg-brand-bg-lighter border-brand-border hover:border-brand-gold/45 text-brand-text-muted"
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-brand-border/80 hover:border-brand-gold/35 rounded-xl text-center space-y-2 relative transition-all duration-300">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImageIcon className="w-8 h-8 text-brand-text-muted/40 mx-auto" />
                  <p className="text-xs text-brand-text font-bold">Select File from Computer</p>
                  <p className="text-[10px] text-brand-text-muted">PNG, JPG or WEBP formats up to 2MB allowed.</p>
                </div>
              )}

              {/* Upload Image Preview Box */}
              {imagePreview && (
                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border/65 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-10 rounded overflow-hidden border border-brand-border shrink-0">
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Upload preview" />
                    </div>
                    <div>
                      <span className="text-[8px] uppercase font-mono tracking-wider bg-brand-gold/15 text-brand-gold px-1.5 py-0.5 rounded border border-brand-gold/20 font-bold">Visual Ready</span>
                      <p className="text-[10px] text-brand-text-muted mt-1 truncate max-w-xs">{newImage.startsWith("data:") ? "Base64 Compressed File" : newImage}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setNewImage(""); setImagePreview(null); }}
                    className="text-brand-text-muted hover:text-red-400 p-1.5 cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Editorial Body Text Area */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase font-mono tracking-widest text-[#9E896A] font-bold">5. Editorial Body Text (Markdown Supported) *</label>
                  <span className="text-[8px] text-brand-text-muted font-mono tracking-wider">
                    Use **bold**, # Header1, ## Header2, ### Header3, or --- for separators
                  </span>
                </div>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="### Section Heading&#10;Write your deep professional statutory details here...&#10;&#10;Use bullets with:&#10;* Bullet item one&#10;* Bullet item two" 
                  rows={8}
                  className="w-full bg-brand-input-bg border border-brand-border rounded-lg px-3.5 py-3 text-xs text-brand-text outline-none focus:border-brand-gold placeholder-brand-text-muted/40 font-mono leading-relaxed resize-y"
                  required
                />
              </div>

              {publishError && (
                <div className="p-3 bg-red-950/20 border border-red-500/10 text-red-400 rounded-lg text-xs leading-normal flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{publishError}</span>
                </div>
              )}

              {/* Actions Row */}
              <div className="border-t border-brand-border pt-4 mt-6 flex justify-end gap-3 text-xs">
                <button 
                  type="button" 
                  onClick={() => { setShowCreateModal(false); setPublishError(null); }}
                  className="bg-transparent hover:bg-brand-bg-lighter border border-brand-border text-brand-text-muted px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={publishing}
                  className="bg-brand-gold disabled:bg-brand-gold/45 text-black font-mono font-bold uppercase tracking-widest text-[10px] px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-lg shadow-brand-gold/10"
                >
                  {publishing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Publish to Live Ledger"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
