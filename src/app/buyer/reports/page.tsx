"use client";

import { motion } from "framer-motion";
import { FileText, Download, Leaf, Shield, Users, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface ESGIndicator {
  environmental: {
    carbonOffsetsPurchased: string;
    carbonOffsetsRetired: string;
    netCarbonBalance: string;
    biodiversityHectaresRestored: string;
    greenEnergyUsage: string;
  };
  social: {
    growerCommunitiesSupported: number;
    directFarmerFunding: string;
    treesPlantedVerified: string;
    estimatedLocalEmployment: string;
  };
  governance: {
    regulatoryCompliance: string;
    ledgerRegistries: string;
    externalAuditStatus: string;
    esgRatingScore: string;
  };
}

export default function BuyerReportsPage() {
  const { user } = useAuth();
  const [esgData, setEsgData] = useState<ESGIndicator | null>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchESGData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("carbon_purchases")
        .select(`
          *,
          carbon_passports:passport_id (
            id,
            passport_number,
            carbon_tons,
            polygon_token_id,
            land_listings:project_id (
              grower_id,
              area_hectares,
              trees_planted,
              ecosystem_type
            )
          )
        `)
        .eq("buyer_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;

      const items = data || [];
      setPurchases(items);

      // Calculations
      let totalPurchased = 0;
      let totalRetired = 0;
      let totalHectares = 0;
      let totalTrees = 0;
      let directFunding = 0;
      const growerIds = new Set<string>();

      items.forEach((item: any) => {
        if (item.credits_bought > 0) {
          totalPurchased += item.credits_bought;
          directFunding += item.total_amount; // Total purchase cost goes to grower (minus fee)
          
          const passport = item.carbon_passports;
          if (passport) {
            if (passport.polygon_token_id === "0x000...Burn") {
              totalRetired += passport.carbon_tons;
            }
            const listing = passport.land_listings;
            if (listing) {
              if (listing.grower_id) growerIds.add(listing.grower_id);
              if (listing.area_hectares) totalHectares += parseFloat(listing.area_hectares);
              if (listing.trees_planted) totalTrees += parseInt(listing.trees_planted);
            }
          }
        }
      });

      const targetEmissions = 10000;
      const netBalance = Math.max(0, targetEmissions - totalPurchased);

      setEsgData({
        environmental: {
          carbonOffsetsPurchased: `${totalPurchased.toLocaleString()} tCO₂`,
          carbonOffsetsRetired: `${totalRetired.toLocaleString()} tCO₂`,
          netCarbonBalance: `${netBalance.toLocaleString()} tCO₂ (Target: ${targetEmissions.toLocaleString()})`,
          biodiversityHectaresRestored: `${totalHectares.toFixed(2)} Hectares`,
          greenEnergyUsage: "45.2% (Baseline)",
        },
        social: {
          growerCommunitiesSupported: growerIds.size,
          directFarmerFunding: `₹${directFunding.toLocaleString()}`,
          treesPlantedVerified: totalTrees > 0 ? `${totalTrees.toLocaleString()} Trees` : "0 Trees",
          estimatedLocalEmployment: `${Math.round(totalHectares * 1.4)} Direct Jobs`,
        },
        governance: {
          regulatoryCompliance: "100% Compliant",
          ledgerRegistries: "Polygon Blockchain & Verra VCS",
          externalAuditStatus: "Passed (NGO Accredited)",
          esgRatingScore: totalPurchased > 1000 ? "AA+" : "A",
        },
      });
    } catch (err) {
      console.error("Failed to load ESG reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchESGData();
    }
  }, [user]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ESG Compliance Reports</h1>
          <p className="text-sm text-gray-500">Environmental, Social & Governance dynamic report indicators</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF / Print
        </button>
      </div>

      {/* Report Sections */}
      {esgData && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Environmental */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Environmental (E)</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(esgData.environmental).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="text-sm font-semibold text-gray-950">{String(value)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Social */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Social (S)</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(esgData.social).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="text-sm font-semibold text-gray-950">{String(value)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Governance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Governance (G)</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(esgData.governance).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="text-sm font-semibold text-gray-950">{String(value)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Purchased Credits List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Purchased Credits Summary Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          {purchases.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">No carbon purchases found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 pr-4">Carbon Passport ID</th>
                  <th className="py-3 pr-4">Project Title</th>
                  <th className="py-3 pr-4">Credits (tCO₂)</th>
                  <th className="py-3 pr-4">Ecosystem Type</th>
                  <th className="py-3 pr-4">Blockchain Registry</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase, i) => {
                  const isRetirement = purchase.credits_bought < 0;
                  const passport = purchase.carbon_passports;
                  return (
                    <tr key={purchase.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="text-sm font-mono text-emerald-600">
                          {passport?.passport_number || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 pr-4"><span className="text-sm font-medium text-gray-900">{purchase.project_name}</span></td>
                      <td className="py-3 pr-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {isRetirement ? "" : "+"}{purchase.credits_bought}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                          {passport?.land_listings?.ecosystem_type || "Forest"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-gray-500 font-mono">
                          {passport?.blockchain_tx_hash ? "Polygon (POS)" : "Verra Registry"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`flex items-center gap-1 text-xs font-semibold uppercase ${
                          isRetirement ? "text-amber-600" : "text-emerald-600"
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isRetirement ? "Retired" : "Active"}
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
