"use client";

import { motion } from "framer-motion";
import { Leaf, ExternalLink, CheckCircle2, Clock, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface PassportHolding {
  id: string; // passport id
  passport_number: string;
  carbon_tons: number;
  blockchain_tx_hash: string;
  polygon_token_id: string;
  issued_at: string;
  project_name: string;
  ecosystem_type: string;
  price_paid: number;
  status: "active" | "retired";
}

export default function BuyerPortfolioPage() {
  const { user, reloadBalance } = useAuth();
  const [holdings, setHoldings] = useState<PassportHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [retiringId, setRetiringId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPortfolio = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      // Load all purchases where credits were bought
      const { data, error: dbError } = await supabase
        .from("carbon_purchases")
        .select(`
          id,
          credits_bought,
          total_amount,
          purchased_at,
          passport_id,
          project_name,
          carbon_passports:passport_id (
            id,
            passport_number,
            carbon_tons,
            blockchain_tx_hash,
            polygon_token_id,
            issued_at,
            land_listings:project_id (
              ecosystem_type
            )
          )
        `)
        .eq("buyer_id", user.id)
        .order("purchased_at", { ascending: false });

      if (dbError) throw dbError;

      // Group by passport_id to determine current active/retired status
      // A passport is active if it was bought and is not retired (polygon_token_id !== '0x000...Burn')
      const formatted: PassportHolding[] = [];
      const processedPassports = new Set<string>();

      (data || []).forEach((item: any) => {
        if (!item.passport_id || !item.carbon_passports) return;
        
        // Skip duplicate records for the same passport (e.g. negative retirement logs)
        if (processedPassports.has(item.passport_id)) return;
        processedPassports.add(item.passport_id);

        const passport = item.carbon_passports;
        const isBurned = passport.polygon_token_id === "0x000...Burn";

        formatted.push({
          id: passport.id,
          passport_number: passport.passport_number,
          carbon_tons: passport.carbon_tons,
          blockchain_tx_hash: passport.blockchain_tx_hash,
          polygon_token_id: passport.polygon_token_id,
          issued_at: passport.issued_at,
          project_name: item.project_name,
          ecosystem_type: passport.land_listings?.ecosystem_type || "Forest",
          price_paid: item.total_amount,
          status: isBurned ? "retired" : "active",
        });
      });

      setHoldings(formatted);
    } catch (err: any) {
      console.error("Error loading buyer portfolio:", err);
      setError("Failed to load carbon credit portfolio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  const handleRetire = async (passport: PassportHolding) => {
    if (!user) return;
    const confirmMessage = `Are you sure you want to retire ${passport.carbon_tons} tCO₂ from passport ${passport.passport_number}? This action burns the token on the blockchain and cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    setRetiringId(passport.id);
    setError("");
    setMessage("");

    try {
      // Simulate burning by creating a hash
      const burnTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const { data: success, error: rpcError } = await supabase.rpc("retire_carbon_passport", {
        p_buyer_id: user.id,
        p_passport_id: passport.id,
        p_burn_tx_hash: burnTxHash
      });

      if (rpcError) throw rpcError;

      setMessage(`Credits successfully retired! Burn Tx Hash: ${burnTxHash.substring(0, 10)}...`);
      await reloadBalance();
      await fetchPortfolio();
    } catch (err: any) {
      console.error("Retirement failed:", err);
      setError(err.message || "Failed to retire carbon credits.");
    } finally {
      setRetiringId(null);
    }
  };

  const activeHoldings = holdings.filter(h => h.status === "active");
  const retiredHoldings = holdings.filter(h => h.status === "retired");

  const totalCredits = activeHoldings.reduce((s, h) => s + h.carbon_tons, 0);
  const totalValue = activeHoldings.reduce((s, h) => s + h.price_paid, 0);
  const totalRetired = retiredHoldings.reduce((s, h) => s + h.carbon_tons, 0);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
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
        <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
        <p className="text-sm text-gray-500">Your carbon credit holdings and retirement history</p>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
      {message && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">{message}</div>}

      {/* Summary Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={item} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Credits</p>
              <p className="text-2xl font-bold text-gray-900">{totalCredits.toLocaleString()} tCO₂</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={item} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={item} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Retired Credits</p>
              <p className="text-2xl font-bold text-gray-900">{totalRetired.toLocaleString()} tCO₂</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Credits Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-emerald-500" /> Holdings & Certificates
        </h3>
        
        {holdings.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            You do not own any carbon credits yet. Explore the Marketplace or NGO verifications queue to acquire listings.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 pr-4">Passport Number</th>
                  <th className="py-3 pr-4">Project</th>
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Credits</th>
                  <th className="py-3 pr-4">Funding Value</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((credit) => (
                  <tr key={credit.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="text-sm font-mono font-semibold text-emerald-600">{credit.passport_number}</span>
                    </td>
                    <td className="py-3 pr-4"><span className="text-sm font-medium text-gray-900">{credit.project_name}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{credit.ecosystem_type}</span></td>
                    <td className="py-3 pr-4"><span className="text-sm font-semibold text-gray-900">{credit.carbon_tons} tCO₂</span></td>
                    <td className="py-3 pr-4"><span className="text-sm text-gray-700">₹{credit.price_paid.toLocaleString()}</span></td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${credit.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {credit.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {credit.status === "active" ? (
                        <button
                          onClick={() => handleRetire(credit)}
                          disabled={retiringId === credit.id}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {retiringId === credit.id ? "Burning..." : "Retire Credits"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono">Burned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Retirement History Log */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-1.5">
          <Clock className="w-5 h-5 text-gray-500" /> Retirement Burn Receipts
        </h3>
        
        {retiredHoldings.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">No retired credits in this account.</div>
        ) : (
          <div className="space-y-3">
            {retiredHoldings.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">RETIRED: {r.project_name}</p>
                  <p className="text-xs text-gray-500">
                    {r.passport_number} • {r.carbon_tons} tCO₂ burned on {new Date(r.issued_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 hover:underline font-mono">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Burn Tx: {r.blockchain_tx_hash.substring(0, 14)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
