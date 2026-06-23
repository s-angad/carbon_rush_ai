"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  IndianRupee,
  Briefcase,
  Trophy,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Bot,
  Globe,
  FileText,
  Upload,
  Search as SearchIcon,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useState } from "react";

// Demo Data
const earningsData = [
  { month: "Jan", earnings: 420000 }, { month: "Feb", earnings: 580000 }, { month: "Mar", earnings: 710000 },
  { month: "Apr", earnings: 890000 }, { month: "May", earnings: 1120000 }, { month: "Jun", earnings: 950000 },
  { month: "Jul", earnings: 1340000 }, { month: "Aug", earnings: 1180000 }, { month: "Sep", earnings: 1560000 },
  { month: "Oct", earnings: 1420000 }, { month: "Nov", earnings: 1780000 }, { month: "Dec", earnings: 2100000 },
];

const leaderboard = [
  { rank: 1, name: "Sundarbans Fisher Collective", location: "West Bengal", projects: 34, credits: 48200, earnings: 14200000, joined: "Mar 2022" },
  { rank: 2, name: "Kutch Coastal Community", location: "Gujarat", projects: 28, credits: 41500, earnings: 12800000, joined: "Jun 2022" },
  { rank: 3, name: "Pichavaram Village Council", location: "Tamil Nadu", projects: 22, credits: 35800, earnings: 10500000, joined: "Aug 2022" },
  { rank: 4, name: "Bhitarkanika Community", location: "Odisha", projects: 19, credits: 28400, earnings: 8900000, joined: "Nov 2022" },
  { rank: 5, name: "Coringa Village Network", location: "Andhra Pradesh", projects: 16, credits: 22100, earnings: 7200000, joined: "Jan 2023" },
  { rank: 6, name: "Muthupet Fishing Alliance", location: "Tamil Nadu", projects: 14, credits: 18900, earnings: 5800000, joined: "Mar 2023" },
  { rank: 7, name: "Vembanad Lake Community", location: "Kerala", projects: 12, credits: 15600, earnings: 4600000, joined: "May 2023" },
  { rank: 8, name: "Chilika Lagoon Collective", location: "Odisha", projects: 11, credits: 13200, earnings: 3900000, joined: "Jul 2023" },
  { rank: 9, name: "Goa Mangrove Network", location: "Goa", projects: 9, credits: 10800, earnings: 3200000, joined: "Sep 2023" },
  { rank: 10, name: "Ratnagiri Coastal Group", location: "Maharashtra", projects: 8, credits: 9500, earnings: 2800000, joined: "Nov 2023" },
];

const payouts = [
  { recipient: "Sundarbans Fisher Collective", amount: 420000, date: "Jun 15, 2025", status: "completed" },
  { recipient: "Kutch Coastal Community", amount: 380000, date: "Jun 14, 2025", status: "completed" },
  { recipient: "Pichavaram Village Council", amount: 290000, date: "Jun 13, 2025", status: "completed" },
  { recipient: "Bhitarkanika Community", amount: 210000, date: "Jun 12, 2025", status: "pending" },
  { recipient: "Coringa Village Network", amount: 185000, date: "Jun 11, 2025", status: "completed" },
  { recipient: "Muthupet Fishing Alliance", amount: 165000, date: "Jun 10, 2025", status: "completed" },
];

const chatMessages = [
  { role: "bot" as const, text: "Welcome! I'm your CarbonRush AI Copilot. I can help you onboard your project, track earnings, or understand carbon credits. How can I help today?", lang: "en" },
  { role: "user" as const, text: "How do I register my mangrove restoration project?", lang: "en" },
  { role: "bot" as const, text: "Great question! To register your mangrove project, you'll need:\n\n1. Project location coordinates\n2. Area documentation (in hectares)\n3. Land ownership or community rights proof\n4. Baseline vegetation survey\n\nI can guide you through each step. Would you like to start the onboarding process now?", lang: "en" },
  { role: "user" as const, text: "Haan, shuru karo", lang: "hi" },
  { role: "bot" as const, text: "Bahut accha! 🌿 Main aapko step-by-step guide karunga.\n\nPehla step: Apne project ka location batayein — state aur nearest village ka naam.\n\n(Step 1: Please share your project location — state and nearest village name.)", lang: "hi" },
];

const onboardingSteps = [
  { step: 1, title: "Project Details", desc: "Basic information about your restoration project", active: true },
  { step: 2, title: "Area Mapping", desc: "Define project boundaries and area", active: false },
  { step: 3, title: "Documents", desc: "Upload required documentation", active: false },
  { step: 4, title: "Review", desc: "Review and submit for verification", active: false },
];

const rankColors = ["text-amber-400", "text-gray-300", "text-amber-600"];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-sm font-medium text-emerald-400">₹{(payload[0].value / 100000).toFixed(1)}L</p>
    </div>
  );
}

export default function CommunityPage() {
  const [selectedLang, setSelectedLang] = useState("English");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Community Portal</h1>
          <p className="text-sm text-gray-400">Empowering coastal communities with carbon finance</p>
        </div>
      </motion.div>

      {/* Impact Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Communities Onboarded", value: "2,847", icon: Users, color: "from-sky-500 to-sky-600" },
          { label: "Total Earnings", value: "₹14.2 Cr", icon: IndianRupee, color: "from-emerald-500 to-emerald-600" },
          { label: "Active NGO Partners", value: "48", icon: Building2, color: "from-teal-500 to-teal-600" },
          { label: "MSMEs Supported", value: "156", icon: Briefcase, color: "from-lime-500 to-lime-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="p-5 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06] card-hover"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Leaderboard + Onboarding */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Community Leaderboard</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["#", "Community", "Location", "Projects", "Credits", "Earnings"].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.03 }}
                    className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors ${i < 3 ? "bg-white/[0.01]" : ""}`}
                  >
                    <td className="py-3 px-2">
                      <span className={`text-sm font-bold ${i < 3 ? rankColors[i] : "text-gray-500"}`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-white font-medium">{entry.name}</td>
                    <td className="py-3 px-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />{entry.location}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-white">{entry.projects}</td>
                    <td className="py-3 px-2 text-sm text-emerald-400 font-medium">{entry.credits.toLocaleString()}</td>
                    <td className="py-3 px-2 text-sm text-white">₹{(entry.earnings / 100000).toFixed(1)}L</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Onboarding Wizard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Project Onboarding</h3>
          {/* Progress */}
          <div className="flex items-center gap-1 mb-6">
            {onboardingSteps.map((s, i) => (
              <div key={i} className="flex-1 flex items-center gap-1">
                <div className={`w-full h-1.5 rounded-full ${s.active ? "bg-emerald-500" : "bg-white/10"}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-4">Step 1 of 4</p>

          {/* Steps */}
          <div className="space-y-3">
            {onboardingSteps.map((s, i) => (
              <div key={i} className={`p-3 rounded-xl border transition-all ${s.active ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[#0F172A]/30 border-white/[0.04]"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.active ? "bg-emerald-500 text-white" : "bg-white/10 text-gray-500"}`}>
                    {s.step}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${s.active ? "text-white" : "text-gray-500"}`}>{s.title}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ml-auto ${s.active ? "text-emerald-400" : "text-gray-600"}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Form fields for step 1 */}
          <div className="mt-4 space-y-3">
            <input placeholder="Project Name" className="w-full px-3 py-2.5 rounded-xl bg-[#0F172A]/60 border border-white/[0.06] text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/30" />
            <select className="w-full px-3 py-2.5 rounded-xl bg-[#0F172A]/60 border border-white/[0.06] text-sm text-gray-400 outline-none">
              <option>Select Ecosystem Type</option>
              <option>Mangrove</option>
              <option>Wetland</option>
              <option>Seagrass</option>
            </select>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
              Continue →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Earnings + Payouts + Copilot */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Community Earnings</h3>
          <p className="text-sm text-gray-400 mb-4">Monthly payout distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="earnings" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payout Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Payout Tracking</h3>
          <div className="space-y-4">
            {payouts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${p.status === "completed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {i < payouts.length - 1 && <div className="w-0.5 h-8 bg-white/10" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-white font-medium">{p.recipient}</p>
                      <p className="text-xs text-gray-500">{p.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-emerald-400 font-semibold">₹{(p.amount / 1000).toFixed(0)}K</p>
                      <span className={`text-xs ${p.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                        {p.status === "completed" ? "✓ Completed" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Copilot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06] flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Copilot</h3>
                <p className="text-xs text-emerald-400">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-gray-400" />
              <select
                value={selectedLang}
                onChange={e => setSelectedLang(e.target.value)}
                className="bg-transparent text-xs text-gray-400 outline-none cursor-pointer"
              >
                {["English", "Hindi", "Tamil", "Bengali", "Malayalam", "Gujarati"].map(l => (
                  <option key={l} className="bg-[#1E293B]">{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto mb-3 pr-1">
            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-500/20 text-emerald-100 rounded-br-sm"
                    : "bg-[#0F172A]/60 text-gray-300 rounded-bl-sm border border-white/[0.04]"
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F172A]/60 border border-white/[0.06] text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/30"
            />
            <button className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
