import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminShell from "./AdminShell";
import BooksApp from "../books/BooksApp";
import AdminDashboard from "./screens/AdminDashboard";
import TimesheetWorkspace from "../components/TimesheetWorkspace";
import ClientManagement from "./screens/ClientManagement";
import ComplianceOps from "./screens/ComplianceOps";
import TaskManagement from "./screens/TaskManagement";
import DocumentOps from "./screens/DocumentOps";
import InvoiceOps from "./screens/InvoiceOps";
import ProformaOps from "./screens/ProformaOps";
import TeamManagement from "./screens/TeamManagement";
import ServiceRequestOps from "./screens/ServiceRequestOps";
import { TicketOps, ConsultationOps, TrademarkOps, LegalOps, ReportingDashboard, AuditCenter } from "./screens/OpsScreens";

function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("incroute_access_token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setMessage(data.error || "Failed to update password.");
      }
    } catch {
      setMessage("Network error.");
    }
    setSaving(false);
  };

  const user = (() => { try { return JSON.parse(localStorage.getItem("incroute_user") || "{}"); } catch { return {}; } })();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">Manage your account and preferences.</p>
      </div>

      {/* Account Info */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Account Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
          <div><span className="text-[var(--text-tertiary)]">Email:</span> <span className="text-[var(--text-primary)] font-medium ml-1">{user.email || "—"}</span></div>
          <div><span className="text-[var(--text-tertiary)]">Name:</span> <span className="text-[var(--text-primary)] font-medium ml-1">{user.firstName} {user.lastName}</span></div>
          <div><span className="text-[var(--text-tertiary)]">Role:</span> <span className="text-[var(--text-primary)] font-medium ml-1">{user.role || "—"}</span></div>
        </div>
      </div>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Change Password</h2>
        {message && <p className={`text-[12px] ${message.includes("success") ? "text-green-500" : "text-red-400"}`}>{message}</p>}
        <div className="space-y-3">
          <input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]" />
          <input type="password" placeholder="New password (min 8 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]" />
        </div>
        <button type="submit" disabled={saving || !currentPassword || !newPassword || newPassword.length < 8}
          className="px-5 py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-xl disabled:opacity-50 cursor-pointer hover:bg-[var(--accent-deep)] transition-colors">
          {saving ? "Saving..." : "Update Password"}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="bg-[var(--bg-surface)] border border-red-500/20 rounded-2xl p-6 space-y-3">
        <h2 className="text-[14px] font-semibold text-red-400">Danger Zone</h2>
        <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="px-4 py-2 border border-red-500/30 text-red-400 text-[12px] font-medium rounded-xl hover:bg-red-500/10 cursor-pointer transition-colors">
          Sign Out & Clear Session
        </button>
      </div>
    </div>
  );
}

export default function AdminPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [screen, setScreenState] = useState(() => location.pathname.startsWith("/admin/books") ? "books" : "dashboard");

  useEffect(() => {
    if (location.pathname.startsWith("/admin/books")) {
      setScreenState("books");
    } else {
      setScreenState((current) => current === "books" ? "dashboard" : current);
    }
  }, [location.pathname]);

  const setScreen = (nextScreen: string) => {
    setScreenState(nextScreen);
    if (nextScreen === "books") navigate("/admin/books/dashboard");
    else if (location.pathname.startsWith("/admin/books")) navigate("/admin");
  };

  const renderScreen = () => {
    switch (screen) {
      case "dashboard": return <AdminDashboard onNavigate={setScreen} />;
      case "clients": return <ClientManagement />;
      case "service-requests": return <ServiceRequestOps />;
      case "compliance": return <ComplianceOps />;
      case "tasks": return <TaskManagement />;
      case "documents": return <DocumentOps />;
      case "invoices": return <InvoiceOps />;
      case "proforma": return <ProformaOps />;
      case "team": return <TeamManagement />;
      case "tickets": return <TicketOps />;
      case "consultations": return <ConsultationOps />;
      case "trademarks": return <TrademarkOps />;
      case "legal": return <LegalOps />;
      case "reports": return <ReportingDashboard />;
      case "audit": return <AuditCenter />;
      case "timesheets": return <TimesheetWorkspace mode="admin" />;
      case "settings": return <AdminSettings />;
      default: return <AdminDashboard onNavigate={setScreen} />;
    }
  };

  if (screen === "books") {
    return <BooksApp basePath="/admin/books" onExit={(nextScreen = "dashboard") => setScreen(nextScreen)} />;
  }

  return (
    <AdminShell activeScreen={screen} setActiveScreen={setScreen}>
      {renderScreen()}
    </AdminShell>
  );
}
