"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Satellite,
  Activity,
  Cpu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Eye,
  Layers,
  Zap,
  BarChart3,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

// Demo Data
const ndviData = [
  { month: "Jan", ndvi: 0.42, biomass: 145, health: 72 },
  { month: "Feb", ndvi: 0.45, biomass: 152, health: 74 },
  { month: "Mar", ndvi: 0.51, biomass: 168, health: 78 },
  { month: "Apr", ndvi: 0.58, biomass: 195, health: 82 },
  { month: "May", ndvi: 0.65, biomass: 228, health: 85 },
  { month: "Jun", ndvi: 0.72, biomass: 265, health: 88 },
  { month: "Jul", ndvi: 0.78, biomass: 298, health: 91 },
  { month: "Aug", ndvi: 0.81, biomass: 312, health: 92 },
  { month: "Sep", ndvi: 0.76, biomass: 285, health: 89 },
  { month: "Oct", ndvi: 0.68, biomass: 248, health: 84 },
  { month: "Nov", ndvi: 0.55, biomass: 192, health: 79 },
  { month: "Dec", ndvi: 0.47, biomass: 158, health: 75 },
];

const biomassComparison = [
  { type: "Mangrove", estimated: 312, actual: 298 },
  { type: "Wetland", estimated: 245, actual: 231 },
  { type: "Seagrass", estimated: 178, actual: 185 },
  { type: "Coral", estimated: 92, actual: 88 },
  { type: "Saltmarsh", estimated: 156, actual: 149 },
];

const radarData = [
  { metric: "NDVI Accuracy", value: 96 },
  { metric: "Biomass Est.", value: 94 },
  { metric: "Carbon Calc.", value: 97 },
  { metric: "Fraud Detect.", value: 99 },
  { metric: "Spatial Res.", value: 92 },
  { metric: "Temporal Cov.", value: 95 },
];

const verifications = [
  { project: "Sundarbans Mangrove Delta", type: "satellite", confidence: 98.2, carbon: 12450, status: "completed", time: "2 min ago" },
  { project: "Gulf of Kutch Marine", type: "ai", confidence: 96.7, carbon: 8920, status: "completed", time: "15 min ago" },
  { project: "Pichavaram Seagrass Bed", type: "ai", confidence: 94.1, carbon: 6340, status: "in_progress", time: "32 min ago" },
  { project: "Chilika Lake Reserve", type: "ground", confidence: 99.1, carbon: 15200, status: "completed", time: "1 hr ago" },
  { project: "Bhitarkanika Corridor", type: "satellite", confidence: 95.8, carbon: 9870, status: "completed", time: "2 hr ago" },
  { project: "Coringa Wildlife", type: "ai", confidence: 93.4, carbon: 7650, status: "pending", time: "3 hr ago" },
  { project: "Vembanad Wetlands", type: "satellite", confidence: 97.3, carbon: 11200, status: "completed", time: "4 hr ago" },
  { project: "Muthupet Lagoon", type: "ai", confidence: 96.0, carbon: 5430, status: "completed", time: "5 hr ago" },
];

const aiReports = [
  { text: "Sundarbans Delta showing 14% above-average mangrove regrowth in eastern sector", severity: "positive", time: "Just now" },
  { text: "NDVI anomaly resolved for CRP-00234 — seasonal variation confirmed", severity: "info", time: "8 min ago" },
  { text: "Biomass estimation model v3.2.1 deployed — 2.3% accuracy improvement", severity: "positive", time: "1 hr ago" },
  { text: "Satellite pass #4,291 complete — 48 blue carbon sites updated", severity: "info", time: "2 hr ago" },
  { text: "Carbon potential for Chilika Lake revised upward by 820 tCO₂/yr", severity: "positive", time: "3 hr ago" },
  { text: "Flagged: Possible land-use change detected near CRP-00189 boundary", severity: "warning", time: "5 hr ago" },
];

const pipelineSteps = [
  { name: "Capture", icon: Satellite, status: "done" },
  { name: "Analysis", icon: Brain, status: "done" },
  { name: "Estimation", icon: BarChart3, status: "active" },
  { name: "Verified", icon: CheckCircle2, status: "pending" },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: e.color }}>
          {e.name}: {e.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Verification Center</h1>
              <p className="text-sm text-gray-400">Autonomous satellite analysis and carbon estimation engine</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-4">
        {[
          { label: "AI Engine", status: "Online", color: "#10B981" },
          { label: "Satellite Feed", status: "Active", color: "#10B981" },
          { label: "Models", status: "v3.2.1", color: "#0EA5E9" },
          { label: "GPU Cluster", status: "98% Util.", color: "#F59E0B" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E293B]/50 border border-white/[0.06]">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: s.color }} />
            <span className="text-sm text-gray-400">{s.label}:</span>
            <span className="text-sm font-medium text-white">{s.status}</span>
          </div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Satellite Analysis Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06] overflow-hidden"
        >
          <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Satellite Analysis View</span>
            </div>
            <div className="flex gap-2">
              {["NDVI", "Biomass", "Carbon"].map((layer, i) => (
                <button key={layer} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${i === 0 ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500 hover:text-white"}`}>
                  {layer}
                </button>
              ))}
            </div>
          </div>
          {/* Simulated satellite view */}
          <div className="relative h-[320px] bg-gradient-to-br from-[#0a1628] to-[#0F172A] overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} />
            {/* Colored zones representing NDVI values */}
            {[
              { top: "15%", left: "20%", w: 120, h: 80, color: "rgba(16,185,129,0.25)", label: "High NDVI" },
              { top: "40%", left: "45%", w: 150, h: 100, color: "rgba(16,185,129,0.35)", label: "Dense Mangrove" },
              { top: "25%", left: "65%", w: 90, h: 70, color: "rgba(14,165,233,0.2)", label: "Wetland" },
              { top: "60%", left: "15%", w: 100, h: 60, color: "rgba(132,204,22,0.2)", label: "Seagrass" },
              { top: "55%", left: "55%", w: 130, h: 90, color: "rgba(20,184,166,0.25)", label: "Restoration" },
            ].map((zone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="absolute rounded-2xl border border-white/[0.06] flex items-center justify-center group cursor-pointer hover:border-emerald-500/30 transition-all"
                style={{ top: zone.top, left: zone.left, width: zone.w, height: zone.h, background: zone.color }}
              >
                <span className="text-[10px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">{zone.label}</span>
              </motion.div>
            ))}
            {/* Scanning line */}
            <motion.div
              animate={{ y: ["-100%", "400%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
            />
            {/* NDVI Scale Legend */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0F172A]/80 border border-white/[0.06]">
              <span className="text-[10px] text-gray-500">NDVI</span>
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" />
              <div className="flex justify-between w-24">
                <span className="text-[9px] text-gray-500">0.0</span>
                <span className="text-[9px] text-gray-500">1.0</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          {/* Confidence Score */}
          <div className="p-5 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06] text-center">
            <p className="text-sm text-gray-400 mb-3">Confidence Score</p>
            <div className="relative w-28 h-28 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" stroke="url(#confGrad)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={264} initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset: 264 * (1 - 0.967) }}
                  transition={{ duration: 2 }}
                />
                <defs>
                  <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#0EA5E9" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">96.7%</span>
              </div>
            </div>
          </div>

          {/* Verification Pipeline */}
          <div className="p-5 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]">
            <p className="text-sm text-gray-400 mb-4">Verification Pipeline</p>
            <div className="flex items-center justify-between">
              {pipelineSteps.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    step.status === "done" ? "bg-emerald-500/20 text-emerald-400" :
                    step.status === "active" ? "bg-sky-500/20 text-sky-400 animate-pulse" :
                    "bg-white/5 text-gray-500"
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-gray-500">{step.name}</span>
                  {i < 3 && (
                    <div className="absolute" style={{ display: "none" }}>connector</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Carbon Potential */}
          <div className="p-5 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]">
            <p className="text-sm text-gray-400 mb-1">Carbon Potential</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">12,450</span>
              <span className="text-emerald-400 text-sm mb-1">tCO₂/yr</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400">+8.3% vs last assessment</span>
            </div>
          </div>

          {/* AI Model Performance */}
          <div className="p-5 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]">
            <p className="text-sm text-gray-400 mb-3">Model Performance</p>
            <ResponsiveContainer width="100%" height={140}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748B", fontSize: 9 }} />
                <Radar dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* NDVI Monitoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <h3 className="text-lg font-semibold text-white mb-1">NDVI Monitoring</h3>
          <p className="text-sm text-gray-400 mb-4">12-month vegetation index trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ndviData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ndvi" name="NDVI" stroke="#10B981" strokeWidth={2.5} dot={{ fill: "#10B981", r: 3 }} />
              <Line type="monotone" dataKey="health" name="Health %" stroke="#0EA5E9" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Biomass Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Biomass Estimation</h3>
          <p className="text-sm text-gray-400 mb-4">AI estimated vs ground-truth by ecosystem type</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={biomassComparison} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="type" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="estimated" name="AI Estimated" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Ground Truth" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* AI Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white">AI Reports</h3>
            <div className="ml-auto">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {aiReports.map((r, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#0F172A]/50 border border-white/[0.04]">
                <div className="flex gap-2">
                  {r.severity === "positive" && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />}
                  {r.severity === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />}
                  {r.severity === "info" && <Activity className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-sm text-gray-300">{r.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{r.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Verifications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-3 p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <h3 className="font-semibold text-white mb-4">Recent Verifications</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Project", "Type", "Confidence", "Carbon Est.", "Status", "Time"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {verifications.map((v, i) => (
                  <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2 text-sm text-white">{v.project}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        v.type === "satellite" ? "bg-sky-500/10 text-sky-400" :
                        v.type === "ai" ? "bg-emerald-500/10 text-emerald-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {v.type === "satellite" ? <Satellite className="w-3 h-3" /> : v.type === "ai" ? <Cpu className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                        {v.type.charAt(0).toUpperCase() + v.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-emerald-400 font-medium">{v.confidence}%</td>
                    <td className="py-3 px-2 text-sm text-white">{v.carbon.toLocaleString()} tCO₂</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        v.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                        v.status === "in_progress" ? "bg-sky-500/10 text-sky-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {v.status === "completed" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {v.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-500">{v.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
