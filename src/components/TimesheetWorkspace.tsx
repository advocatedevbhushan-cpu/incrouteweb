import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Square,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Filter,
  DollarSign,
  TrendingUp,
  Users,
  Briefcase,
  Check,
  X,
  PieChart,
  UserCheck,
  Search
} from "lucide-react";

interface Client {
  id: string;
  companyName: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

interface TimesheetEntry {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  clientId: string | null;
  clientName: string | null;
  description: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
  billable: number; // 0 or 1
  createdAt: string;
  updatedAt: string;
}

interface TimesheetWorkspaceProps {
  mode: "admin" | "partner";
}

// Utility to format seconds to HH:MM:SS
const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0")
  ].join(":");
};

// Utility to format seconds to a readable human string (e.g. 1h 35m)
const formatHumanDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Utility to format ISO date to readable string (e.g., 14 Jul 2026)
const formatLocalDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

// Utility to format ISO time to AM/PM (e.g. 10:15 AM)
const formatLocalTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

export default function TimesheetWorkspace({ mode }: TimesheetWorkspaceProps) {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tabs: tracker, monitor (admin only), analytics
  const [activeTab, setActiveTab] = useState<"tracker" | "monitor" | "analytics">("tracker");

  // Active Timer State
  const [activeTimer, setActiveTimer] = useState<TimesheetEntry | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form input states
  const [description, setDescription] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isBillable, setIsBillable] = useState(false);

  // Editing state
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editBillable, setEditBillable] = useState(false);

  // Filters (primarily for Analytics and Monitor)
  const [filterPartner, setFilterPartner] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Analytics summary data
  const [summary, setSummary] = useState<any>({
    totalDuration: 0,
    billableDuration: 0,
    byClient: [],
    byUser: []
  });

  const apiHeaders = () => {
    const token = localStorage.getItem("incroute_access_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch clients
      const clientsRes = await fetch("/api/partner/clients", { headers: apiHeaders() });
      const clientsData = await clientsRes.json();
      if (clientsRes.ok) setClients(clientsData.clients || []);

      // 2. If admin, fetch team members
      if (mode === "admin") {
        const teamRes = await fetch("/api/admin/team", { headers: apiHeaders() });
        const teamData = await teamRes.json();
        if (teamRes.ok) setTeamMembers(teamData.team || []);
      }

      // 3. Fetch summary / active timer
      await fetchSummary();

      // 4. Fetch timesheet list
      await fetchEntries();
    } catch (err: any) {
      setError("Failed to initialize workspace data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const q = new URLSearchParams();
      if (mode === "admin" && filterPartner !== "all") q.append("userId", filterPartner);
      if (filterClient !== "all") q.append("clientId", filterClient);
      if (filterStartDate) q.append("startDate", new Date(filterStartDate).toISOString());
      if (filterEndDate) {
        // Set to end of filter date
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        q.append("endDate", end.toISOString());
      }

      const res = await fetch(`/api/partner/timesheet?${q.toString()}`, { headers: apiHeaders() });
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries || []);
      }
    } catch {}
  };

  const fetchSummary = async () => {
    try {
      const q = new URLSearchParams();
      if (mode === "admin" && filterPartner !== "all") q.append("userId", filterPartner);
      if (filterClient !== "all") q.append("clientId", filterClient);
      if (filterStartDate) q.append("startDate", new Date(filterStartDate).toISOString());
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        q.append("endDate", end.toISOString());
      }

      const res = await fetch(`/api/partner/timesheet/summary?${q.toString()}`, { headers: apiHeaders() });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        
        // Handle active timer if present
        if (data.activeTimer) {
          setActiveTimer(data.activeTimer);
          setDescription(data.activeTimer.description);
          setSelectedClientId(data.activeTimer.clientId || "");
          setIsBillable(data.activeTimer.billable === 1);
          
          // Calculate running duration
          const elapsed = Math.floor((Date.now() - new Date(data.activeTimer.startTime).getTime()) / 1000);
          setTimerSeconds(elapsed > 0 ? elapsed : 0);
        } else {
          setActiveTimer(null);
        }
      }
    } catch {}
  };

  // Run timer interval when activeTimer is running
  useEffect(() => {
    if (activeTimer) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimerSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTimer]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPartner, filterClient, filterStartDate, filterEndDate]);

  // Actions
  const handleStartTimer = async () => {
    if (!description.trim()) {
      alert("Please enter a description for the activity.");
      return;
    }
    try {
      const payload = {
        description,
        clientId: selectedClientId || null,
        billable: isBillable,
        startTime: new Date().toISOString(),
        duration: 0
      };

      const res = await fetch("/api/partner/timesheet", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchSummary();
        fetchEntries();
      }
    } catch {}
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    try {
      const endTime = new Date().toISOString();
      const elapsed = Math.floor((new Date(endTime).getTime() - new Date(activeTimer.startTime).getTime()) / 1000);
      const finalDuration = elapsed > 0 ? elapsed : 0;

      const payload = {
        description,
        clientId: selectedClientId || null,
        billable: isBillable,
        startTime: activeTimer.startTime,
        endTime,
        duration: finalDuration
      };

      const res = await fetch(`/api/partner/timesheet/${activeTimer.id}`, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setActiveTimer(null);
        setDescription("");
        setSelectedClientId("");
        setIsBillable(false);
        fetchSummary();
        fetchEntries();
      }
    } catch {}
  };


  const handleEditEntry = (entry: TimesheetEntry) => {
    setEditingEntry(entry);
    setEditDescription(entry.description);
    setEditClientId(entry.clientId || "");
    setEditBillable(entry.billable === 1);
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;
    if (!editDescription.trim()) {
      alert("Description is required.");
      return;
    }

    try {
      const payload = {
        description: editDescription,
        clientId: editClientId || null,
        billable: editBillable
      };

      const res = await fetch(`/api/partner/timesheet/${editingEntry.id}`, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingEntry(null);
        fetchSummary();
        fetchEntries();
      }
    } catch {}
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this timesheet entry?")) return;
    try {
      const res = await fetch(`/api/partner/timesheet/${id}`, {
        method: "DELETE",
        headers: apiHeaders()
      });
      if (res.ok) {
        fetchSummary();
        fetchEntries();
      }
    } catch {}
  };

  // Group entries by date
  const groupedEntries: { [key: string]: TimesheetEntry[] } = {};
  entries.forEach((entry) => {
    const dateKey = formatLocalDate(entry.startTime);
    if (!groupedEntries[dateKey]) {
      groupedEntries[dateKey] = [];
    }
    groupedEntries[dateKey].push(entry);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Timesheet Workspace
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            {mode === "admin"
              ? "Track your time and monitor partner activities."
              : "Track your client tasks and log your weekly hours."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface-alt)] p-1 rounded-xl border border-[var(--border-subtle)] self-start sm:self-center">
          <button
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
              activeTab === "tracker"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Time Tracker
          </button>
          
          {mode === "admin" && (
            <button
              onClick={() => setActiveTab("monitor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                activeTab === "monitor"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Monitor Partners
            </button>
          )}

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
              activeTab === "analytics"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Analytics
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[13px] flex items-center gap-2">
          <X className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === "tracker" && (
        <div className="space-y-6">
          {/* Real-time / Manual Log Tracker Bar */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Task Input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  disabled={!!activeTimer}
                  className="w-full px-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-2xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-75"
                />
              </div>

              {/* Client Select */}
              <div className="w-full md:w-[220px]">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={!!activeTimer}
                  className="w-full px-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-2xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-75"
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Billable and Timer Controls */}
              <div className="flex items-center justify-between md:justify-start gap-4">
                {/* Billable Toggle */}
                <button
                  type="button"
                  onClick={() => setIsBillable(!isBillable)}
                  disabled={!!activeTimer}
                  title="Billable"
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                    isBillable
                      ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]"
                      : "bg-[var(--bg-surface-alt)] border-[var(--border-subtle)] text-[var(--text-tertiary)]"
                  } disabled:opacity-75`}
                >
                  <DollarSign className="w-4 h-4" />
                </button>

                {/* Clock / Trigger Mode */}
                <div className="flex items-center gap-3">
                  <div className="font-mono text-lg font-bold text-[var(--text-primary)] min-w-[80px]">
                    {formatDuration(timerSeconds)}
                  </div>
                  {activeTimer ? (
                    <button
                      onClick={handleStopTimer}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold rounded-2xl cursor-pointer transition-colors shadow-sm"
                    >
                      <Square className="w-4 h-4 fill-current" /> Stop
                    </button>
                  ) : (
                    <button
                      onClick={handleStartTimer}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[13px] font-bold rounded-2xl cursor-pointer transition-colors shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-current" /> Start
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-secondary)]">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>
            
            {/* Client Filter */}
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>

            {/* Date Start */}
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              placeholder="Start Date"
            />

            {/* Date End */}
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              placeholder="End Date"
            />

            {(filterClient !== "all" || filterStartDate || filterEndDate) && (
              <button
                onClick={() => {
                  setFilterClient("all");
                  setFilterStartDate("");
                  setFilterEndDate("");
                }}
                className="text-[12px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Time Entry List Grouped by Day */}
          {loading ? (
            <div className="flex items-center justify-center p-12 text-[var(--text-tertiary)]">
              <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mr-2" />
              Loading timesheet entries...
            </div>
          ) : Object.keys(groupedEntries).length === 0 ? (
            <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-3xl p-12 text-center">
              <Clock className="w-10 h-10 mx-auto text-[var(--text-tertiary)] mb-3" />
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">No time entries recorded</p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">Start tracking your time or manually log your activities above.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEntries).map(([date, dayEntries]) => {
                const dayTotalSeconds = dayEntries.reduce((sum, e) => sum + (e.endTime ? e.duration : 0), 0);
                return (
                  <div key={date} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-sm">
                    {/* Day Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--bg-surface-alt)] border-b border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--accent)]" />
                        <span className="text-[13px] font-bold text-[var(--text-primary)]">{date}</span>
                      </div>
                      <div className="text-[12px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                        Total: <span className="text-[var(--text-primary)] font-mono">{formatDuration(dayTotalSeconds)}</span>
                      </div>
                    </div>

                    {/* Day Entries */}
                    <div className="divide-y divide-[var(--border-subtle)]">
                      {dayEntries.map((entry) => (
                        <div key={entry.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[var(--bg-surface-alt)]/50 transition-colors">
                          <div className="flex-1 min-w-0 space-y-1.5">
                            {/* Description and Owner badge */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate">
                                {entry.description || <span className="italic text-[var(--text-tertiary)]">No description</span>}
                              </span>

                              {entry.clientName && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/10">
                                  <Briefcase className="w-3 h-3" />
                                  {entry.clientName}
                                </span>
                              )}

                              {mode === "admin" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)]">
                                  {entry.firstName} {entry.lastName}
                                </span>
                              )}
                            </div>

                            {/* Time details */}
                            <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatLocalTime(entry.startTime)} - {entry.endTime ? formatLocalTime(entry.endTime) : "In Progress"}
                              </div>

                              {entry.billable === 1 && (
                                <span className="inline-flex items-center text-green-500 font-semibold gap-0.5 bg-green-500/10 px-2 py-0.5 rounded-lg text-[10px]">
                                  <DollarSign className="w-3 h-3" /> Billable
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Time duration & action buttons */}
                          <div className="flex items-center justify-between sm:justify-end gap-5">
                            <span className="font-mono text-[14px] font-bold text-[var(--text-primary)]">
                              {entry.endTime ? formatDuration(entry.duration) : <span className="text-[var(--accent)] animate-pulse">Tracking...</span>}
                            </span>

                            {entry.endTime && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditEntry(entry)}
                                  title="Edit entry"
                                  className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] rounded-lg hover:bg-[var(--accent-soft)] transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  title="Delete entry"
                                  className="p-2 text-[var(--text-tertiary)] hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Monitor Partners Tab (Admin Only) */}
      {activeTab === "monitor" && mode === "admin" && (
        <div className="space-y-6">
          {/* Filters for monitoring */}
          <div className="flex flex-wrap items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-secondary)]">
              <Filter className="w-3.5 h-3.5" /> Monitor Filters:
            </div>

            {/* Partner Filter */}
            <select
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All Partners</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.role.replace("_", " ")})
                </option>
              ))}
            </select>

            {/* Client Filter */}
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />

            {(filterPartner !== "all" || filterClient !== "all" || filterStartDate || filterEndDate) && (
              <button
                onClick={() => {
                  setFilterPartner("all");
                  setFilterClient("all");
                  setFilterStartDate("");
                  setFilterEndDate("");
                }}
                className="text-[12px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Active Timers Monitor */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="text-[14px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-400" /> Active Timers
            </h2>

            {entries.filter(e => !e.endTime).length === 0 ? (
              <p className="text-[12.5px] text-[var(--text-secondary)] italic">No partners are currently tracking time.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.filter(e => !e.endTime).map((entry) => (
                  <div key={entry.id} className="p-4 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-2xl flex items-start justify-between gap-3 shadow-inner">
                    <div>
                      <p className="text-[13px] font-bold text-[var(--text-primary)]">{entry.firstName} {entry.lastName}</p>
                      <p className="text-[12px] text-[var(--text-secondary)] mt-1 truncate max-w-[180px]">{entry.description}</p>
                      {entry.clientName && <p className="text-[10px] text-[var(--accent)] font-semibold mt-0.5">Client: {entry.clientName}</p>}
                    </div>
                    <span className="inline-flex px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold rounded-lg animate-pulse">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Partner Workload Summary Table */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]">
              <h2 className="text-[14.5px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <UserCheck className="w-4.5 h-4.5 text-[var(--accent)]" /> Partner Workload Summary
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] bg-[var(--bg-surface-alt)]/50">
                    <th className="px-6 py-3.5">Partner Name</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Total Tracked Time</th>
                    <th className="px-6 py-3.5">Billable Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[12.5px] text-[var(--text-secondary)]">
                  {teamMembers.map((member) => {
                    const memberSummary = summary.byUser?.find((u: any) => u.userId === member.id);
                    const hours = memberSummary ? formatHumanDuration(memberSummary.totalDuration) : "0m";
                    const billableHours = memberSummary ? formatHumanDuration(memberSummary.billableDuration) : "0m";
                    return (
                      <tr key={member.id} className="hover:bg-[var(--bg-surface-alt)]/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-[var(--text-primary)]">
                          {member.firstName} {member.lastName}
                        </td>
                        <td className="px-6 py-4 capitalize">{member.role.toLowerCase().replace("_", " ")}</td>
                        <td className="px-6 py-4 font-mono text-[11.5px]">{member.email}</td>
                        <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">{hours}</td>
                        <td className="px-6 py-4 text-green-500 font-semibold">{billableHours}</td>
                      </tr>
                    );
                  })}
                  {teamMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-tertiary)] italic">
                        No team members registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics / Metrics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm">
              <Clock className="w-5 h-5 text-[var(--accent)] mb-2.5" />
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Tracked Time</p>
              <h3 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1 font-mono">
                {formatDuration(summary.totalDuration)}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Across all tracked tasks
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm">
              <DollarSign className="w-5 h-5 text-green-500 mb-2.5" />
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Billable Hours</p>
              <h3 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1 font-mono">
                {formatDuration(summary.billableDuration)}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Time billed to client projects
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm">
              <TrendingUp className="w-5 h-5 text-purple-400 mb-2.5" />
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Billable Ratio</p>
              <h3 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
                {summary.totalDuration > 0
                  ? `${Math.round((summary.billableDuration / summary.totalDuration) * 100)}%`
                  : "0%"}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Percentage of billable activities
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm">
              <Briefcase className="w-5 h-5 text-yellow-400 mb-2.5" />
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Projects / Clients Logged</p>
              <h3 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
                {summary.byClient?.length || 0}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Active client accounts tracked
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CSS-Based Client Distribution Progress Bars */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-[15px] font-bold text-[var(--text-primary)]">
                Time Spent per Client
              </h2>
              <div className="space-y-4">
                {summary.byClient?.map((c: any) => {
                  const percent = summary.totalDuration > 0 ? Math.round((c.totalDuration / summary.totalDuration) * 100) : 0;
                  return (
                    <div key={c.clientId || "none"} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[12px] font-semibold">
                        <span className="text-[var(--text-primary)]">{c.clientName}</span>
                        <span className="text-[var(--text-secondary)] font-mono">
                          {formatHumanDuration(c.totalDuration)} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {(!summary.byClient || summary.byClient.length === 0) && (
                  <p className="text-[12.5px] text-[var(--text-secondary)] italic text-center py-6">No client hours tracked yet.</p>
                )}
              </div>
            </div>

            {/* CSS-Based Partner Workload Distribution Progress Bars (Only populated in Admin / multi-user mode) */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-[15px] font-bold text-[var(--text-primary)]">
                {mode === "admin" ? "Time Spent per Partner" : "My Workload Overview"}
              </h2>
              <div className="space-y-4">
                {mode === "admin" ? (
                  summary.byUser?.map((u: any) => {
                    const percent = summary.totalDuration > 0 ? Math.round((u.totalDuration / summary.totalDuration) * 100) : 0;
                    return (
                      <div key={u.userId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12px] font-semibold">
                          <span className="text-[var(--text-primary)]">{u.fullName}</span>
                          <span className="text-[var(--text-secondary)] font-mono">
                            {formatHumanDuration(u.totalDuration)} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="space-y-3 pt-2">
                    <p className="text-[12.5px] text-[var(--text-secondary)]">
                      You have tracked a total of <span className="font-bold text-[var(--text-primary)] font-mono">{formatHumanDuration(summary.totalDuration)}</span> across client projects.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[12px] font-semibold pt-2">
                      <div className="p-3 bg-[var(--bg-surface-alt)] rounded-xl border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-tertiary)] block text-[10px] uppercase">Billable</span>
                        <span className="text-green-500 font-mono text-[14px] mt-1 block">
                          {formatHumanDuration(summary.billableDuration)}
                        </span>
                      </div>
                      <div className="p-3 bg-[var(--bg-surface-alt)] rounded-xl border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-tertiary)] block text-[10px] uppercase">Non-Billable</span>
                        <span className="text-[var(--text-secondary)] font-mono text-[14px] mt-1 block">
                          {formatHumanDuration(summary.totalDuration - summary.billableDuration)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {mode === "admin" && (!summary.byUser || summary.byUser.length === 0) && (
                  <p className="text-[12.5px] text-[var(--text-secondary)] italic text-center py-6">No partner hours tracked yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing Dialog Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-lg rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Edit Timesheet Entry</h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                  Client
                </label>
                <select
                  value={editClientId}
                  onChange={(e) => setEditClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="">No Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="editBillable"
                  checked={editBillable}
                  onChange={(e) => setEditBillable(e.target.checked)}
                  className="rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)] h-4 w-4"
                />
                <label htmlFor="editBillable" className="text-[13px] font-semibold text-[var(--text-primary)] cursor-pointer select-none">
                  This task is billable
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[var(--border-subtle)] pt-4">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[12.5px] font-semibold text-[var(--text-primary)] rounded-xl hover:bg-[var(--border-subtle)]/30 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateEntry}
                className="px-4.5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12.5px] font-bold rounded-xl cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
