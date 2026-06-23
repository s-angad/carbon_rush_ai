"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Leaf,
  Clock,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useState } from "react";

// Price History
const priceHistory = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (90 - i));
  const price = 22 + Math.sin(i * 0.1) * 4 + Math.random() * 3 + (i * 0.05);
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: Math.round(price * 100) / 100,
    volume: Math.floor(5000 + Math.random() * 45000),
  };
});

const currentPrice = priceHistory[priceHistory.length - 1].price;
const prevPrice = priceHistory[priceHistory.length - 2].price;
const priceChange = ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2);

// Order Book
const buyOrders = Array.from({ length: 8 }, (_, i) => ({
  price: currentPrice - (i + 1) * 0.15 - Math.random() * 0.1,
  quantity: Math.floor(500 + Math.random() * 5000),
})).map(o => ({ ...o, price: Math.round(o.price * 100) / 100, total: Math.round(o.price * o.quantity) }));

const sellOrders = Array.from({ length: 8 }, (_, i) => ({
  price: currentPrice + (i + 1) * 0.15 + Math.random() * 0.1,
  quantity: Math.floor(300 + Math.random() * 4000),
})).map(o => ({ ...o, price: Math.round(o.price * 100) / 100, total: Math.round(o.price * o.quantity) }));

const maxOrderQty = Math.max(...buyOrders.map(o => o.quantity), ...sellOrders.map(o => o.quantity));

// Recent Trades
const recentTrades = Array.from({ length: 10 }, (_, i) => ({
  time: `${Math.floor(Math.random() * 12)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")} ${Math.random() > 0.5 ? "PM" : "AM"}`,
  type: Math.random() > 0.45 ? "buy" as const : "sell" as const,
  quantity: Math.floor(50 + Math.random() * 2000),
  price: currentPrice + (Math.random() - 0.5) * 2,
  buyer: ["Tata Green Fund", "Infosys Carbon", "Reliance ESG", "Wipro Nature", "Shell India", "Google Climate", "Amazon Pledge", "Microsoft Green", "BP Neutral", "World Bank"][i],
})).map(t => ({ ...t, price: Math.round(t.price * 100) / 100, total: Math.round(t.price * t.quantity) }));

// Active Listings
const listings = [
  { id: "CRC-001241", project: "Sundarbans Mangrove", vintage: 2024, quantity: 2500, price: 28.50, verified: true, type: "Mangrove" },
  { id: "CRC-003892", project: "Chilika Lake", vintage: 2024, quantity: 1800, price: 24.75, verified: true, type: "Wetland" },
  { id: "CRC-005124", project: "Gulf of Kutch", vintage: 2023, quantity: 3200, price: 22.30, verified: true, type: "Seagrass" },
  { id: "CRC-007531", project: "Pichavaram Reserve", vintage: 2025, quantity: 950, price: 32.00, verified: true, type: "Mangrove" },
  { id: "CRC-009012", project: "Coringa Wildlife", vintage: 2024, quantity: 1400, price: 26.80, verified: true, type: "Mangrove" },
  { id: "CRC-010234", project: "Vembanad Lake", vintage: 2023, quantity: 2100, price: 21.50, verified: true, type: "Wetland" },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: e.color }}>
          {e.name}: {e.name.includes("Price") ? `$${e.value.toFixed(2)}` : e.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(100);
  const [timeRange, setTimeRange] = useState("3M");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Carbon Marketplace</h1>
          <p className="text-sm text-gray-400">Buy, sell, and retire verified carbon credits</p>
        </div>
      </motion.div>

      {/* Market Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Current Price", value: `$${currentPrice.toFixed(2)}`, change: `${Number(priceChange) >= 0 ? "+" : ""}${priceChange}%`, up: Number(priceChange) >= 0, icon: DollarSign },
          { label: "24h Volume", value: "45,231", change: "+12.4%", up: true, icon: BarChart3 },
          { label: "Market Cap", value: "$15.2M", change: "+8.7%", up: true, icon: TrendingUp },
          { label: "Total Retired", value: "124,891", change: "+3.2%", up: true, icon: Leaf },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06] card-hover">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-4 h-4 text-gray-400" />
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Chart + Trading Panel */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Price Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</span>
                <span className={`flex items-center gap-0.5 text-sm font-medium ${Number(priceChange) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {Number(priceChange) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {priceChange}%
                </span>
              </div>
              <p className="text-sm text-gray-400">Blue Carbon Credit (BCC)</p>
            </div>
            <div className="flex gap-1">
              {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === range ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500 hover:text-white"}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} interval={14} />
              <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="price" name="Price" stroke="#10B981" strokeWidth={2} fill="url(#priceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Trading Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <div className="flex gap-1 p-1 rounded-xl bg-[#0F172A]/60 mb-5">
            {(["buy", "sell"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTradeType(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tradeType === t
                  ? t === "buy" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  : "text-gray-400 hover:text-white"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Quantity (Credits)</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-[#0F172A]/60 border border-white/[0.06] text-white text-lg font-medium outline-none focus:border-emerald-500/30 transition-colors"
              />
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setQuantity(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${quantity === amt ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-400 hover:text-white"}`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Price per Credit</label>
              <div className="px-4 py-3 rounded-xl bg-[#0F172A]/60 border border-white/[0.06] text-white text-lg font-medium">
                ${currentPrice.toFixed(2)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0F172A]/40 border border-white/[0.04]">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-bold">${(quantity * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Platform fee (0.5%)</span>
                <span className="text-gray-400">${(quantity * currentPrice * 0.005).toFixed(2)}</span>
              </div>
            </div>

            <button className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
              tradeType === "buy"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25"
            }`}>
              {tradeType === "buy" ? "Buy" : "Sell"} {quantity.toLocaleString()} Credits
            </button>
          </div>
        </motion.div>
      </div>

      {/* Order Book + Recent Trades */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Book */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Order Book</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Buy Side */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
                <span>Price</span><span>Qty</span><span>Total</span>
              </div>
              {buyOrders.map((o, i) => (
                <div key={i} className="relative flex justify-between text-sm py-1.5 px-1">
                  <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 rounded-r" style={{ width: `${(o.quantity / maxOrderQty) * 100}%` }} />
                  <span className="relative text-emerald-400 font-medium">${o.price.toFixed(2)}</span>
                  <span className="relative text-gray-300">{o.quantity.toLocaleString()}</span>
                  <span className="relative text-gray-500 text-xs">${(o.total / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
            {/* Sell Side */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
                <span>Price</span><span>Qty</span><span>Total</span>
              </div>
              {sellOrders.map((o, i) => (
                <div key={i} className="relative flex justify-between text-sm py-1.5 px-1">
                  <div className="absolute right-0 top-0 bottom-0 bg-red-500/10 rounded-l" style={{ width: `${(o.quantity / maxOrderQty) * 100}%` }} />
                  <span className="relative text-red-400 font-medium">${o.price.toFixed(2)}</span>
                  <span className="relative text-gray-300">{o.quantity.toLocaleString()}</span>
                  <span className="relative text-gray-500 text-xs">${(o.total / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Trades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Time", "Type", "Qty", "Price", "Buyer"].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium pb-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((t, i) => (
                  <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 text-xs text-gray-500">{t.time}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${t.type === "buy" ? "text-emerald-400" : "text-red-400"}`}>
                        {t.type === "buy" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 text-sm text-white">{t.quantity.toLocaleString()}</td>
                    <td className="py-2.5 text-sm text-white">${t.price.toFixed(2)}</td>
                    <td className="py-2.5 text-xs text-gray-400 truncate max-w-[120px]">{t.buyer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Active Listings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 className="text-lg font-semibold text-white mb-4">Active Listings</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              className="p-5 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06] card-hover group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-mono">{l.id}</span>
                {l.verified && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <h4 className="text-white font-semibold mb-1">{l.project}</h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400">{l.type}</span>
                <span className="text-xs text-gray-500">Vintage {l.vintage}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-gray-500">Available</div>
                  <div className="text-white font-medium">{l.quantity.toLocaleString()} credits</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="text-emerald-400 font-bold text-lg">${l.price.toFixed(2)}</div>
                </div>
              </div>
              <button className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all opacity-0 group-hover:opacity-100">
                Trade Now
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
