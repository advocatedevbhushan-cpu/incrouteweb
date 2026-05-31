import React, { useState } from "react";
import { motion } from "motion/react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, DollarSign, Clock, AlertCircle, CheckCircle2, Info, Sparkles } from "lucide-react";

interface ServiceImpactDashboardProps {
  onEntitySelect?: (entityId: string) => void;
}

export default function ServiceImpactDashboard({ onEntitySelect }: ServiceImpactDashboardProps) {
  const [activeTab, setActiveTab] = useState<"cost" | "timeline" | "compliance" | "growth">("cost");

  // Cost Breakdown Data
  const costData = [
    { name: "Government Fees", value: 45, color: "#c5a880" }, // Champagne Gold
    { name: "CA Service Charges", value: 35, color: "#94a3b8" }, // Slate Muted Gray
    { name: "DSC & DIN Credentials", value: 15, color: "#e8e5dc" }, // Alabaster Gray
    { name: "Miscellaneous Stamping", value: 5, color: "#5a4d3b" }, // Dark Gold/Bronze
  ];

  // Timeline Comparison Data
  const timelineData = [
    { name: "Pvt Ltd", days: 7, complexity: 65, compliance: 85 },
    { name: "LLP", days: 12, complexity: 55, compliance: 75 },
    { name: "OPC", days: 8, complexity: 40, compliance: 65 },
    { name: "Nidhi", days: 18, complexity: 75, compliance: 90 },
  ];

  // Compliance Over Time Data
  const complianceTimeline = [
    { month: "Month 0", compliance: 20, documents: 5 },
    { month: "Month 1", compliance: 45, documents: 8 },
    { month: "Month 2", compliance: 70, documents: 12 },
    { month: "Month 3", compliance: 85, documents: 15 },
    { month: "Month 6", compliance: 95, documents: 20 },
    { month: "Year 1", compliance: 100, documents: 25 },
  ];

  // Growth Metrics Data
  const growthData = [
    { year: "Year 1", pvtLtd: 30, llp: 20, opc: 15, nidhi: 25 },
    { year: "Year 2", pvtLtd: 65, llp: 45, opc: 35, nidhi: 50 },
    { year: "Year 3", pvtLtd: 90, llp: 65, opc: 50, nidhi: 70 },
    { year: "Year 5", pvtLtd: 100, llp: 80, opc: 65, nidhi: 85 },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  };

  const tabs = [
    { id: "cost", label: "💰 Cost Breakdown", icon: DollarSign },
    { id: "timeline", label: "⏱️ Timeline Comparison", icon: Clock },
    { id: "compliance", label: "📋 Compliance Journey", icon: CheckCircle2 },
    { id: "growth", label: "📈 Growth Potential", icon: TrendingUp },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Impact Intelligence
        </div>
        <h1 className="text-4xl font-light text-brand-text tracking-tight sm:text-5xl serif">
          Service Impact <span className="text-brand-gold italic font-normal font-serif">Visual Dashboard.</span>
        </h1>
        <p className="text-xs text-brand-text-muted font-sans max-w-xl mx-auto leading-relaxed">
          High-fidelity corporate data visualizations showing cost distribution, SLA timelines, compliance curves, and 5-year growth scalability.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-brand-gold text-black border-brand-gold shadow-md shadow-brand-gold/15"
                : "bg-brand-bg-lighter border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-gold/45"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-brand-bg-lighter border border-brand-gold/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden max-w-5xl mx-auto text-left"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
        
        {/* Cost Breakdown Chart */}
        {activeTab === "cost" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={95}
                      fill="#c5a880"
                      dataKey="value"
                    >
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Cost Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-light text-brand-text serif mb-4 border-b border-brand-border pb-2">Cost Distribution</h3>
                {costData.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-3.5 bg-brand-bg border border-brand-border rounded-xl border-l-4"
                    style={{ borderLeftColor: item.color }}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-brand-text">{item.name}</span>
                      <span className="text-base font-mono font-bold text-brand-gold">{item.value}%</span>
                    </div>
                    <div className="w-full bg-brand-border h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ delay: idx * 0.08 + 0.15, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-brand-gold/5 border border-brand-gold/15 rounded-xl flex gap-3 mt-4">
              <Info className="w-4.5 h-4.5 text-brand-gold shrink-0 mt-0.5" />
              <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
                <span className="font-bold text-brand-gold">Statutory Insight:</span> Cost proportions include direct Registrar of Companies filing receipts, digital signature authority keys, and statutory legal consultancy reviews.
              </p>
            </div>
          </div>
        )}

        {/* Timeline Comparison Chart */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={timelineData} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(197, 168, 128, 0.1)" />
                <XAxis dataKey="name" stroke="var(--color-brand-text-muted)" fontSize={10} />
                <YAxis stroke="var(--color-brand-text-muted)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-brand-bg-lighter)",
                    border: "1px solid var(--color-brand-border)",
                    borderRadius: "12px",
                    color: "var(--color-brand-text)"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="days" fill="#c5a880" name="Days to Complete" radius={[6, 6, 0, 0]} />
                <Bar dataKey="complexity" fill="#94a3b8" name="Complexity Score" radius={[6, 6, 0, 0]} />
                <Bar dataKey="compliance" fill="#5a4d3b" name="Compliance Level" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {timelineData.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="p-3.5 bg-brand-bg border border-brand-border rounded-xl text-center space-y-1"
                >
                  <p className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider">{item.name}</p>
                  <p className="text-lg font-bold text-brand-gold">{item.days} Working Days</p>
                  <p className="text-[9px] text-brand-text-muted/65 font-sans">MCA clearance duration</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Journey Chart */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={complianceTimeline} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(197, 168, 128, 0.1)" />
                <XAxis dataKey="month" stroke="var(--color-brand-text-muted)" fontSize={10} />
                <YAxis stroke="var(--color-brand-text-muted)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-brand-bg-lighter)",
                    border: "1px solid var(--color-brand-border)",
                    borderRadius: "12px",
                    color: "var(--color-brand-text)"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  stroke="#c5a880"
                  strokeWidth={3}
                  name="Compliance Level %"
                  dot={{ fill: "#c5a880", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="documents"
                  stroke="#94a3b8"
                  strokeWidth={3}
                  name="Documents Lodged"
                  dot={{ fill: "#94a3b8", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="p-4 bg-brand-gold/5 border border-brand-gold/15 rounded-xl flex gap-3 mt-4">
              <CheckCircle2 className="w-4.5 h-4.5 text-brand-gold shrink-0 mt-0.5" />
              <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
                <span className="font-bold text-brand-gold">Compliance Audit Track:</span> Deadlines scale sequentially through first-year audits. First Board meeting resolved in 30 days, Statutory Auditor appointment filed in 30 days (ADT-1), and business certificate approved in 180 days (Form 20A).
              </p>
            </div>
          </div>
        )}

        {/* Growth Potential Chart */}
        {activeTab === "growth" && (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={growthData} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(197, 168, 128, 0.1)" />
                <XAxis dataKey="year" stroke="var(--color-brand-text-muted)" fontSize={10} />
                <YAxis stroke="var(--color-brand-text-muted)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-brand-bg-lighter)",
                    border: "1px solid var(--color-brand-border)",
                    borderRadius: "12px",
                    color: "var(--color-brand-text)"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="pvtLtd"
                  stroke="#c5a880"
                  strokeWidth={3}
                  name="Pvt Ltd Structure"
                  dot={{ fill: "#c5a880", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="llp"
                  stroke="#94a3b8"
                  strokeWidth={3}
                  name="LLP Partnership"
                  dot={{ fill: "#94a3b8", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="opc"
                  stroke="#5a4d3b"
                  strokeWidth={3}
                  name="OPC Solo Structure"
                  dot={{ fill: "#5a4d3b", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="p-4 bg-brand-gold/5 border border-brand-gold/15 rounded-xl flex gap-3 mt-4">
              <TrendingUp className="w-4.5 h-4.5 text-brand-gold shrink-0 mt-0.5" />
              <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
                <span className="font-bold text-brand-gold">Scalability Index:</span> Private Limited represents maximum structural growth capacity, enabling founders to allocate equity shares directly, set up ESOP pools, and raise VC capital.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
        {[
          {
            icon: DollarSign,
            title: "Cost Alignment",
            desc: "LLP maintains 5% lower statutory tax rates, while Private Limited stands as standard to raise Venture Capital.",
            color: "text-brand-gold",
          },
          {
            icon: Clock,
            title: "SLA Speed Desk",
            desc: "One Person Companies and Private Limited companies resolve in 7-10 days. Registered partnerships complete in 3-5 days.",
            color: "text-brand-gold",
          },
          {
            icon: TrendingUp,
            title: "Scalability Lead",
            desc: "Private Limited achieves maximum 5-year scaling indexes, serving as the standard vehicle for technology startups.",
            color: "text-brand-gold",
          },
        ].map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.08 }}
              whileHover={{ y: -4 }}
              className="p-5 bg-brand-bg-lighter border border-brand-border rounded-2xl hover:border-brand-gold/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-4">
                <Icon className={`w-5 h-5 ${insight.color}`} />
              </div>
              <h4 className="font-bold text-brand-text text-sm mb-2">{insight.title}</h4>
              <p className="text-xs text-brand-text-muted leading-relaxed font-sans font-light">{insight.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
