"use client";

import { motion } from "framer-motion";
import {
  Factory,
  Leaf,
  CreditCard,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// ===== Animated Counter =====
function AnimCounter({ end, duration = 1.5, prefix = "", suffix = "" }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  
  useEffect(() => {
    setCount(0);
    started.current = false;
  }, [end]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let start = 0;
    const inc = end / (duration * 60);
    if (end <= 0) {
      setCount(0);
      return;
    }
    const timer = setInterval(() => {
      start += inc;
      if (start >= end) { 
        setCount(end); 
        clearInterval(timer); 
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <>{prefix}{count.toLocaleString()}{suffix}</>;
}

// ===== Custom Tooltip =====
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value} tCO₂
        </p>
      ))}
    </div>
  );
}

export default function BuyerDashboard() {
  const { user, reloadBalance } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOffset: 0,
    amountSpent: 0,
    creditsOwned: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchBuyerData = async () => {
    if (!user) return;
    try {
      // Reload auth context profiles balance
      await reloadBalance();

      // Fetch all purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("carbon_purchases")
        .select(`
          *,
          carbon_passports:passport_id (passport_number)
        `)
        .eq("buyer_id", user.id)
        .order("purchased_at", { ascending: false });

      if (purchaseError) throw purchaseError;

      const items = purchaseData || [];
      setPurchases(items);

      // Compute total spent and total offset (only sum positive credits_bought transactions, retired credits appear as negative credits_bought entries)
      let totalSpent = 0;
      let totalOffset = 0;

      items.forEach((item: any) => {
        if (item.credits_bought > 0) {
          totalOffset += item.credits_bought;
          totalSpent += item.total_amount;
        }
      });

      setStats({
        totalOffset,
        amountSpent: totalSpent,
        creditsOwned: user.carbon_balance || 0,
      });
    } catch (err) {
      console.error("Failed to load buyer dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBuyerData();
    }
  }, [user]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  // Hardcoded target, or dynamic target based on corporate carbon footprint
  const emissionsTarget = 10000;
  const offsetPercentage = Math.min(
    100,
    emissionsTarget > 0 ? Math.round((stats.totalOffset / emissionsTarget) * 100) : 0
  );

  // Generate dynamic monthly emissions vs offsets graph
  const emissionsData = Array.from({ length: 12 }, (_, i) => {
    const monthName = new Date(2026, i).toLocaleDateString("en-US", { month: "short" });
    // Simulate typical corporate emissions (e.g. around 800 tCO2 per month)
    const emissions = 800 + (i % 3) * 40 + Math.floor(Math.random() * 30);
    
    // Find how many credits were purchased in this month
    const monthlyOffsets = purchases
      .filter((p) => {
        const d = new Date(p.purchased_at);
        return d.getMonth() === i && d.getFullYear() === 2026 && p.credits_bought > 0;
      })
      .reduce((sum, p) => sum + p.credits_bought, 0);

    return {
      month: monthName,
      emissions,
      offset: monthlyOffsets,
    };
  });

  const kpis = [
    { 
      label: "Emissions Target", 
      value: emissionsTarget, 
      suffix: " tCO₂", 
      icon: Factory, 
      color: "from-red-400 to-red-500", 
      change: "Net-Zero Goal", 
      up: false, 
      accent: "text-red-600" 
    },
    { 
      label: "Total Offsets Bought", 
      value: stats.totalOffset, 
      suffix: " tCO₂", 
      icon: Leaf, 
      color: "from-emerald-500 to-emerald-600", 
      change: `₹${(stats.amountSpent / 100000).toFixed(1)} Lakhs`, 
      up: true, 
      accent: "text-emerald-600" 
    },
    { 
      label: "Active Credits Owned", 
      value: stats.creditsOwned, 
      suffix: " tCO₂", 
      icon: CreditCard, 
      color: "from-sky-500 to-sky-600", 
      change: "Available for Retirement", 
      up: true, 
      accent: "text-sky-600" 
    },
    { 
      label: "Remaining Budget", 
      value: user?.fiat_balance || 0, 
      prefix: "₹", 
      suffix: "", 
      icon: IndianRupee, 
      color: "from-amber-500 to-amber-600", 
      change: "Pre-funded Wallet", 
      up: true, 
      accent: "text-amber-600" 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-sm text-gray-500">Your carbon offset overview and portfolio</p>
      </div>

      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            variants={item}
            className="group relative p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-sm`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.accent}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              <AnimCounter end={kpi.value} prefix={kpi.prefix || ""} suffix={kpi.suffix || ""} />
            </div>
            <div className="text-sm text-gray-500">{kpi.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Emissions vs Offset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Emissions vs Offset</h3>
              <p className="text-sm text-gray-500">Monthly comparison for 2026</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={emissionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="emissions" name="Carbon Emissions" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: "#EF4444" }} />
              <Line type="monotone" dataKey="offset" name="Carbon Offsets Bought" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Offset Target */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Annual Offset Target</h3>
          <p className="text-sm text-gray-500 mb-6">Progress toward net-zero goal</p>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" stroke="url(#offsetGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - offsetPercentage / 100) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="offsetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#0EA5E9" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{offsetPercentage}%</span>
                <span className="text-xs text-gray-400">Complete</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Annual Target</span>
              <span className="font-medium text-gray-900">{emissionsTarget.toLocaleString()} tCO₂</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Offset so far</span>
              <span className="font-medium text-emerald-600">{stats.totalOffset.toLocaleString()} tCO₂</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining Gap</span>
              <span className="font-medium text-amber-600">{Math.max(0, emissionsTarget - stats.totalOffset).toLocaleString()} tCO₂</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Purchases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Carbon Credit Transaction Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          {purchases.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">No transactions recorded yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="py-3 pr-4">Type / Project</th>
                  <th className="py-3 pr-4">Passport ID</th>
                  <th className="py-3 pr-4">Tons CO₂</th>
                  <th className="py-3 pr-4">Funds Exchanged</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase, i) => {
                  const isRetirement = purchase.credits_bought < 0;
                  return (
                    <tr key={purchase.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${isRetirement ? "text-amber-500" : "text-emerald-500"}`} />
                          <span className="text-sm font-medium text-gray-900">{purchase.project_name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-gray-600 font-mono">
                          {purchase.carbon_passports?.passport_number || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-sm font-semibold ${isRetirement ? "text-amber-600" : "text-emerald-600"}`}>
                          {isRetirement ? "" : "+"}{purchase.credits_bought} tCO₂
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm font-medium text-gray-900">
                          {purchase.total_amount > 0 ? `₹${purchase.total_amount.toLocaleString()}` : "—"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-gray-500">
                          {new Date(purchase.purchased_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
