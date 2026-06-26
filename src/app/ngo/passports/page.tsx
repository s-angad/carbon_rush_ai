"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink, Leaf, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface PassportNFT {
  id: string;
  passport_number: string;
  project_title: string;
  grower_name: string;
  carbon_tons: number;
  blockchain_tx_hash: string;
  polygon_token_id: string;
  issued_at: string;
}

export default function NgoPassportsPage() {
  const { user } = useAuth();
  const [passports, setPassports] = useState<PassportNFT[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPassports = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("carbon_passports")
        .select(`
          id,
          passport_number,
          carbon_tons,
          blockchain_tx_hash,
          polygon_token_id,
          issued_at,
          land_listings:project_id (
            title,
            profiles!grower_id (
              full_name
            )
          )
        `)
        .eq("issuer_ngo_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;

      const formatted: PassportNFT[] = (data || []).map((p: any) => ({
        id: p.id,
        passport_number: p.passport_number,
        project_title: p.land_listings?.title || "Restoration Project",
        grower_name: p.land_listings?.profiles?.full_name || "Community Grower",
        carbon_tons: p.carbon_tons || 0,
        blockchain_tx_hash: p.blockchain_tx_hash || "",
        polygon_token_id: p.polygon_token_id || "N/A",
        issued_at: new Date(p.issued_at).toLocaleDateString(),
      }));

      setPassports(formatted);
    } catch (err: any) {
      console.error("Failed to load NGO issued passports:", err?.message || err?.details || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPassports();
    }
  }, [user]);

  const totalPassports = passports.length;
  const totalTons = passports.reduce((s, p) => s + p.carbon_tons, 0);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

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
        <h1 className="text-2xl font-bold text-gray-900">Issued Carbon Passports</h1>
        <p className="text-sm text-gray-500">{totalPassports} passports issued • {totalTons.toLocaleString()} tCO₂ total certified</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-white border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Passports Certified</p>
            <p className="text-2xl font-bold text-gray-900">{totalPassports}</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-white border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Carbon Issued</p>
            <p className="text-2xl font-bold text-gray-900">{totalTons.toLocaleString()} tCO₂</p>
          </div>
        </motion.div>
      </div>

      {/* Passports List */}
      {passports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No passports issued yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Once a corporate buyer accepts a verification report you submit, a blockchain-backed carbon passport NFT is issued here.
          </p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {passports.map((passport) => (
            <motion.div key={passport.id} variants={item}
              className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-emerald-600 font-mono">{passport.passport_number}</h3>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{passport.project_title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span>Grower: {passport.grower_name}</span>
                      <span>•</span>
                      <span>{passport.carbon_tons.toLocaleString()} tCO₂</span>
                      <span>•</span>
                      <span>Token #{passport.polygon_token_id}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Issued: {passport.issued_at}</p>
                  {passport.blockchain_tx_hash && (
                    <a 
                      href={`https://polygonscan.com/tx/${passport.blockchain_tx_hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-end gap-1 text-xs text-emerald-600 hover:underline font-mono mt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Tx: {passport.blockchain_tx_hash.substring(0, 10)}...
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
