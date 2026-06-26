"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  CheckCircle2,
  Leaf,
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function AnimCounter({ end, duration = 1.5 }: { end: number; duration?: number }) {
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

  return <>{count.toLocaleString()}</>;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function NgoDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingReview: 0,
    verifiedThisMonth: 0,
    totalCreditsIssued: 0,
    fraudAlerts: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);

  const fetchNgoData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get NGO Profile ID
      const { data: ngoProf, error: profErr } = await supabase
        .from("ngo_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profErr && profErr.code !== "PGRST116") {
        throw profErr;
      }

      const ngoProfileId = ngoProf?.id;

      // 2. Fetch assignments for statistics
      let pendingCount = 0;
      let completedCount = 0;

      if (ngoProfileId) {
        const { data: assignments, error: assignErr } = await supabase
          .from("verification_assignments")
          .select("status, created_at")
          .eq("ngo_id", ngoProfileId);

        if (assignErr) throw assignErr;

        (assignments || []).forEach((a) => {
          if (["pending_ngo_accept", "in_progress"].includes(a.status)) {
            pendingCount++;
          }
          if (a.status === "completed") {
            completedCount++;
          }
        });
      }

      // 3. Fetch total credits issued by this NGO user ID (from public.profiles)
      const { data: passports, error: passErr } = await supabase
        .from("carbon_passports")
        .select("carbon_tons")
        .eq("issuer_ngo_id", user.id);

      if (passErr) throw passErr;
      const totalIssued = (passports || []).reduce((sum, p) => sum + (p.carbon_tons || 0), 0);

      // 4. Fetch reports to calculate AI fraud alerts
      let fraudCount = 0;
      if (user) {
        const { data: reports, error: repErr } = await supabase
          .from("verification_reports")
          .select("ai_fraud_score")
          .eq("ngo_user_id", user.id);

        if (repErr) throw repErr;
        fraudCount = (reports || []).filter((r) => r.ai_fraud_score !== null && r.ai_fraud_score > 70).length;
      }

      setStats({
        pendingReview: pendingCount,
        verifiedThisMonth: completedCount,
        totalCreditsIssued: totalIssued,
        fraudAlerts: fraudCount,
      });

      // 5. Fetch recent activity (assignments or reports)
      if (ngoProfileId) {
        const { data: recent, error: recErr } = await supabase
          .from("verification_assignments")
          .select(`
            id,
            status,
            created_at,
            land_listings (
              title,
              grower_id,
              profiles!grower_id (full_name)
            )
          `)
          .eq("ngo_id", ngoProfileId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recErr) throw recErr;

        const formattedActivities = (recent || []).map((item: any) => {
          const growerName = item.land_listings?.profiles?.full_name || "Tree Grower";
          const projectTitle = item.land_listings?.title || "Restoration Area";
          
          let action = "Assigned for verification";
          let actIcon: any = ClipboardList;

          if (item.status === "completed") {
            action = "Verification completed & approved";
            actIcon = CheckCircle2;
          } else if (item.status === "in_progress") {
            action = "NGO inspection started";
            actIcon = Clock;
          }

          return {
            grower: growerName,
            project: projectTitle,
            action,
            time: new Date(item.created_at).toLocaleDateString(),
            icon: actIcon,
          };
        });

        setActivities(formattedActivities);
      }
    } catch (err: any) {
      console.error("Error loading NGO dashboard stats:", err?.message || err?.details || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNgoData();
    }
  }, [user]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  // Verification activity distribution per month simulation
  const verificationsByMonth = [
    { month: "Jan", verified: 3, rejected: 0 },
    { month: "Feb", verified: 5, rejected: 1 },
    { month: "Mar", verified: 7, rejected: 0 },
    { month: "Apr", verified: 8, rejected: 2 },
    { month: "May", verified: stats.verifiedThisMonth, rejected: stats.fraudAlerts },
    { month: "Jun", verified: 0, rejected: 0 },
  ];

  const kpis = [
    { label: "Pending Review Queue", value: stats.pendingReview, icon: ClipboardList, color: "from-amber-500 to-amber-600", accent: "text-amber-600" },
    { label: "Accredited Verifications", value: stats.verifiedThisMonth, icon: CheckCircle2, color: "from-emerald-500 to-emerald-600", accent: "text-emerald-600" },
    { label: "Total Credits Issued (tCO₂)", value: stats.totalCreditsIssued, icon: Leaf, color: "from-sky-500 to-sky-600", accent: "text-sky-600" },
    { label: "High Risk Flags (AI)", value: stats.fraudAlerts, icon: AlertTriangle, color: "from-red-400 to-red-500", accent: "text-red-600" },
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NGO Verifier Dashboard</h1>
        <p className="text-sm text-gray-500">Project verification overview and activity</p>
      </div>

      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={item}
            className="p-5 rounded-2xl bg-white border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-sm`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900"><AnimCounter end={kpi.value} /></div>
            <div className="text-sm text-gray-500">{kpi.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verifications Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Verifications by Month</h3>
          <p className="text-sm text-gray-500 mb-4">2026 verification activity distribution</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={verificationsByMonth} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="verified" name="Verified & Approved" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected / Blocked" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent NGO Verification Activity</h3>
          
          {activities.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">No recent assignments found.</div>
          ) : (
            <div className="space-y-3">
              {activities.map((a, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <a.icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900"><span className="font-semibold">{a.grower}</span> — {a.action}</p>
                    <p className="text-xs text-gray-400">{a.project} • {a.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
