import React, { useState, useEffect, useRef } from "react";
import { useAuth, getDefaultTimeline, AdminCreateUserResult } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Users, Search, ChevronRight, Mail, Calendar, CheckCircle, Clock,
  UserPlus, X, Eye, EyeOff, Shield, Copy, Check, RefreshCw,
  AlertTriangle, Sparkles, UserCheck, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Password Generator ────────────────────────────────────────────────────────
function generateSecurePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "@#!$%";
  const all = upper + lower + digits + special;
  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  for (let i = 4; i < 10; i++) {
    password.push(all[Math.floor(Math.random() * all.length)]);
  }
  return password.sort(() => Math.random() - 0.5).join("");
}

// ─── New User Creation Modal ──────────────────────────────────────────────────
interface CreateUserModalProps {
  onClose: () => void;
  onCreated: (result: AdminCreateUserResult) => void;
  partners: any[];
}

function CreateUserModal({ onClose, onCreated, partners }: CreateUserModalProps) {
  const { adminCreateUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generateSecurePassword());
  const [role, setRole] = useState<"customer" | "partner">("customer");
  const [assignedPartnerId, setAssignedPartnerId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) { setError("Full name is required."); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const result = await adminCreateUser(
        email.trim().toLowerCase(),
        password,
        fullName.trim(),
        role,
        role === "customer" ? assignedPartnerId || undefined : undefined
      );
      onCreated(result);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 bg-brand-bg-lighter border border-brand-border rounded-3xl p-8 w-full max-w-lg shadow-2xl shadow-black/40"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono mb-2">
              <Shield className="w-3 h-3" /> Admin Console
            </div>
            <h3 className="text-xl font-light font-serif text-brand-text tracking-wide">Create New Account</h3>
            <p className="text-[10px] text-brand-text-muted mt-1">Credentials will be automatically sent to the user via email.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-brand-border hover:border-brand-gold/40 text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setRole("customer"); setAssignedPartnerId(""); }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === "customer"
                    ? "bg-brand-gold text-black border-brand-gold"
                    : "bg-brand-bg text-brand-text-muted border-brand-border hover:border-brand-gold/30"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Client
              </button>
              <button
                type="button"
                onClick={() => { setRole("partner"); setAssignedPartnerId(""); }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === "partner"
                    ? "bg-sky-500 text-white border-sky-500"
                    : "bg-brand-bg text-brand-text-muted border-brand-border hover:border-sky-500/30"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Partner
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">Full Name / Company</label>
            <input
              type="text"
              placeholder={role === "customer" ? "e.g. Apex Ventures Pvt Ltd" : "e.g. Adv. Ravi Kumar"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/30 focus:border-brand-gold outline-none transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">Email Address</label>
            <input
              type="email"
              placeholder="client@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/30 focus:border-brand-gold outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">Login Password</label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-2.5 pr-10 text-xs font-mono text-brand-gold placeholder-brand-text-muted/30 focus:border-brand-gold outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPassword(generateSecurePassword())}
                title="Generate new password"
                className="p-2.5 rounded-xl border border-brand-border bg-brand-bg hover:border-brand-gold/40 text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCopyPassword}
                title="Copy password"
                className="p-2.5 rounded-xl border border-brand-border bg-brand-bg hover:border-emerald-500/40 text-brand-text-muted hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Assign to Partner (customer only) */}
          {role === "customer" && partners.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">Assign to Partner (Optional)</label>
              <select
                value={assignedPartnerId}
                onChange={(e) => setAssignedPartnerId(e.target.value)}
                className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-gold outline-none transition-colors cursor-pointer"
              >
                <option value="">— Not Assigned —</option>
                {partners.map((p) => (
                  <option key={p.uid} value={p.uid}>{p.fullName} ({p.email})</option>
                ))}
              </select>
            </div>
          )}

          {/* Notice about email */}
          <div className="flex items-start gap-2 p-3 bg-sky-500/5 border border-sky-500/20 rounded-xl">
            <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-brand-text-muted leading-relaxed">
              A <span className="text-sky-400 font-semibold">welcome email</span> with login credentials will be sent to the user automatically. Make sure to copy the password before creating.
            </p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-gold hover:bg-white text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-brand-gold/15 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account & Send Credentials
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Welcome Credentials Toast ────────────────────────────────────────────────
interface CredentialsToastProps {
  result: AdminCreateUserResult;
  onClose: () => void;
}

function CredentialsToast({ result, onClose }: CredentialsToastProps) {
  const [copied, setCopied] = useState(false);

  const credText = `Login Portal: https://incroute.com/portal\nEmail: ${result.email}\nPassword: ${result.password}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(credText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 w-80 bg-brand-bg-lighter border border-emerald-500/30 rounded-2xl p-5 shadow-2xl shadow-black/40"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-text">Account Created!</p>
            <p className="text-[10px] text-brand-text-muted">Welcome email dispatched</p>
          </div>
        </div>
        <button onClick={onClose} className="text-brand-text-muted hover:text-brand-text cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 bg-brand-bg border border-brand-border rounded-xl p-3 font-mono text-[10px]">
        <div className="flex justify-between">
          <span className="text-brand-text-muted">Name</span>
          <span className="text-brand-text font-semibold">{result.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-text-muted">Role</span>
          <span className={`font-bold uppercase ${result.role === "partner" ? "text-sky-400" : "text-brand-gold"}`}>{result.role}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-text-muted">Email</span>
          <span className="text-brand-text truncate max-w-[140px]">{result.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-text-muted">Password</span>
          <span className="text-brand-gold font-bold tracking-wider">{result.password}</span>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="w-full mt-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied!" : "Copy Credentials"}
      </button>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function PartnerDashboard() {
  const { isMock, profile } = useAuth();
  const { updateCustomerProfile } = useAuth();
  const navigate = useNavigate();

  const isAdmin = profile?.role === "admin";

  const [customers, setCustomers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastCreated, setLastCreated] = useState<AdminCreateUserResult | null>(null);

  // ── Assign partner inline ────────────────────────────────────────────────────
  const [assigningCustomerId, setAssigningCustomerId] = useState<string | null>(null);

  // Pre-seed mock data if empty
  useEffect(() => {
    if (isMock) {
      const savedUsers = localStorage.getItem("incroute_mock_users");
      if (!savedUsers) {
        const seedUsers = [
          {
            uid: "partner-seed-1",
            email: "adv.sharma@incroute.com",
            fullName: "Adv. Priya Sharma",
            role: "partner",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            uid: "customer-seed-1",
            email: "client@incroute.com",
            fullName: "Bhushan Law Chambers",
            role: "customer",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 25,
            projectStatus: "active",
            completedAt: null,
            assignedPartnerId: "partner-seed-1",
            timeline: [
              { ...getDefaultTimeline()[0], status: "completed" as const },
              ...getDefaultTimeline().slice(1)
            ]
          },
          {
            uid: "customer-seed-2",
            email: "startup@incroute.com",
            fullName: "Incubate Labs Private Limited",
            role: "customer",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 0,
            projectStatus: "active",
            completedAt: null,
            timeline: getDefaultTimeline()
          }
        ];
        localStorage.setItem("incroute_mock_users", JSON.stringify(seedUsers));
      }
    }
  }, [isMock]);

  // Load profiles
  useEffect(() => {
    let active = true;

    const loadData = () => {
      try {
        if (isMock) {
          const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
          if (active) {
            setCustomers(mockUsers.filter((u: any) => u.role === "customer"));
            setPartners(mockUsers.filter((u: any) => u.role === "partner"));
            setLoading(false);
          }
        } else {
          const q = query(collection(db, "users"));
          const unsub = onSnapshot(q, (snapshot) => {
            const all: any[] = [];
            snapshot.forEach((doc) => all.push({ uid: doc.id, ...doc.data() }));
            if (active) {
              setCustomers(all.filter((p) => p.role === "customer"));
              setPartners(all.filter((p) => p.role === "partner"));
              setLoading(false);
            }
          }, (err) => {
            console.error("Error listening to users:", err);
            if (active) setLoading(false);
          });
          return unsub;
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    loadData();

    let interval: any;
    if (isMock) {
      interval = setInterval(loadData, 1500);
    }

    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [isMock]);

  const getCustomerStats = (cust: any) => {
    const progress = cust.progress ?? 0;
    const status = cust.projectStatus || "active";
    const timeline = cust.timeline || [];
    const completed = timeline.filter((m: any) => m.status === "completed").length;
    const total = timeline.length || 8;
    return { progress, status, completed, total };
  };

  const getPartnerName = (partnerId: string) => {
    const p = partners.find((x) => x.uid === partnerId);
    return p ? p.fullName : "Unassigned";
  };

  const handleAssignPartner = async (customerId: string, partnerId: string) => {
    setAssigningCustomerId(customerId);
    try {
      await updateCustomerProfile(customerId, { assignedPartnerId: partnerId || undefined } as any);
    } catch (e) {
      console.error("Assignment failed:", e);
    } finally {
      setAssigningCustomerId(null);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const term = searchQuery.toLowerCase();
    return c.fullName?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term);
  });

  const activeCount = customers.filter((c) => c.projectStatus !== "completed").length;
  const completedCount = customers.filter((c) => c.projectStatus === "completed").length;
  const unassignedCount = customers.filter((c) => !c.assignedPartnerId).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6">
        <div>
          <h1 className="text-3xl font-light serif text-brand-text">
            {isAdmin ? (
              <>Admin <span className="text-brand-gold italic font-normal">Control Panel</span></>
            ) : (
              <>Partner <span className="text-brand-gold italic font-normal">Client Registry</span></>
            )}
          </h1>
          <p className="text-xs text-brand-text-muted mt-1">
            {isAdmin
              ? "Manage all client accounts, create new users, and assign partners."
              : "View your assigned clients and manage their compliance timelines."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Stats bar */}
          <div className="flex items-center gap-5 bg-brand-bg border border-brand-border rounded-xl px-5 py-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono text-brand-text-muted">Clients</span>
              <p className="text-lg font-semibold text-brand-text">{customers.length}</p>
            </div>
            <div className="h-8 w-[1px] bg-brand-border" />
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono text-brand-text-muted">Active</span>
              <p className="text-lg font-semibold text-brand-gold">{activeCount}</p>
            </div>
            <div className="h-8 w-[1px] bg-brand-border" />
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono text-brand-text-muted">Done</span>
              <p className="text-lg font-semibold text-emerald-400">{completedCount}</p>
            </div>
            {isAdmin && (
              <>
                <div className="h-8 w-[1px] bg-brand-border" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-brand-text-muted">Unassigned</span>
                  <p className="text-lg font-semibold text-amber-400">{unassignedCount}</p>
                </div>
              </>
            )}
          </div>

          {/* Create User button – admin only */}
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-brand-gold hover:bg-white text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-brand-gold/15"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          )}
        </div>
      </div>

      {/* Partners overview strip – admin only */}
      {isAdmin && partners.length > 0 && (
        <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-brand-text font-serif">Partner Team</h3>
            <span className="ml-auto text-[10px] font-mono text-brand-text-muted">{partners.length} Partners</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {partners.map((p) => {
              const clientCount = customers.filter((c) => c.assignedPartnerId === p.uid).length;
              return (
                <div
                  key={p.uid}
                  className="flex items-center gap-2.5 bg-brand-bg border border-sky-500/10 hover:border-sky-500/30 rounded-xl px-4 py-2.5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[10px] font-bold text-sky-400 font-mono">
                    {p.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-text">{p.fullName}</p>
                    <p className="text-[10px] text-brand-text-muted font-mono">{clientCount} client{clientCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Client table */}
      <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-border/60">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-text-muted/50" />
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-2.5 pl-10 text-xs text-brand-text placeholder-brand-text-muted/30 focus:border-brand-gold outline-none transition-colors"
            />
          </div>
          <div className="text-[10px] text-brand-text-muted font-mono uppercase">
            Showing {filteredCustomers.length} of {customers.length} clients
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-brand-text-muted/30 mx-auto" />
            <p className="text-brand-text-muted font-serif italic text-sm">No client accounts found.</p>
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Create First Client
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCustomers.map((cust) => {
              const stats = getCustomerStats(cust);
              return (
                <div
                  key={cust.uid}
                  className="bg-brand-bg border border-brand-border hover:border-brand-gold/30 rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-brand-gold/5 flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/0 via-brand-gold/5 to-brand-gold/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4
                          className="text-sm font-semibold text-brand-text group-hover:text-brand-gold transition-colors font-serif truncate cursor-pointer"
                          title={cust.fullName}
                          onClick={() => navigate(`/dashboard/partner/customer/${cust.uid}`)}
                        >
                          {cust.fullName || "Unnamed Client"}
                        </h4>
                        <p className="text-[10px] font-mono text-brand-text-muted flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-brand-gold" /> {cust.email}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/dashboard/partner/customer/${cust.uid}`)}
                        className="p-1.5 rounded-lg hover:bg-brand-gold/10 text-brand-text-muted hover:text-brand-gold transition-colors cursor-pointer shrink-0"
                      >
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5 pt-2 border-t border-brand-border/40">
                      <div className="flex justify-between text-[10px] font-mono uppercase">
                        <span className="text-brand-text-muted">Filing Progress</span>
                        <span className="text-brand-gold font-bold">{stats.progress}% done</span>
                      </div>
                      <div className="w-full h-1.5 bg-brand-bg-lighter rounded-full overflow-hidden border border-brand-border">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stats.progress === 100 ? "bg-emerald-400" : "bg-brand-gold"
                          }`}
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Partner assignment – admin only */}
                    {isAdmin && (
                      <div className="pt-2 border-t border-brand-border/40">
                        <label className="text-[10px] font-mono uppercase text-brand-text-muted mb-1 block">
                          Assigned Partner
                        </label>
                        {partners.length > 0 ? (
                          <select
                            value={cust.assignedPartnerId || ""}
                            onChange={(e) => handleAssignPartner(cust.uid, e.target.value)}
                            disabled={assigningCustomerId === cust.uid}
                            className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-1.5 text-[10px] font-mono text-brand-text focus:border-brand-gold outline-none transition-colors cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">— Unassigned —</option>
                            {partners.map((p) => (
                              <option key={p.uid} value={p.uid}>{p.fullName}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-[10px] text-brand-text-muted/50 italic">No partners yet</p>
                        )}
                      </div>
                    )}

                    {/* If partner view, show who assigned */}
                    {!isAdmin && cust.assignedPartnerId && (
                      <div className="pt-2 border-t border-brand-border/40 text-[10px] font-mono text-brand-text-muted">
                        Partner: <span className="text-sky-400">{getPartnerName(cust.assignedPartnerId)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-border/40 relative z-10 text-[10px] font-mono">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                      <span className="text-brand-text-muted">{stats.completed}/{stats.total} stages</span>
                    </div>
                    {stats.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-bold uppercase tracking-wider text-[8px]">
                        <CheckCircle className="w-2.5 h-2.5" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-gold/10 text-brand-gold rounded border border-brand-gold/20 font-bold uppercase tracking-wider text-[8px]">
                        <Clock className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals & Toasts */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onCreated={(result) => {
              setShowCreateModal(false);
              setLastCreated(result);
            }}
            partners={partners}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lastCreated && (
          <CredentialsToast
            result={lastCreated}
            onClose={() => setLastCreated(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
