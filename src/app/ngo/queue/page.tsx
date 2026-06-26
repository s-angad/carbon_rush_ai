"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MapPin, Clock, AlertTriangle, ArrowRight, Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface QueueItem {
  id: string; // assignment id
  grower_name: string;
  project_name: string;
  location: string;
  hectares: number;
  ai_carbon: number;
  fraud_score: number;
  submitted_date: string;
}

export default function NgoQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    if (!user) return;

    const fetchQueue = async () => {
      setLoading(true);
      try {
        // 1. Get NGO Profile ID
        const { data: ngoProf, error: profErr } = await supabase
          .from("ngo_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profErr) {
          if (profErr.code === "PGRST116") {
            setLoading(false);
            return;
          }
          throw profErr;
        }

        // 2. Fetch assignments that are active
        const { data: assignments, error: assignErr } = await supabase
          .from("verification_assignments")
          .select(`
            id,
            created_at,
            status,
            land_listings (
              title,
              state,
              district,
              area_hectares,
              estimated_carbon_tons,
              profiles!grower_id (
                full_name
              )
            )
          `)
          .eq("ngo_id", ngoProf.id)
          .in("status", ["pending_ngo_accept", "in_progress"]);

        if (assignErr) throw assignErr;

        const formatted: QueueItem[] = (assignments || []).map((a: any) => {
          const listing = a.land_listings;
          return {
            id: a.id,
            grower_name: listing?.profiles?.full_name || "Community Grower",
            project_name: listing?.title || "Ecosystem Restoration",
            location: `${listing?.district || "District"}, ${listing?.state || "State"}`,
            hectares: listing?.area_hectares || 0,
            ai_carbon: listing?.estimated_carbon_tons || 0,
            fraud_score: Math.floor(10 + (parseInt(a.id.substring(0, 2), 16) % 35)), // deterministic mock score
            submitted_date: new Date(a.created_at).toLocaleDateString(),
          };
        });

        setQueue(formatted);
      } catch (err) {
        console.error("Failed to load queue:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [user]);

  const sorted = [...queue].sort((a, b) => {
    if (sortBy === "fraud") return b.fraud_score - a.fraud_score;
    if (sortBy === "size") return b.hectares - a.hectares;
    return new Date(b.submitted_date).getTime() - new Date(a.submitted_date).getTime();
  });

  const getFraudColor = (score: number) => {
    if (score < 30) return { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" };
    if (score < 60) return { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" };
    return { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
          <p className="text-sm text-gray-500">{queue.length} projects pending NGO review</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Sort by:</span>
          {["date", "fraud", "size"].map((s) => (
            <button 
              key={s} 
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border ${
                sortBy === s ? "bg-purple-50 text-purple-700 border-purple-200" : "text-gray-500 hover:bg-gray-100 border-transparent"
              }`}
            >
              {s === "fraud" ? "Fraud Risk" : s === "size" ? "Size" : "Date"}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden"
      >
        {queue.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No assignments waiting in your verification queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">Grower</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">Project</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">Location</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">Hectares</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">AI Carbon</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">Fraud Risk</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4">Submitted</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((project, i) => {
                  const fraud = getFraudColor(project.fraud_score);
                  return (
                    <motion.tr key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-4"><span className="text-sm font-medium text-gray-900">{project.grower_name}</span></td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{project.project_name}</span>
                          <span className="block text-xs text-gray-400 font-mono">Job-{project.id.substring(0, 8)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{project.location}</span>
                      </td>
                      <td className="py-3 px-4"><span className="text-sm text-gray-900">{project.hectares} Ha</span></td>
                      <td className="py-3 px-4"><span className="text-sm font-medium text-gray-900">{project.ai_carbon.toLocaleString()} tCO₂</span></td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${fraud.bg} ${fraud.text} ${fraud.ring}`}>
                          {project.fraud_score >= 60 ? <AlertTriangle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {project.fraud_score}%
                        </span>
                      </td>
                      <td className="py-3 px-4"><span className="text-sm text-gray-500">{project.submitted_date}</span></td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/ngo/assignments`}
                          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline font-semibold"
                        >
                          Manage Job <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
