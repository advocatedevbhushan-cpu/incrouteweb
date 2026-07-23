import React, { useState } from "react";
import { 
  Eye, Edit, MoreVertical, Building2, FileCheck, Shield, BookOpen, 
  ChevronLeft, ChevronRight, Copy, Trash2, Power, Star, Sparkles, CheckCircle2
} from "lucide-react";
import { AdminServiceItem } from "./servicesTypes";

interface ServicesTableProps {
  services: AdminServiceItem[];
  onViewService: (service: AdminServiceItem) => void;
  onEditService: (service: AdminServiceItem) => void;
  onDuplicateService: (service: AdminServiceItem) => void;
  onToggleStatus: (service: AdminServiceItem) => void;
  onDeleteService: (service: AdminServiceItem) => void;
}

export default function ServicesTable({
  services,
  onViewService,
  onEditService,
  onDuplicateService,
  onToggleStatus,
  onDeleteService
}: ServicesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totalPages = Math.ceil(services.length / pageSize) || 1;
  const paginated = services.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getServiceCategoryBadge = (category: string) => {
    switch (category) {
      case "Incorporation":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Compliance":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "GST Services":
      case "Taxation":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Trademark":
      case "Licences":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Legal & Drafting":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case "Incorporation": return Building2;
      case "Compliance": return FileCheck;
      case "Trademark": return Shield;
      default: return Sparkles;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between text-left">
      {/* Table wrapping */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-semibold">Service Name</th>
              <th className="py-3.5 px-4 font-semibold">Category</th>
              <th className="py-3.5 px-4 font-semibold text-right">Price</th>
              <th className="py-3.5 px-4 font-semibold text-center">Orders</th>
              <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginated.length > 0 ? (
              paginated.map((service) => {
                const IconComponent = getServiceIcon(service.category);
                const isMenuOpen = openMenuId === service.id;

                return (
                  <tr 
                    key={service.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Service Name & Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                            {service.name}
                            {service.isPopular && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" /> Popular
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-sm font-normal">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getServiceCategoryBadge(service.category)}`}>
                        {service.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                        ₹{service.basePrice.toLocaleString("en-IN")}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        + {service.gstRate}% GST
                      </span>
                    </td>

                    {/* Orders */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800 font-mono">
                        {service.ordersCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        service.status === "ACTIVE" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${service.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {service.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewService(service)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditService(service)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* More Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(isMenuOpen ? null : service.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 space-y-0.5 text-left text-xs">
                              <button
                                onClick={() => { onDuplicateService(service); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" /> Duplicate Service
                              </button>
                              <button
                                onClick={() => { onToggleStatus(service); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <Power className="w-3.5 h-3.5 text-slate-500" /> 
                                {service.status === "ACTIVE" ? "Deactivate" : "Activate"}
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => { onDeleteService(service); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Service
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No services matching the search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div>
          Showing {services.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, services.length)} of {services.length} services
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 cursor-pointer hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === p ? "bg-indigo-600 text-white shadow-2xs" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 cursor-pointer hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
