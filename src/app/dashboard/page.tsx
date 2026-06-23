"use client";

import { motion } from "framer-motion";
import {
  Leaf,
  Coins,
  FolderOpen,
  DollarSign,
  Users,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ===== Animated Counter =====
function AnimCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let start = 0;
    const inc = end / (duration * 60);
    const timer = setInterval(() => {
      start += inc;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
}

// ===== Demo Data =====
const trendData = Array.from({ length: 24 }, (_, i) => {
  const date = new Date(2024, i);
  return {
    month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    carbon: 12500 + i * 2800 + Math.random() * 3000,
    credits: 8200 + i * 1900 + Math.random() * 2000,
  };
});

const marketData = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i).toLocaleDateString("en-US", { month: "short" }),
  buys: Math.floor(3000 + Math.random() * 8000),
  sells: Math.floor(2000 + Math.random() * 6000),
}));

const sparklineData = (base: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({ v: base + Math.sin(i * 0.8) * base * 0.15 + Math.random() * base * 0.1 }));

const kpis = [
  { label: "Total Carbon Verified", value: 847532, prefix: "", suffix: " tCO₂", icon: Leaf, color: "from-emerald-500 to-emerald-600", change: "+12.4%", up: true, sparkColor: "#10B981" },
  { label: "Credits Issued", value: 623841, prefix: "", suffix: "", icon: Coins, color: "from-sky-500 to-sky-600", change: "+8.7%", up: true, sparkColor: "#0EA5E9" },
  { label: "Active Projects", value: 512, prefix: "", suffix: "", icon: FolderOpen, color: "from-teal-500 to-teal-600", change: "+24", up: true, sparkColor: "#14B8A6" },
  { label: "Carbon Value Generated", value: 18750000, prefix: "$", suffix: "", icon: DollarSign, color: "from-lime-500 to-lime-600", change: "+18.2%", up: true, sparkColor: "#84CC16" },
  { label: "Communities Impacted", value: 2847, prefix: "", suffix: "", icon: Users, color: "from-cyan-500 to-cyan-600", change: "+156", up: true, sparkColor: "#06B6D4" },
  { label: "Verification Accuracy", value: 97.3, prefix: "", suffix: "%", icon: ShieldCheck, color: "from-emerald-500 to-sky-500", change: "+0.4%", up: true, sparkColor: "#10B981" },
];

const recentVerifications = [
  { project: "Sundarbans Mangrove Delta", type: "AI", confidence: 98.2, carbon: 12450, status: "completed", time: "2 min ago" },
  { project: "Gulf of Kutch Wetland", type: "Satellite", confidence: 96.7, carbon: 8920, status: "completed", time: "15 min ago" },
  { project: "Pichavaram Seagrass", type: "AI", confidence: 94.1, carbon: 6340, status: "in_progress", time: "32 min ago" },
  { project: "Chilika Lake Restoration", type: "Ground", confidence: 99.1, carbon: 15200, status: "completed", time: "1 hr ago" },
  { project: "Bhitarkanika Mangroves", type: "AI", confidence: 95.8, carbon: 9870, status: "completed", time: "2 hr ago" },
  { project: "Coringa Wildlife Reserve", type: "Satellite", confidence: 93.4, carbon: 7650, status: "pending", time: "3 hr ago" },
];

const aiInsights = [
  { text: "Mangrove growth rate in Sundarbans exceeded projections by 14% this quarter", type: "positive", time: "Just now" },
  { text: "Carbon sequestration efficiency improving across all wetland projects", type: "positive", time: "5 min ago" },
  { text: "Anomaly detected in CRP-00234 — NDVI values inconsistent with historical baseline", type: "warning", time: "12 min ago" },
  { text: "New satellite pass completed — 48 projects updated with fresh NDVI data", type: "info", time: "25 min ago" },
  { text: "Market price trend: Blue carbon credits up 3.2% in last 24 hours", type: "positive", time: "1 hr ago" },
  { text: "Community payout of ₹4.2L processed for Kutch Coastal Community", type: "info", time: "2 hr ago" },
  { text: "Verification batch #847 completed — 23 projects verified successfully", type: "positive", time: "3 hr ago" },
];

// ===== Custom Tooltip =====
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

// ===== Mini Sparkline =====
function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#spark-${color.replace("#", "")})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ===== Health Score Gauge =====
function HealthGauge({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx="80" cy="80" r={radius} fill="none" stroke="url(#gaugeGradient)" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-white">{score}</div>
        <div className="text-xs text-gray-400">Health Score</div>
      </div>
    </div>
  );
}

// ===== Dashboard Page =====
export default function DashboardPage() {
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            variants={item}
            className="group relative p-5 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300 card-hover overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, ${kpi.sparkColor}, transparent)` }} />
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {kpi.prefix}<AnimCounter end={kpi.value} />{kpi.suffix}
            </div>
            <div className="text-sm text-gray-400 mb-3">{kpi.label}</div>
            <Sparkline data={sparklineData(kpi.value, 20)} color={kpi.sparkColor} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Carbon Sequestration Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Carbon Sequestration Trend</h3>
              <p className="text-sm text-gray-400">Cumulative verified carbon over time</p>
            </div>
            <div className="flex gap-2">
              {["6M", "1Y", "2Y"].map((range, i) => (
                <button key={range} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${i === 2 ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400 hover:text-white"}`}>
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="carbon" name="Carbon (tCO₂)" stroke="#10B981" strokeWidth={2} fill="url(#carbonGrad)" />
              <Area type="monotone" dataKey="credits" name="Credits" stroke="#0EA5E9" strokeWidth={2} fill="url(#creditGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Carbon Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06] flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Carbon Health</h3>
          <p className="text-sm text-gray-400 mb-6">Ecosystem vitality index</p>
          <HealthGauge score={87} />
          <div className="mt-6 w-full space-y-3">
            {[
              { label: "Vegetation", value: 92, color: "#10B981" },
              { label: "Water Quality", value: 85, color: "#0EA5E9" },
              { label: "Biodiversity", value: 78, color: "#06B6D4" },
              { label: "Carbon Density", value: 91, color: "#84CC16" },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{m.label}</span>
                  <span className="text-white font-medium">{m.value}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.value}%` }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Marketplace Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Marketplace Activity</h3>
          <p className="text-sm text-gray-400 mb-4">Monthly trading volume</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={marketData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="buys" name="Buys" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sells" name="Sells" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Live</span>
            </div>
          </div>
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {aiInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="p-3 rounded-xl bg-[#0F172A]/60 border border-white/[0.04]"
              >
                <div className="flex items-start gap-2">
                  {insight.type === "positive" && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />}
                  {insight.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />}
                  {insight.type === "info" && <Zap className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-sm text-gray-300 leading-relaxed">{insight.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{insight.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Verifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Verifications</h3>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentVerifications.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.08 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0F172A]/40 hover:bg-[#0F172A]/60 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  v.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                  v.status === "in_progress" ? "bg-sky-500/20 text-sky-400" :
                  "bg-amber-500/20 text-amber-400"
                }`}>
                  {v.type === "AI" ? <Brain className="w-4 h-4" /> : v.type === "Satellite" ? <ArrowUpRight className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{v.project}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{v.confidence}%</span>
                    <span>•</span>
                    <span>{v.carbon.toLocaleString()} tCO₂</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {v.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {v.status === "in_progress" && <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: "3s" }} />}
                  {v.status === "pending" && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
