"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { IndianRupee, TreePine, MapPin, Leaf, CheckCircle2, Clock, UploadCloud, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function GrowerDashboard() {
  const { user, reloadBalance } = useAuth();
  const [latestListing, setLatestListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    reloadBalance();
    
    const fetchLatestListing = async () => {
      try {
        const { data, error } = await supabase
          .from("land_listings")
          .select("*")
          .eq("grower_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0) {
          setLatestListing(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch latest listing", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestListing();
  }, [user]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const getPipelineSteps = (status: string) => {
    return [
      { label: "Project Registered", status: "done" },
      { label: "AI Satellite Check", status: "done" },
      { 
        label: "NGO Field Confirmation", 
        status: ['verified', 'rejected'].includes(status) ? "done" :
                ['booked', 'ngo_assigned', 'under_review', 'more_evidence'].includes(status) ? "pending" : "upcoming"
      },
      { 
        label: "Credits Issued", 
        status: status === 'verified' ? "done" : "upcoming"
      },
    ];
  };

  const pipelineSteps = latestListing 
    ? getPipelineSteps(latestListing.status)
    : [
        { label: "Project Registered", status: "upcoming" },
        { label: "AI Satellite Check", status: "upcoming" },
        { label: "NGO Field Confirmation", status: "upcoming" },
        { label: "Credits Issued", status: "upcoming" },
      ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'listed': return 'Available for Booking';
      case 'booked': return 'Booked by Buyer';
      case 'ngo_assigned': return 'NGO Assigned';
      case 'under_review': return 'Under NGO Review';
      case 'verified': return 'Verified & Credits Issued';
      case 'rejected': return 'Verification Rejected';
      case 'more_evidence': return 'Needs More Evidence';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grower Dashboard</h1>
        <p className="text-sm text-gray-500">Your carbon restoration overview</p>
      </div>

      {/* Top Row */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Box */}
        <motion.div variants={item} className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-5 h-5 text-emerald-200" />
            <span className="text-sm font-medium text-emerald-100">Total Earned (Cash)</span>
          </div>
          <div className="text-4xl font-bold mb-2">₹{(user?.fiat_balance || 0).toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-emerald-200">
            <TrendingUp className="w-4 h-4" />
            UPI or Bank Transfer payout settings active
          </div>
        </motion.div>

        {/* Carbon Passport Card */}
        <motion.div variants={item} className="lg:col-span-2 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm holographic">
          {latestListing ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{latestListing.title}</h3>
                    <p className="text-xs text-gray-400">Ecosystem Restoration project</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
                  latestListing.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  latestListing.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  <Clock className="w-3 h-3" />
                  {getStatusLabel(latestListing.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Passport ID</p>
                  <p className="text-sm font-bold text-emerald-600 font-mono">
                    CR-{new Date(latestListing.created_at).getFullYear()}-{latestListing.id.substring(0, 6).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {latestListing.district}, {latestListing.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Area / Carbon</p>
                  <p className="text-sm font-medium text-gray-900">
                    {latestListing.area_hectares} ha • {latestListing.estimated_carbon_tons || 0} tCO₂
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Trees Planted</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <TreePine className="w-3 h-3 text-emerald-600" />
                    {latestListing.trees_planted || 'N/A'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center h-full">
              <Leaf className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-600">No projects registered yet</p>
              <p className="text-xs text-gray-400 mt-1">Register a land listing in the Listings section to get started.</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Verification Pipeline */}
      {latestListing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Verification Pipeline: {latestListing.title}</h3>
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200" />
            <div className="absolute top-5 left-8 h-0.5 bg-emerald-500 transition-all duration-500" style={{ 
              width: latestListing.status === 'verified' ? "95%" : 
                     latestListing.status === 'report_submitted' ? "70%" :
                     ['booked', 'ngo_assigned', 'under_review', 'more_evidence'].includes(latestListing.status) ? "45%" : "20%" 
            }} />

            {pipelineSteps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center z-10" style={{ width: "25%" }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step.status === "done" ? "bg-emerald-500 text-white" :
                  step.status === "pending" ? "bg-amber-100 text-amber-600 border-2 border-amber-300" :
                  "bg-gray-100 text-gray-400 border-2 border-gray-200"
                }`}>
                  {step.status === "done" ? <CheckCircle2 className="w-5 h-5" /> :
                   step.status === "pending" ? <Clock className="w-5 h-5 animate-pulse" /> :
                   <span className="text-sm font-bold">{i + 1}</span>}
                </div>
                <span className={`text-xs font-medium ${
                  step.status === "done" ? "text-emerald-700" :
                  step.status === "pending" ? "text-amber-700" : "text-gray-400"
                }`}>{step.label}</span>
                {step.status === "done" && <span className="text-[10px] text-emerald-500">✓ Complete</span>}
                {step.status === "pending" && <span className="text-[10px] text-amber-500">In Progress</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/grower/upload"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <UploadCloud className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Upload New Evidence</h4>
            <p className="text-sm text-gray-500">Add geo-tagged photos, drone footage, or field surveys</p>
          </div>
        </Link>
        <Link href="/grower/listings"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
            <Plus className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Register New Project</h4>
            <p className="text-sm text-gray-500">Submit a new restoration project for AI verification</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
