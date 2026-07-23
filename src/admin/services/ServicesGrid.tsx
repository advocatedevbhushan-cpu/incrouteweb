import React from "react";
import { Eye, Edit, Copy, Trash2, Power, Star, Building2, FileCheck, Shield, Sparkles, ShoppingBag } from "lucide-react";
import { AdminServiceItem } from "./servicesTypes";

interface ServicesGridProps {
  services: AdminServiceItem[];
  onViewService: (service: AdminServiceItem) => void;
  onEditService: (service: AdminServiceItem) => void;
  onDuplicateService: (service: AdminServiceItem) => void;
  onToggleStatus: (service: AdminServiceItem) => void;
  onDeleteService: (service: AdminServiceItem) => void;
}

export default function ServicesGrid({
  services,
  onViewService,
  onEditService,
  onDuplicateService,
  onToggleStatus,
  onDeleteService
}: ServicesGridProps) {
  const getServiceCategoryBadge = (category: string) => {
    switch (category) {
      case "Incorporation": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Compliance": return "bg-purple-50 text-purple-700 border-purple-200";
      case "GST Services":
      case "Taxation": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Trademark":
      case "Licences": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
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

  if (!services.length) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
        No services found matching current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 text-left">
      {services.map((service) => {
        const IconComponent = getServiceIcon(service.category);

        return (
          <div
            key={service.id}
            className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative"
          >
            {/* Top Bar: Icon + Category + Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${getServiceCategoryBadge(service.category)}`}>
                  {service.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  service.status === "ACTIVE" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {service.status}
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>{service.name}</span>
                {service.isPopular && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                {service.description}
              </p>
            </div>

            {/* Price & Stats */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Starting From</span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">
                  ₹{service.basePrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Total Orders</span>
                <span className="font-bold text-slate-700 font-mono flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-slate-400" /> {service.ordersCount}
                </span>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onViewService(service)}
                className="flex-1 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </button>

              <button
                onClick={() => onEditService(service)}
                className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Edit Service"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDuplicateService(service)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteService(service)}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Delete Service"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
