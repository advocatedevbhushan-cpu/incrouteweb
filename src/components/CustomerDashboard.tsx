import React, { useState, useEffect } from "react";
import { useAuth, TimelineMilestone, getDefaultTimeline } from "../lib/AuthContext";
import { 
  Clock, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  ChevronDown, 
  Check, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerDashboard() {
  const { user, profile, isMock, logoutUser } = useAuth();
  
  // Local profile state for real-time sandbox refresh in mock mode
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Sync profile locally
  useEffect(() => {
    if (!profile) return;
    setLocalProfile(profile);
  }, [profile]);

  // Periodic pull for updates when in mock mode to pick up partner actions
  useEffect(() => {
    if (!isMock || !user) return;

    const pullMockProfile = () => {
      const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
      const found = mockUsers.find((u: any) => u.uid === user.uid || u.email === user.email);
      if (found) {
        setLocalProfile(found);
      }
    };

    const interval = setInterval(pullMockProfile, 1000);
    return () => clearInterval(interval);
  }, [isMock, user]);

  if (!localProfile) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-brand-text-muted mt-3">Loading compliance profile...</p>
      </div>
    );
  }

  const timeline: TimelineMilestone[] = localProfile.timeline || getDefaultTimeline();
  const progressPercent = localProfile.progress ?? 0;
  const isCompleted = localProfile.projectStatus === "completed";

  // Calculate days remaining in 90-day grace period
  let daysRemaining = 90;
  let expirationDateString = "";
  if (isCompleted && localProfile.completedAt) {
    const completedDate = new Date(localProfile.completedAt);
    const ninetyDaysInMillis = 90 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(completedDate.getTime() + ninetyDaysInMillis);
    expirationDateString = expirationDate.toLocaleDateString();
    
    const timeDiff = expirationDate.getTime() - new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil(timeDiff / (24 * 60 * 60 * 1000)));
  }

  // Handle local sandbox simulation updates
  const simulateMilestoneChange = (milestoneId: string, nextStatus: "pending" | "in_progress" | "completed") => {
    if (!isMock) return;

    const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
    const updatedUsers = mockUsers.map((u: any) => {
      if (u.uid === localProfile.uid) {
        const updatedTimeline = (u.timeline || getDefaultTimeline()).map((m: any) => {
          if (m.id === milestoneId) {
            return { ...m, status: nextStatus, updatedAt: new Date().toISOString() };
          }
          return m;
        });

        // Recompute progress
        const completedCount = updatedTimeline.filter((m: any) => m.status === "completed").length;
        const newProgress = Math.round((completedCount / updatedTimeline.length) * 100);
        const newStatus = newProgress === 100 ? "completed" : "active";
        const newCompletedAt = newStatus === "completed" ? new Date().toISOString() : null;

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
    
    // Refresh current local profile and active mock session
    const refreshed = updatedUsers.find((u: any) => u.uid === localProfile.uid);
    setLocalProfile(refreshed);
    
    const mockSession = JSON.parse(localStorage.getItem("incroute_mock_session") || "{}");
    localStorage.setItem("incroute_mock_session", JSON.stringify({ ...mockSession, profile: refreshed }));
    
    setSuccess(`Simulated update for milestone #${milestoneId} to "${nextStatus}"`);
    setTimeout(() => setSuccess(""), 4000);
  };

  const simulateProjectExpiration = () => {
    if (!isMock) return;

    const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
    const updatedUsers = mockUsers.map((u: any) => {
      if (u.uid === localProfile.uid) {
        const expiredTimeline = (u.timeline || getDefaultTimeline()).map((m: any) => ({ ...m, status: "completed" as const }));
        // Complete 91 days ago
        const completedDate = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
        
        return {
          ...u,
          timeline: expiredTimeline,
          progress: 100,
          projectStatus: "completed",
          completedAt: completedDate.toISOString()
        };
      }
      return u;
    });

    localStorage.setItem("incroute_mock_users", JSON.stringify(updatedUsers));
    
    // Clear session and force user logout to let them see the block screen
    logoutUser();
  };

  const getOwnerBadge = (owner: "government" | "expert" | "client") => {
    if (owner === "government") {
      return (
        <span className="text-[8px] font-mono uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
          Government Side
        </span>
      );
    }
    if (owner === "expert") {
      return (
        <span className="text-[8px] font-mono uppercase font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
          Legiscorp Expert
        </span>
      );
    }
    return (
      <span className="text-[8px] font-mono uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
        Client Action
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-brand-gold/5 blur-3xl rounded-full pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full border border-brand-gold/20">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Active
          </div>
          <h1 className="text-3xl font-light serif text-brand-text">
            Client <span className="text-brand-gold italic font-normal">Compliance Journey</span>
          </h1>
          <p className="text-xs text-brand-text-muted">
            Workspace: <span className="font-mono text-brand-text">{localProfile.fullName}</span> ({user.email})
          </p>
        </div>

        {/* Real-time stats card */}
        <div className="flex flex-wrap items-center gap-6 bg-brand-bg border border-brand-border rounded-xl px-6 py-4 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-brand-text-muted">Milestones Done</span>
            <p className="text-lg font-bold text-brand-text">
              {timeline.filter(m => m.status === "completed").length} / {timeline.length}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-brand-border hidden sm:block" />
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-brand-text-muted">Progress Status</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-brand-gold">{progressPercent}%</span>
              <div className="w-20 h-1.5 bg-brand-bg-lighter rounded-full overflow-hidden border border-brand-border">
                <div className="bg-brand-gold h-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grace period lockout warning card */}
      {isCompleted && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold font-serif text-brand-text">Compliance Project Completed!</h4>
              <p className="text-xs text-brand-text-muted mt-1">
                Your statutory incorporation files and registrations have been successfully completed. 
                Under our access policy, this portal session will automatically expire on <strong className="text-brand-gold font-mono">{expirationDateString}</strong> (90 days post-completion).
              </p>
            </div>
          </div>
          <div className="bg-brand-bg border border-brand-gold/30 rounded-xl px-4 py-2 text-center shrink-0 self-start sm:self-auto">
            <span className="text-[9px] uppercase font-mono text-brand-text-muted block">Grace Access Remaining</span>
            <span className="text-sm font-bold text-brand-gold font-mono">{daysRemaining} Days</span>
          </div>
        </motion.div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left column: Simulators & Help tools */}
        <div className="space-y-6 lg:col-span-1">
          {/* Timeline legend details */}
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-brand-text font-serif flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-gold" /> Compliance Standards
            </h3>
            <p className="text-xs text-brand-text-muted leading-relaxed">
              INCroute partners manage your business filing schedules. As board meetings are resolved and certificate formats filed, milestones automatically transition from <strong className="text-brand-text">Pending</strong> to <strong className="text-brand-gold">In Progress</strong> and finally <strong className="text-emerald-400">Completed</strong>.
            </p>
            
            <div className="space-y-2.5 pt-2 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-border" />
                <span className="text-brand-text-muted uppercase">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
                <span className="text-brand-gold uppercase">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-500 uppercase">Completed</span>
              </div>
            </div>
          </div>

          {/* Sandbox interactive simulator */}
          {isMock && (
            <div className="bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono text-brand-gold uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Workspace Simulator
                </h4>
                <p className="text-[10px] text-brand-text-muted leading-relaxed">
                  As a customer, you can simulate partner updates or force a 91-day account expiration to test the access expiration rule.
                </p>
              </div>

              {success && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] rounded-lg">
                  {success}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono font-bold text-brand-text-muted">Simulate Milestone Status:</span>
                  <div className="divide-y divide-brand-border/40 border border-brand-border rounded-xl overflow-hidden text-[10px]">
                    {timeline.map((m) => (
                      <div key={m.id} className="flex justify-between items-center p-2 bg-brand-bg">
                        <span className="font-serif truncate max-w-[120px]">{m.title}</span>
                        <div className="flex gap-1 shrink-0">
                          {(["pending", "in_progress", "completed"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => simulateMilestoneChange(m.id, st)}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-tighter ${
                                m.status === st 
                                  ? st === "completed" ? "bg-emerald-500 text-black font-semibold" : st === "in_progress" ? "bg-brand-gold text-black font-semibold" : "bg-brand-border text-brand-text"
                                  : "bg-brand-bg-lighter hover:bg-brand-border text-brand-text-muted"
                              }`}
                            >
                              {st === "in_progress" ? "IP" : st.slice(0, 4)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={simulateProjectExpiration}
                  className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Simulate Expiration (91 Days Ago)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Timeline visual tracker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6">
            <h3 className="text-lg font-light serif tracking-wide flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-brand-gold" /> Compliance Milestones Checklist
            </h3>

            <div className="space-y-6 relative pl-4 sm:pl-8 before:absolute before:left-6 sm:before:left-10 before:top-2 before:bottom-2 before:w-[1px] before:bg-brand-border">
              {timeline.map((item, index) => {
                const isExpanded = expandedIndex === index;
                const statusColors = {
                  completed: "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20",
                  in_progress: "bg-brand-gold border-brand-gold text-black animate-pulse shadow-lg shadow-brand-gold/20",
                  pending: "bg-brand-bg border-brand-border text-brand-text-muted"
                };

                return (
                  <div key={item.id} className="relative space-y-2">
                    {/* Timeline Node Dot */}
                    <div 
                      className={`absolute -left-7 sm:-left-11 top-1.5 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all z-10 ${statusColors[item.status]}`}
                    >
                      {item.status === "completed" ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Milestone Card */}
                    <div 
                      onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isExpanded 
                          ? "bg-brand-bg border-brand-gold/40 shadow-xl shadow-brand-gold/[0.02]" 
                          : "bg-brand-bg/60 border-brand-border hover:border-brand-gold/30 hover:bg-brand-bg/85"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-brand-gold px-2 py-0.5 rounded bg-brand-gold/10 border border-brand-gold/20">
                              {item.days}
                            </span>
                            
                            {getOwnerBadge(item.owner)}
                            
                            {item.status === "completed" && (
                              <span className="text-[8px] font-mono uppercase font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">Completed</span>
                            )}
                            {item.status === "in_progress" && (
                              <span className="text-[8px] font-mono uppercase font-bold text-brand-gold bg-brand-gold/5 px-2 py-0.5 rounded border border-brand-gold/10 animate-pulse">In Progress</span>
                            )}
                            {item.status === "pending" && (
                              <span className="text-[8px] font-mono uppercase font-bold text-brand-text-muted bg-brand-border/10 px-2 py-0.5 rounded border border-brand-border/20">Pending</span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-brand-text font-serif leading-snug">{item.title}</h4>
                          <p className="text-[10px] font-mono text-brand-text-muted/70">{item.form}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-brand-text-muted transition-transform shrink-0 mt-1 ${isExpanded ? "rotate-180 text-brand-gold" : ""}`} />
                      </div>

                      {/* Expandable Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-4 pt-4 border-t border-brand-border/60 space-y-4 text-xs leading-relaxed"
                          >
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-mono font-bold text-brand-text-muted">Task Description</span>
                              <p className="text-brand-text-muted">{item.description}</p>
                            </div>

                            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                <span className="text-[9px] uppercase font-mono font-bold text-rose-400 tracking-wider">Penalty Risk</span>
                              </div>
                              <p className="text-rose-200 text-[11px]">{item.penalty}</p>
                            </div>

                            <div className="p-3 bg-brand-gold/5 border border-brand-gold/10 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-brand-gold" />
                                <span className="text-[9px] uppercase font-mono font-bold text-brand-gold tracking-wider">Strategy Tip</span>
                              </div>
                              <p className="text-brand-gold/90 text-[11px]">{item.tip}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
