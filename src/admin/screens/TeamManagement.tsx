import React from "react";
import { Users, Plus, Shield } from "lucide-react";

const team = [
  { name: "Aakash Mehra", role: "CA", email: "aakash@incroute.com", clients: 12, tasks: 18, capacity: 80, status: "Active" },
  { name: "Priya Sinha", role: "CS", email: "priya@incroute.com", clients: 8, tasks: 12, capacity: 55, status: "Active" },
  { name: "Tax Team Lead", role: "Tax", email: "tax@incroute.com", clients: 15, tasks: 24, capacity: 95, status: "Active" },
  { name: "Rajesh Kapoor", role: "Advocate", email: "rajesh@incroute.com", clients: 6, tasks: 8, capacity: 35, status: "Active" },
  { name: "IP Team Lead", role: "IP", email: "ip@incroute.com", clients: 10, tasks: 8, capacity: 40, status: "Active" },
  { name: "Support Lead", role: "Support", email: "support@incroute.com", clients: 0, tasks: 14, capacity: 60, status: "Active" },
];

export default function TeamManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Team Management</h1><p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{team.length} active team members</p></div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors"><Plus className="w-3.5 h-3.5" /> Invite Member</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((m, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 hover:border-[var(--accent)] transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-white text-[12px] font-bold">{m.name.charAt(0)}</div>
              <div><p className="text-[13px] font-semibold text-[var(--text-primary)]">{m.name}</p><p className="text-[10px] text-[var(--text-tertiary)]">{m.role} · {m.email}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center border-t border-[var(--border-subtle)] pt-3">
              <div><p className="text-[14px] font-bold text-[var(--text-primary)]">{m.clients}</p><p className="text-[9px] text-[var(--text-tertiary)] uppercase">Clients</p></div>
              <div><p className="text-[14px] font-bold text-[var(--text-primary)]">{m.tasks}</p><p className="text-[9px] text-[var(--text-tertiary)] uppercase">Tasks</p></div>
              <div><p className="text-[14px] font-bold" style={{ color: m.capacity > 80 ? "var(--warning)" : "var(--success)" }}>{m.capacity}%</p><p className="text-[9px] text-[var(--text-tertiary)] uppercase">Load</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
