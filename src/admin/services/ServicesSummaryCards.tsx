import React from "react";
import { Layers, CheckCircle2, Star, ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react";
import { ServiceSummaryKpis } from "./servicesTypes";

interface ServicesSummaryCardsProps {
  kpis: ServiceSummaryKpis;
  activeFilter: string;
  onSelectKpiFilter: (filterKey: string) => void;
}

export default function ServicesSummaryCards({
  kpis,
  activeFilter,
  onSelectKpiFilter
}: ServicesSummaryCardsProps) {
  const cards = [
    {
      id: "ALL",
      title: "Total Services",
      value: kpis.totalServices,
      subText: `${kpis.activeServices} currently active`,
      icon: Layers,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      accentColor: "indigo",
      trend: "+2 this month"
    },
    {
      id: "ACTIVE",
      title: "Active Services",
      value: kpis.activeServices,
      subText: `${Math.round((kpis.activeServices / (kpis.totalServices || 1)) * 100)}% of total services`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accentColor: "emerald",
      trend: "87.5%"
    },
    {
      id: "POPULAR",
      title: "Popular Service",
      value: kpis.popularService || "Incorporation",
      subText: `${kpis.popularServiceOrdersShare || "35%"} of total orders`,
      icon: Star,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      accentColor: "amber",
      trend: "Top Performer"
    },
    {
      id: "ORDERS",
      title: "Total Orders",
      value: kpis.totalOrdersThisMonth || 156,
      subText: "Orders processed this month",
      icon: ShoppingBag,
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      accentColor: "purple",
      trend: "High Volume"
    },
    {
      id: "REVENUE",
      title: "Revenue (MTD)",
      value: `₹${(kpis.monthlyRevenue || 248500).toLocaleString("en-IN")}`,
      subText: `+${kpis.revenueGrowthPercent || 18.6}% from last month`,
      icon: TrendingUp,
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      accentColor: "rose",
      trend: "+18.6%"
    },
    {
      id: "INACTIVE",
      title: "Draft / Inactive",
      value: kpis.draftOrInactive,
      subText: "Requires admin setup review",
      icon: AlertTriangle,
      iconBg: "bg-slate-100 text-slate-600 border-slate-200",
      accentColor: "slate",
      trend: "Attention"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 text-left">
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;
        return (
          <div
            key={card.id}
            onClick={() => onSelectKpiFilter(card.id)}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
              isSelected
                ? "bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20 translate-y-[-2px]"
                : "bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                {card.subText}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
