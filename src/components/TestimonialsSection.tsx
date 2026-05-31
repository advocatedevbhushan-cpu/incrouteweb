import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  Sparkles, 
  Lock, 
  Check, 
  Trash2, 
  Edit3, 
  MessageSquare, 
  ArrowRight, 
  Plus, 
  X, 
  AlertCircle,
  ThumbsUp,
  Unlock,
  ShieldCheck,
  Briefcase
} from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  designation: string;
  entityType: string;
  rating: number;
  content: string;
  approved: boolean;
  timestamp: string;
}

export default function TestimonialsSection() {
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Submit Review Form State
  const [newName, setNewName] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newEntity, setNewEntity] = useState("Pvt Ltd Company");
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Admin Auth & Controls State
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("incroute_admin_token"));
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  // Load Testimonials
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = adminToken ? `/api/testimonials?token=${adminToken}` : "/api/testimonials";
      const response = await fetch(url);
      const data = await response.json();
      if (data.success && data.testimonials) {
        setList(data.testimonials);
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [adminToken]);

  // Admin login handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem("incroute_admin_token", data.token);
        setAdminToken(data.token);
        setShowAdminLogin(false);
        setAdminPassword("");
      } else {
        setLoginError("Incorrect administrative credentials.");
      }
    } catch {
      setLoginError("Connection failed.");
    }
  };

  // Admin log out
  const handleAdminLogout = () => {
    localStorage.removeItem("incroute_admin_token");
    setAdminToken(null);
    setEditingItem(null);
  };

  // Submit client review
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!newName.trim() || !newContent.trim()) {
      setSubmitError("Name and testimonial content are required.");
      return;
    }

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          designation: newDesignation,
          entityType: newEntity,
          rating: newRating,
          content: newContent
        })
      });
      const data = await response.json();
      if (data.success) {
        setSubmitSuccess("Testimonial submitted successfully! It will appear live once cleared by our CA/Advocate panel.");
        setNewName("");
        setNewDesignation("");
        setNewContent("");
        setNewRating(5);
        setTimeout(() => {
          setShowAddModal(false);
          setSubmitSuccess("");
          fetchReviews();
        }, 3000);
      } else {
        setSubmitError(data.error || "Submission failed.");
      }
    } catch {
      setSubmitError("Failed to submit review.");
    }
  };

  // Admin approve trigger
  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/testimonials/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: adminToken, approved: isApproved })
      });
      const data = await response.json();
      if (data.success) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  // Admin delete trigger
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this testimonial?")) return;
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: adminToken })
      });
      const data = await response.json();
      if (data.success) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Admin Edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/testimonials/${editingItem.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: adminToken,
          name: editingItem.name,
          designation: editingItem.designation,
          entityType: editingItem.entityType,
          rating: editingItem.rating,
          content: editingItem.content
        })
      });
      const data = await response.json();
      if (data.success) {
        setEditingItem(null);
        fetchReviews();
      }
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Client Testimonials
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Founder Trust & <span className="text-brand-gold italic font-normal font-serif">Client Reflections.</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          See what Indian startup founders and business owners are saying about our statutory filing speeds and elite CA/advocate review panels.
        </p>
      </div>

      {/* Primary Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center max-w-5xl mx-auto gap-4 border-b border-brand-border/60 pb-5">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-gold text-black font-mono uppercase tracking-widest text-[10px] px-5 py-3 rounded-lg hover:bg-white transition-all cursor-pointer font-bold shadow-md shadow-brand-gold/10"
        >
          <Plus className="w-4 h-4" /> Share Your Testimonial
        </button>

        {/* Admin Login Trigger */}
        <div className="flex items-center gap-2.5">
          {adminToken ? (
            <div className="flex items-center gap-3 bg-brand-gold/5 border border-brand-gold/25 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-brand-gold">
              <span className="flex items-center gap-1.5"><Unlock className="w-3.5 h-3.5" /> CA Admin Panel</span>
              <button 
                onClick={handleAdminLogout}
                className="hover:text-white uppercase hover:underline cursor-pointer border-l border-brand-gold/30 pl-2.5"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="flex items-center gap-2 bg-brand-bg-lighter hover:bg-brand-bg border border-brand-border rounded-lg text-brand-text-muted hover:text-brand-text text-[10px] px-3.5 py-2 font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-brand-gold" /> Admin Console
            </button>
          )}
        </div>
      </div>

      {/* Grid List View */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin mx-auto" />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto text-left"
        >
          {list.map((review) => {
            const isApproved = review.approved;
            return (
              <motion.div
                key={review.id}
                whileHover={{ y: -6, boxShadow: "0 15px 35px -12px rgba(197, 168, 128, 0.12)" }}
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between h-full relative transition-all duration-200 ${
                  !isApproved 
                    ? "bg-amber-950/5 border-amber-900/30" 
                    : "bg-brand-bg-lighter border-brand-border hover:border-brand-gold/30"
                }`}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 blur-xl rounded-full" />
                
                <div className="space-y-4 relative z-10">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-brand-border"}`} 
                      />
                    ))}
                    {!isApproved && (
                      <span className="ml-2 bg-amber-500/10 text-amber-400 font-mono text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                        Pending Clearance
                      </span>
                    )}
                  </div>

                  {/* Content review text */}
                  <p className="text-xs text-brand-text/90 leading-relaxed font-sans font-light">
                    "{review.content}"
                  </p>
                </div>

                {/* Footer client identity details */}
                <div className="border-t border-brand-border/60 pt-4 mt-4 flex items-center justify-between">
                  <div className="text-left space-y-0.5">
                    <h4 className="text-xs font-bold text-brand-text">{review.name}</h4>
                    <p className="text-[10px] text-brand-text-muted leading-none font-sans font-light">{review.designation}</p>
                  </div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#9E896A] font-bold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded">
                    {review.entityType}
                  </span>
                </div>

                {/* CA Admin management controls inside card */}
                {adminToken && (
                  <div className="border-t border-dashed border-brand-border/80 pt-3 mt-3 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApprove(review.id, !isApproved)}
                        className={`font-mono uppercase tracking-wider px-2.5 py-1 rounded cursor-pointer transition-colors ${
                          isApproved 
                            ? "bg-red-950/20 text-red-400 border border-red-900/30" 
                            : "bg-emerald-950/30 text-emerald-400 border border-emerald-900/40"
                        }`}
                      >
                        {isApproved ? "Disapprove" : "Approve"}
                      </button>
                      <button
                        onClick={() => setEditingItem(review)}
                        className="p-1 text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer"
                        title="Edit Review Content"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-1 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Testimonial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {list.length === 0 && (
            <div className="col-span-full py-16 text-center text-brand-text-muted font-serif italic text-xs">
              No approved client testimonials present at this moment.
            </div>
          )}
        </motion.div>
      )}

      {/* Drawer 1: Write Testimonial Submit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-bg-lighter border border-brand-gold/30 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 sm:p-8"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-brand-text-muted hover:text-brand-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-brand-border pb-3 mb-5 text-left">
                <span className="text-[9px] font-mono bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/20 uppercase tracking-widest font-bold">Write a Review</span>
                <h3 className="text-xl font-light text-brand-text serif mt-2">Submit Your Experience</h3>
                <p className="text-[9px] text-brand-text-muted mt-0.5 font-sans">Requires registrar audit before publishing live.</p>
              </div>

              {submitError && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-lg text-xs font-semibold mb-4 text-left">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 rounded-lg text-xs font-semibold mb-4 text-left">
                  {submitSuccess}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-gold rounded px-3 py-2 text-xs text-brand-text outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold">Designation / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. CEO, Acme Tech"
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-gold rounded px-3 py-2 text-xs text-brand-text outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold">Filing Entity Type</label>
                    <select
                      value={newEntity}
                      onChange={(e) => setNewEntity(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-gold rounded px-3 py-2 text-xs text-brand-text outline-none cursor-pointer"
                    >
                      <option>Pvt Ltd Company</option>
                      <option>LLP Partnership</option>
                      <option>One Person Company</option>
                      <option>Section 8 NGO</option>
                      <option>Partnership Firm</option>
                    </select>
                  </div>
                </div>

                {/* Rating selection */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold block">Rating Star Score</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-brand-text-muted hover:text-amber-400 transition-colors cursor-pointer outline-none"
                      >
                        <Star className={`w-6 h-6 ${star <= newRating ? "fill-amber-400 text-amber-400" : "text-brand-border"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold">Testimonial Content</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your registration and audit experience with Advocate Dev Bhushan..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-gold rounded px-3 py-2 text-xs text-brand-text outline-none resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-gold hover:bg-white text-black font-mono uppercase tracking-widest text-xs py-3 rounded transition-all font-bold mt-4 cursor-pointer"
                >
                  Submit Review <ArrowRight className="w-3.5 h-3.5 inline-block ml-1" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drawer 2: Admin Login Console Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminLogin(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-bg-lighter border border-brand-gold/30 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 sm:p-8"
            >
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="absolute top-4 right-4 text-brand-text-muted hover:text-brand-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-brand-border pb-3 mb-5 text-left">
                <span className="text-[9px] font-mono bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/20 uppercase tracking-widest font-bold">Lock Console</span>
                <h3 className="text-xl font-light text-brand-text serif mt-2">CA/Advocate Board Login</h3>
                <p className="text-[9px] text-brand-text-muted mt-0.5 font-sans">Verify credential key to approve reviews.</p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 rounded-lg text-xs font-semibold mb-4 text-left">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold">Console Access Key</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password key..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-gold rounded px-3.5 py-2.5 text-xs text-brand-text outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-gold hover:bg-white text-black font-mono uppercase tracking-widest text-xs py-2.5 rounded transition-all font-bold mt-2 cursor-pointer"
                >
                  Verify Key & Unlock
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drawer 3: Admin Edit Testimonial Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-bg-lighter border border-brand-gold/30 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 sm:p-8"
            >
              <button 
                onClick={() => setEditingItem(null)}
                className="absolute top-4 right-4 text-brand-text-muted hover:text-brand-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-brand-border pb-3 mb-5 text-left">
                <span className="text-[9px] font-mono bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/20 uppercase tracking-widest font-bold">Edit Review</span>
                <h3 className="text-xl font-light text-brand-text serif mt-2">Modify Testimonial Draft</h3>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold">Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-gold rounded px-3 py-2 text-xs text-brand-text outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold">Role / Designation</label>
                    <input
                      type="text"
                      value={editingItem.designation}
                      onChange={(e) => setEditingItem({ ...editingItem, designation: e.target.value })}
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-gold rounded px-3 py-2 text-xs text-brand-text outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold">Entity Type</label>
                    <input
                      type="text"
                      value={editingItem.entityType}
                      onChange={(e) => setEditingItem({ ...editingItem, entityType: e.target.value })}
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-gold rounded px-3 py-2 text-xs text-brand-text outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-brand-text-muted font-mono font-bold">Review Content</label>
                  <textarea
                    rows={4}
                    required
                    value={editingItem.content}
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border focus:border-brand-gold rounded px-3 py-2 text-xs text-brand-text outline-none resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-gold hover:bg-white text-black font-mono uppercase tracking-widest text-xs py-2.5 rounded transition-all font-bold mt-2 cursor-pointer"
                >
                  Save Modifications
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
