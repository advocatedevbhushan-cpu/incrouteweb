import React, { useState, useEffect } from "react";
import { useAuth, getDefaultTimeline, checkAccountExpiration } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Clock, 
  CheckCircle, 
  Calendar, 
  Check, 
  AlertTriangle,
  Loader2,
  Lock,
  Unlock,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PartnerCustomerDetailProps {
  customerId: string;
}

export default function PartnerCustomerDetail({ customerId }: PartnerCustomerDetailProps) {
  const { isMock } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // UI feedback states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load customer metadata
  useEffect(() => {
    if (!customerId) return;

    let active = true;

    const loadCustomerData = async () => {
      try {
        if (isMock) {
          const fetchMockData = () => {
            const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
            const foundCust = mockUsers.find((u: any) => u.uid === customerId);
            if (foundCust && active) {
              setCustomer(foundCust);
              setLoading(false);
            }
          };

          fetchMockData();
          const interval = setInterval(fetchMockData, 1000);
          return () => clearInterval(interval);
        } else {
          // Data now comes from MySQL via API — this legacy component is unused
          if (active) setLoading(false);
        }
      } catch (err) {
        console.error("Error loading client data:", err);
        if (active) setLoading(false);
      }
    };

    loadCustomerData();

    return () => {
      active = false;
    };
  }, [customerId, isMock]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold mx-auto" />
        <p className="text-xs text-brand-text-muted mt-2">Loading client details...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-brand-text-muted font-serif italic text-sm">Customer profile not found.</p>
        <button
          onClick={() => navigate("/dashboard/partner")}
          className="px-4 py-2 bg-brand-gold text-black text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const timeline: TimelineMilestone[] = customer.timeline || getDefaultTimeline();
  const progressPercent = customer.progress ?? 0;
  const isCompleted = customer.projectStatus === "completed";
  const isExpired = checkAccountExpiration(customer);

  // Expiration calculations
  let expirationDateString = "";
  let daysRemaining = 90;
  if (isCompleted && customer.completedAt) {
    const completedDate = new Date(customer.completedAt);
    const ninetyDaysInMillis = 90 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(completedDate.getTime() + ninetyDaysInMillis);
    expirationDateString = expirationDate.toLocaleDateString();
    const timeDiff = expirationDate.getTime() - new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil(timeDiff / (24 * 60 * 60 * 1000)));
  }

  // Handle milestone status updates
  const handleStatusChange = async (milestoneId: string, nextStatus: "pending" | "in_progress" | "completed") => {
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const updatedTimeline = timeline.map((m) => {
        if (m.id === milestoneId) {
          return { ...m, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return m;
      });

      // Recalculate progress & completion
      const completedCount = updatedTimeline.filter((m) => m.status === "completed").length;
      const newProgress = Math.round((completedCount / updatedTimeline.length) * 100);
      const newStatus = newProgress === 100 ? "completed" : "active";
      const newCompletedAt = newStatus === "completed" ? new Date().toISOString() : null;

      if (isMock) {
        const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
        const updatedUsers = mockUsers.map((u: any) => {
          if (u.uid === customerId) {
            return {
              ...u,
              timeline: updatedTimeline,
              progress: newProgress,
              projectStatus: newStatus,
              completedAt: newCompletedAt
            };
          }
          return u;
        });
        localStorage.setItem("incroute_mock_users", JSON.stringify(updatedUsers));
        setCustomer({
          ...customer,
          timeline: updatedTimeline,
          progress: newProgress,
          projectStatus: newStatus,
          completedAt: newCompletedAt
        });
      } else {
        // Data updates now go to MySQL via API — this legacy component is unused
        setCustomer({
          ...customer,
          timeline: updatedTimeline,
          progress: newProgress,
          projectStatus: newStatus,
          completedAt: newCompletedAt
        });
      }

      setSuccess(`Successfully updated milestone status to "${nextStatus.replace("_", " ")}".`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update milestone status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/partner")}
          className="p-2.5 rounded-full border border-brand-border bg-brand-bg hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-colors duration-150 cursor-pointer text-brand-text-muted"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest font-semibold">Back to Index</span>
          <h2 className="text-xl font-light serif text-brand-text tracking-wide">Client Progress Review</h2>
        </div>
      </div>

      {/* Profile metadata card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 relative overflow-hidden">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-brand-text font-serif flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-gold" /> {customer.fullName}
          </h3>
          <p className="text-xs text-brand-text-muted font-mono flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-brand-gold" /> {customer.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 bg-brand-bg border border-brand-border rounded-xl px-5 py-3 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-brand-text-muted">Filing Journey</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-brand-gold">{progressPercent}%</span>
              <div className="w-16 h-1 bg-brand-bg-lighter rounded-full overflow-hidden border border-brand-border">
                <div className="bg-brand-gold h-full" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-brand-border" />
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-brand-text-muted">Account Status</span>
            <div>
              {isExpired ? (
                <span className="inline-flex items-center gap-1 text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                  <Lock className="w-3.5 h-3.5" /> Lockout / Expired
                </span>
              ) : isCompleted ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                  <Unlock className="w-3.5 h-3.5" /> Completed ({daysRemaining}d Left)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-brand-gold font-bold uppercase tracking-wider text-[10px]">
                  <Clock className="w-3.5 h-3.5" /> Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account expiration notice block */}
      {isCompleted && (
        <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs ${
          isExpired 
            ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        }`}>
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider font-mono">Expiration Policy Info:</span>
            {isExpired ? (
              <span className="ml-1">
                This client's workspace access has expired because their project was completed on {new Date(customer.completedAt).toLocaleDateString()}, which is more than 90 days ago. They are currently locked out of this portal.
              </span>
            ) : (
              <span className="ml-1">
                Project was completed on {new Date(customer.completedAt).toLocaleDateString()}. Client has active login access until {expirationDateString} ({daysRemaining} days remaining).
              </span>
            )}
          </div>
        </div>
      )}

      {/* Success/Error displays */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-start gap-2"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestones review workspace */}
      <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6">
        <h3 className="text-lg font-light serif tracking-wide flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-brand-gold" /> Client Milestone Status Manager
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border text-brand-text-muted uppercase font-mono tracking-wider pb-2">
                <th className="pb-3 pl-2 w-12">#</th>
                <th className="pb-3">Milestone Task Title</th>
                <th className="pb-3">Responsible Party</th>
                <th className="pb-3">Filing Form Code</th>
                <th className="pb-3">Last Updated</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Update Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {timeline.map((m, index) => (
                <tr key={m.id} className="hover:bg-brand-bg/25 transition-colors">
                  <td className="py-4 pl-2 font-mono font-bold text-brand-gold">{index + 1}</td>
                  <td className="py-4 font-serif font-semibold text-brand-text text-sm">
                    {m.title}
                    <p className="text-[10px] font-sans font-normal text-brand-text-muted leading-relaxed mt-1 max-w-sm">
                      {m.description}
                    </p>
                  </td>
                  <td className="py-4">
                    {m.owner === "government" && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20 font-mono text-[9px] font-bold uppercase">Government</span>
                    )}
                    {m.owner === "expert" && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded border border-sky-500/20 font-mono text-[9px] font-bold uppercase">Expert</span>
                    )}
                    {m.owner === "client" && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20 font-mono text-[9px] font-bold uppercase">Client</span>
                    )}
                  </td>
                  <td className="py-4 font-mono text-brand-text-muted">{m.form}</td>
                  <td className="py-4 text-brand-text-muted">
                    {m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="py-4">
                    {m.status === "completed" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-bold uppercase text-[9px]">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {m.status === "in_progress" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-gold/10 text-brand-gold rounded border border-brand-gold/20 font-bold uppercase text-[9px] animate-pulse">
                        <Clock className="w-3 h-3" /> In Progress
                      </span>
                    )}
                    {m.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-border/20 text-brand-text-muted rounded border border-brand-border/40 font-bold uppercase text-[9px]">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(["pending", "in_progress", "completed"] as const).map((st) => (
                        <button
                          key={st}
                          disabled={actionLoading || m.status === st}
                          onClick={() => handleStatusChange(m.id, st)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                            m.status === st 
                              ? st === "completed" 
                                ? "bg-emerald-500 border-emerald-500 text-black font-extrabold" 
                                : st === "in_progress"
                                  ? "bg-brand-gold border-brand-gold text-black font-extrabold"
                                  : "bg-brand-border border-brand-border text-brand-text font-bold"
                              : "bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-gold/40 hover:text-brand-text"
                          }`}
                        >
                          {st === "in_progress" ? "Working" : st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
