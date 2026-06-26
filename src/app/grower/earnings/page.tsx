"use client";

import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Clock, ArrowDownToLine, CheckCircle2 } from "lucide-react";

export default function GrowerEarningsPage() {
  const { user, reloadBalance } = useAuth();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [payoutMethod, setPayoutMethod] = useState("upi");
  const [upiId, setUpiId] = useState("rajesh@upi");
  const [bankLast4, setBankLast4] = useState("8842");
  
  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPayouts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: pError } = await supabase
        .from("payouts")
        .select(`
          *,
          land_listings:project_id (title)
        `)
        .eq("grower_id", user.id)
        .order("created_at", { ascending: false });

      if (pError) throw pError;
      setPayouts(data || []);
    } catch (err) {
      console.error("Failed to load payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    reloadBalance();
    fetchPayouts();
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    
    if (amt > (user.fiat_balance || 0)) {
      setError("Insufficient balance.");
      return;
    }

    setWithdrawing(true);
    setError("");
    setMessage("");

    try {
      // Find latest listing to link to payout if possible
      const { data: listings } = await supabase
        .from("land_listings")
        .select("id")
        .eq("grower_id", user.id)
        .limit(1);

      const latestProjectId = listings && listings.length > 0 ? listings[0].id : null;

      // Call database function (RPC)
      const { error: rpcError } = await supabase.rpc("request_grower_payout", {
        p_grower_id: user.id,
        p_project_id: latestProjectId,
        p_amount: amt,
        p_method: payoutMethod,
        p_upi_id: payoutMethod === "upi" ? upiId : null,
        p_bank_account_last4: payoutMethod === "bank" ? bankLast4 : null
      });

      if (rpcError) throw rpcError;

      setMessage("Withdrawal request submitted successfully!");
      setWithdrawAmount("");
      
      // Reload balance and payout history
      await reloadBalance();
      await fetchPayouts();
    } catch (err: any) {
      console.error("Payout request failed:", err);
      setError(err.message || "Failed to submit withdrawal request.");
    } finally {
      setWithdrawing(false);
    }
  };

  const totalWithdrawn = payouts
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  const pendingPayout = payouts
    .filter((p) => ["pending", "processing"].includes(p.status))
    .reduce((s, p) => s + p.amount, 0);

  const totalEarned = (user?.fiat_balance || 0) + totalWithdrawn;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-500">Your carbon credit earnings and payout history</p>
      </div>

      {/* Summary Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={item} className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-emerald-200" />
            <span className="text-sm font-medium text-emerald-100">Total Earned (All-time)</span>
          </div>
          <div className="text-3xl font-bold">₹{totalEarned.toLocaleString()}</div>
          <div className="text-xs text-emerald-100/80 mt-1">
            Available: ₹{(user?.fiat_balance || 0).toLocaleString()}
          </div>
        </motion.div>

        <motion.div variants={item} className="p-5 rounded-2xl bg-white border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-500">Pending Payouts</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{pendingPayout.toLocaleString()}</div>
          <p className="text-xs text-gray-400 mt-1">Processing in 3-5 days</p>
        </motion.div>

        <motion.div variants={item} className="p-5 rounded-2xl bg-white border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownToLine className="w-5 h-5 text-sky-500" />
            <span className="text-sm font-medium text-gray-500">Withdrawn</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{totalWithdrawn.toLocaleString()}</div>
          <p className="text-xs text-gray-400 mt-1">Transferred to bank/UPI</p>
        </motion.div>
      </motion.div>

      {/* Payout Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payout Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Request Withdrawal</h3>
          
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
          {message && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">{message}</div>}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Withdraw (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input 
                  type="number" 
                  value={withdrawAmount} 
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000" 
                  min="1"
                  required
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setPayoutMethod("upi")}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${payoutMethod === "upi" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className={`text-sm font-semibold ${payoutMethod === "upi" ? "text-emerald-900" : "text-gray-700"}`}>UPI</div>
                  <div className="text-xs text-gray-500">Instant transfer</div>
                </button>
                <button type="button" onClick={() => setPayoutMethod("bank")}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${payoutMethod === "bank" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className={`text-sm font-semibold ${payoutMethod === "bank" ? "text-emerald-900" : "text-gray-700"}`}>Bank Transfer</div>
                  <div className="text-xs text-gray-500">1-3 business days</div>
                </button>
              </div>
            </div>

            {payoutMethod === "upi" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g., yourname@upi" required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account (Last 4 digits)</label>
                <input type="text" value={bankLast4} onChange={(e) => setBankLast4(e.target.value)}
                  placeholder="e.g., 8842" maxLength={4} required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            )}

            <button type="submit" disabled={withdrawing || !withdrawAmount}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {withdrawing ? "Submitting..." : "Submit Withdrawal Request"}
            </button>
          </form>
        </motion.div>

        {/* Payout Help */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-center">
          <h4 className="font-bold text-gray-900 text-sm mb-2">How do payouts work?</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Your earnings represent funded carbon credits sold to corporate buyers. Payouts are made directly via India's Green UPI and Green Banking Rails.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Requests are processed and settled within 3 business days after administrative audit checks.
          </p>
        </div>
      </div>

      {/* Payout History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout History</h3>
        {loading ? (
          <div className="py-6 text-center text-sm text-gray-500">Loading payout records...</div>
        ) : payouts.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">No payout records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="text-left py-3 pr-4">Request Date</th>
                  <th className="text-left py-3 pr-4">Link Project</th>
                  <th className="text-left py-3 pr-4">Amount</th>
                  <th className="text-left py-3 pr-4">Method</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="text-sm text-gray-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-medium text-gray-900">
                        {p.land_listings?.title || "Direct Account Balance"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-semibold text-gray-900">₹{p.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                        {p.payout_method === "upi" ? `UPI: ${p.upi_id}` : `Bank: *${p.bank_account_last4}`}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold uppercase ${
                        p.status === "paid" ? "text-emerald-600" : "text-amber-600"
                      }`}>
                        {p.status === "paid" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
