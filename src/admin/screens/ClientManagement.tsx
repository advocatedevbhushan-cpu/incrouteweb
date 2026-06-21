import React from "react";
import { Users, Plus, Search, ChevronRight } from "lucide-react";

const clients = [
  { id: "1", name: "ABC Private Limited", contact: "Rohit Verma", email: "rohit@abcpvtltd.com", entities: 2, status: "Active", health: 96, manager: "CA Mehra" },
  { id: "2", name: "XYZ LLP", contact: "Priya Sharma", email: "priya@xyzllp.com", entities: 1, status: "Active", health: 88, manager: "CS Priya" },
  { id: "3", name: "TechStart OPC", contact: "Arjun Mehta", email: "arjun@techstart.in", entities: 1, status: "Onboarding", health: 100, manager: "CA Mehra" },
  { id: "4", name: "GreenLeaf Foundation", contact: "Anita Das", email: "anita@greenleaf.org", entities: 1, status: "Active", health: 72, manager: "Tax Team" },
  { id: "5", name: "FastTrack Logistics", contact: "Vikram Singh", email: "vikram@fasttrack.in", entities: 3, status: "Active", health: 91, manager: "CA Mehra" },
];

export default function ClientManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Client Management</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{clients.length} clients managed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <input type="text" placeholder="Search clients..." className="pl-8 pr-3 py-2 text-[12px] bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] w-[200px]" />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Client
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-[var(--border-subtle)]">
              {["Client", "Contact", "Entities", "Health", "Status", "Manager", ""].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{h}</th>)}
            </tr></thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)]">{c.name}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{c.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{c.contact}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--text-secondary)]">{c.entities}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold ${c.health >= 90 ? "text-[var(--success)]" : c.health >= 70 ? "text-[var(--warning)]" : "text-[#EF4444]"}`}>{c.health}%</span>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">{c.status}</span></td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--text-tertiary)]">{c.manager}</td>
                  <td className="px-5 py-3.5"><ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
