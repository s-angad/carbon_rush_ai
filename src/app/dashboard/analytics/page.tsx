'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  Leaf,
  Gauge,
  Users,
  DollarSign,
  Target,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Filter,
  Globe,
  ShieldCheck,
  Heart,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportTab = 'carbon' | 'esg' | 'compliance' | 'impact'

interface MonthlyData {
  month: string
  sequestered: number
  verified: number
  retired: number
}

interface ProjectTypeData {
  name: string
  value: number
  color: string
}

interface TopProject {
  name: string
  carbonVerified: number
  percentage: number
  color: string
}

interface MetricCard {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ElementType
  color: string
  sparkline: number[]
}

interface ProjectAnalytics {
  id: string
  name: string
  type: string
  location: string
  carbonVerified: number
  credits: number
  status: string
  verificationRate: number
  lastUpdated: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const reportTabs: { key: ReportTab; label: string; icon: React.ElementType }[] = [
  { key: 'carbon', label: 'Carbon Reports', icon: Leaf },
  { key: 'esg', label: 'ESG Reports', icon: Globe },
  { key: 'compliance', label: 'Compliance Reports', icon: ShieldCheck },
  { key: 'impact', label: 'Impact Reports', icon: Heart },
]

const monthlyData: MonthlyData[] = [
  { month: 'Jul \'24', sequestered: 12400, verified: 11200, retired: 3200 },
  { month: 'Aug \'24', sequestered: 14800, verified: 13100, retired: 4100 },
  { month: 'Sep \'24', sequestered: 13200, verified: 12400, retired: 3800 },
  { month: 'Oct \'24', sequestered: 16100, verified: 14900, retired: 5200 },
  { month: 'Nov \'24', sequestered: 18400, verified: 17200, retired: 6100 },
  { month: 'Dec \'24', sequestered: 15700, verified: 14100, retired: 4900 },
  { month: 'Jan \'25', sequestered: 19200, verified: 17800, retired: 6800 },
  { month: 'Feb \'25', sequestered: 21500, verified: 19600, retired: 7400 },
  { month: 'Mar \'25', sequestered: 20100, verified: 18700, retired: 7100 },
  { month: 'Apr \'25', sequestered: 23800, verified: 22100, retired: 8900 },
  { month: 'May \'25', sequestered: 25200, verified: 23400, retired: 9600 },
  { month: 'Jun \'25', sequestered: 22900, verified: 21200, retired: 8200 },
  { month: 'Jul \'25', sequestered: 27100, verified: 25300, retired: 10400 },
  { month: 'Aug \'25', sequestered: 28400, verified: 26100, retired: 11200 },
  { month: 'Sep \'25', sequestered: 26800, verified: 24900, retired: 10100 },
  { month: 'Oct \'25', sequestered: 30200, verified: 28400, retired: 12300 },
  { month: 'Nov \'25', sequestered: 32100, verified: 29800, retired: 13100 },
  { month: 'Dec \'25', sequestered: 29500, verified: 27200, retired: 11800 },
  { month: 'Jan \'26', sequestered: 33800, verified: 31400, retired: 14200 },
  { month: 'Feb \'26', sequestered: 35100, verified: 32600, retired: 15100 },
  { month: 'Mar \'26', sequestered: 34200, verified: 31800, retired: 14500 },
  { month: 'Apr \'26', sequestered: 37400, verified: 34900, retired: 16200 },
  { month: 'May \'26', sequestered: 39100, verified: 36200, retired: 17400 },
  { month: 'Jun \'26', sequestered: 41200, verified: 38400, retired: 18900 },
]

const projectTypeData: ProjectTypeData[] = [
  { name: 'Reforestation', value: 35, color: '#10B981' },
  { name: 'Renewable Energy', value: 28, color: '#0EA5E9' },
  { name: 'Blue Carbon', value: 15, color: '#6366F1' },
  { name: 'Cookstoves', value: 12, color: '#F59E0B' },
  { name: 'Direct Air Capture', value: 10, color: '#EC4899' },
]

const topProjects: TopProject[] = [
  { name: 'Nordic Wind Consortium', carbonVerified: 42800, percentage: 95, color: '#0EA5E9' },
  { name: 'Amazon Reforestation', carbonVerified: 38200, percentage: 88, color: '#10B981' },
  { name: 'Sahara Solar Grid', carbonVerified: 35100, percentage: 82, color: '#F59E0B' },
  { name: 'Borneo Mangroves', carbonVerified: 28400, percentage: 76, color: '#6366F1' },
  { name: 'Patagonia Peatlands', carbonVerified: 24700, percentage: 70, color: '#14B8A6' },
  { name: 'Kenya Cookstoves', carbonVerified: 21200, percentage: 65, color: '#F97316' },
  { name: 'Iceland Geothermal', carbonVerified: 18900, percentage: 58, color: '#8B5CF6' },
  { name: 'Bangladesh Biogas', carbonVerified: 15600, percentage: 52, color: '#EC4899' },
  { name: 'Congo Basin REDD+', carbonVerified: 13400, percentage: 46, color: '#22C55E' },
  { name: 'Chile DAC Facility', carbonVerified: 11800, percentage: 40, color: '#06B6D4' },
]

const verificationRateData = [
  { month: 'Jan', rate: 87 },
  { month: 'Feb', rate: 89 },
  { month: 'Mar', rate: 91 },
  { month: 'Apr', rate: 88 },
  { month: 'May', rate: 93 },
  { month: 'Jun', rate: 94 },
  { month: 'Jul', rate: 92 },
  { month: 'Aug', rate: 95 },
  { month: 'Sep', rate: 93 },
  { month: 'Oct', rate: 96 },
  { month: 'Nov', rate: 94 },
  { month: 'Dec', rate: 97 },
]

const metricCards: MetricCard[] = [
  { label: 'Carbon Intensity', value: '0.42 tCO₂/MWh', change: '-12.3%', trend: 'down', icon: Gauge, color: 'emerald', sparkline: [45, 42, 48, 40, 38, 35, 42] },
  { label: 'Sequestration Rate', value: '41,200 tCO₂e', change: '+18.7%', trend: 'up', icon: TrendingUp, color: 'sky', sparkline: [28, 31, 34, 33, 36, 38, 41] },
  { label: 'Credit Utilization', value: '78.4%', change: '+5.2%', trend: 'up', icon: Target, color: 'violet', sparkline: [68, 70, 72, 74, 71, 76, 78] },
  { label: 'Verification Throughput', value: '94 projects/mo', change: '+22.1%', trend: 'up', icon: Zap, color: 'amber', sparkline: [62, 68, 75, 72, 80, 88, 94] },
  { label: 'Average Project Size', value: '3,240 tCO₂e', change: '+8.4%', trend: 'up', icon: BarChart3, color: 'teal', sparkline: [2800, 2900, 3000, 3100, 3050, 3180, 3240] },
  { label: 'Community Participation', value: '12,847', change: '+31.2%', trend: 'up', icon: Users, color: 'pink', sparkline: [8200, 9100, 9800, 10400, 11200, 12100, 12847] },
  { label: 'Revenue Growth', value: '$2.4M', change: '+24.8%', trend: 'up', icon: DollarSign, color: 'green', sparkline: [1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4] },
  { label: 'Environmental Impact', value: '92.7/100', change: '+3.1%', trend: 'up', icon: Leaf, color: 'cyan', sparkline: [85, 87, 88, 89, 90, 91, 92.7] },
]

const projectAnalytics: ProjectAnalytics[] = [
  { id: '1', name: 'Nordic Wind Consortium', type: 'Renewable Energy', location: 'Norway', carbonVerified: 42800, credits: 38500, status: 'Active', verificationRate: 95, lastUpdated: 'Jun 23, 2026' },
  { id: '2', name: 'Amazon Reforestation', type: 'Reforestation', location: 'Brazil', carbonVerified: 38200, credits: 34100, status: 'Active', verificationRate: 92, lastUpdated: 'Jun 22, 2026' },
  { id: '3', name: 'Sahara Solar Grid', type: 'Renewable Energy', location: 'Morocco', carbonVerified: 35100, credits: 31200, status: 'Active', verificationRate: 89, lastUpdated: 'Jun 22, 2026' },
  { id: '4', name: 'Borneo Mangroves', type: 'Blue Carbon', location: 'Indonesia', carbonVerified: 28400, credits: 25100, status: 'Active', verificationRate: 88, lastUpdated: 'Jun 21, 2026' },
  { id: '5', name: 'Patagonia Peatlands', type: 'Blue Carbon', location: 'Argentina', carbonVerified: 24700, credits: 22300, status: 'Active', verificationRate: 91, lastUpdated: 'Jun 21, 2026' },
  { id: '6', name: 'Kenya Cookstoves', type: 'Cookstoves', location: 'Kenya', carbonVerified: 21200, credits: 18900, status: 'Pending', verificationRate: 85, lastUpdated: 'Jun 20, 2026' },
  { id: '7', name: 'Iceland Geothermal', type: 'Renewable Energy', location: 'Iceland', carbonVerified: 18900, credits: 17100, status: 'Active', verificationRate: 94, lastUpdated: 'Jun 20, 2026' },
  { id: '8', name: 'Bangladesh Biogas', type: 'Cookstoves', location: 'Bangladesh', carbonVerified: 15600, credits: 13800, status: 'Active', verificationRate: 87, lastUpdated: 'Jun 19, 2026' },
  { id: '9', name: 'Congo Basin REDD+', type: 'Reforestation', location: 'Congo', carbonVerified: 13400, credits: 11900, status: 'Under Review', verificationRate: 82, lastUpdated: 'Jun 19, 2026' },
  { id: '10', name: 'Chile DAC Facility', type: 'Direct Air Capture', location: 'Chile', carbonVerified: 11800, credits: 10400, status: 'Active', verificationRate: 96, lastUpdated: 'Jun 18, 2026' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const colorMap: Record<string, { bg: string; text: string; border: string; sparkline: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', sparkline: '#10B981' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', sparkline: '#0EA5E9' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', sparkline: '#8B5CF6' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', sparkline: '#F59E0B' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20', sparkline: '#14B8A6' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', sparkline: '#EC4899' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', sparkline: '#22C55E' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', sparkline: '#06B6D4' },
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Under Review': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

// ─── Animations ───────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const sparkData = data.map((v, i) => ({ v, i }))
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sparkData}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('carbon')
  const [sortField, setSortField] = useState<keyof ProjectAnalytics>('carbonVerified')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('All')

  const toggleSort = (field: keyof ProjectAnalytics) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const filteredProjects = useMemo(() => {
    let result = [...projectAnalytics]
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (filterType !== 'All') {
      result = result.filter((p) => p.type === filterType)
    }
    result.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
    return result
  }, [searchQuery, filterType, sortField, sortDir])

  const projectTypes = ['All', ...Array.from(new Set(projectAnalytics.map((p) => p.type)))]

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* ── Header + Export Panel ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 shadow-lg shadow-sky-500/20">
            <BarChart3 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Analytics & Reports
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Comprehensive carbon intelligence and reporting
            </p>
          </div>
        </div>

        {/* Export Panel */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Jul 2024 – Jun 2026</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:from-emerald-500/20 hover:to-emerald-500/10 transition-all duration-200">
            <Download size={14} />
            Download PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500/10 to-sky-500/5 border border-sky-500/20 text-sky-400 text-xs font-medium hover:from-sky-500/20 hover:to-sky-500/10 transition-all duration-200">
            <FileSpreadsheet size={14} />
            Download Excel
          </button>
        </div>
      </motion.div>

      {/* ── Report Tabs ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit"
      >
        {reportTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/[0.08] border border-white/[0.1] rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon size={14} />
                {tab.label}
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* ── Carbon Report Content ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'carbon' && (
          <motion.div
            key="carbon"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Total Sequestration Area Chart */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className="lg:col-span-2 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Total Sequestration Over Time</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">24-month trend in tCO₂e</p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-gray-400">Sequestered</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-sky-500" /><span className="text-gray-400">Verified</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-violet-500" /><span className="text-gray-400">Retired</span></div>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="seqGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="verGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="retGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} interval={3} />
                      <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatNumber(v)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="sequestered" name="Sequestered" stroke="#10B981" strokeWidth={2} fill="url(#seqGradient)" />
                      <Area type="monotone" dataKey="verified" name="Verified" stroke="#0EA5E9" strokeWidth={2} fill="url(#verGradient)" />
                      <Area type="monotone" dataKey="retired" name="Retired" stroke="#8B5CF6" strokeWidth={2} fill="url(#retGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Carbon by Project Type Donut */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5"
              >
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white">Carbon by Project Type</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Distribution of verified carbon</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {projectTypeData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null
                          const data = payload[0]
                          return (
                            <div className="rounded-lg bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 px-3 py-2 shadow-xl">
                              <p className="text-xs font-medium text-white">{data.name}</p>
                              <p className="text-xs text-gray-400">{data.value}%</p>
                            </div>
                          )
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {projectTypeData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-400">{item.name}</span>
                      </div>
                      <span className="font-semibold text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Bottom Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 10 Projects Horizontal Bar */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5"
              >
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-white">Top 10 Projects by Carbon Verified</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Ranked by total tCO₂e verified</p>
                </div>
                <div className="space-y-3">
                  {topProjects.map((project, index) => (
                    <div key={project.name} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-600 w-4">{String(index + 1).padStart(2, '0')}</span>
                          <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{project.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-white">{project.carbonVerified.toLocaleString()}</span>
                      </div>
                      <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden ml-6">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.05 * index, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Monthly Verification Rate */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5"
              >
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white">Monthly Verification Rate</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Percentage of submissions verified</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={verificationRateData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={[80, 100]} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null
                          return (
                            <div className="rounded-lg bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 px-3 py-2 shadow-xl">
                              <p className="text-xs font-medium text-gray-400">{label}</p>
                              <p className="text-sm font-bold text-emerald-400">{payload[0].value}%</p>
                            </div>
                          )
                        }}
                      />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {verificationRateData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.rate >= 93 ? '#10B981' : entry.rate >= 90 ? '#0EA5E9' : '#F59E0B'}
                            fillOpacity={0.7}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'esg' && (
          <motion.div
            key="esg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-12 text-center"
          >
            <Globe size={48} className="text-sky-400/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">ESG Reports</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">Environmental, Social, and Governance reports with TCFD, SASB, and GRI framework alignment. Coming in Q3 2026.</p>
          </motion.div>
        )}

        {activeTab === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-12 text-center"
          >
            <ShieldCheck size={48} className="text-violet-400/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Compliance Reports</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">Automated compliance reporting for EU ETS, CORSIA, and voluntary carbon market standards. Coming in Q3 2026.</p>
          </motion.div>
        )}

        {activeTab === 'impact' && (
          <motion.div
            key="impact"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-12 text-center"
          >
            <Heart size={48} className="text-pink-400/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Impact Reports</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">SDG-aligned impact measurement dashboards with community benefit tracking and biodiversity metrics. Coming in Q4 2026.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Key Metrics Grid ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Key Metrics</h2>
            <p className="text-[11px] text-gray-500">Platform performance indicators</p>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {metricCards.map((metric) => {
            const Icon = metric.icon
            const colors = colorMap[metric.color]
            return (
              <motion.div
                key={metric.label}
                variants={itemVariants}
                className="group rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-4 hover:border-white/[0.12] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon size={16} className={colors.text} />
                  </div>
                  <Sparkline data={metric.sparkline} color={colors.sparkline} />
                </div>
                <p className="text-lg font-bold text-white">{metric.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{metric.label}</p>
                <div className="flex items-center gap-1 mt-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp size={12} className="text-emerald-400" />
                  ) : (
                    <TrendingDown size={12} className="text-emerald-400" />
                  )}
                  <span className="text-[11px] font-medium text-emerald-400">{metric.change}</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      {/* ── Data Table ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <FileText size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Project-Level Analytics</h2>
              <p className="text-[11px] text-gray-500">Detailed project performance data</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] w-48">
              <Search size={14} className="text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none flex items-center gap-2 px-3 py-2 pr-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 cursor-pointer outline-none hover:border-white/[0.15] transition-colors"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type} className="bg-[#1E293B] text-white">
                    {type}
                  </option>
                ))}
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {[
                  { key: 'name' as const, label: 'Project Name' },
                  { key: 'type' as const, label: 'Type' },
                  { key: 'location' as const, label: 'Location' },
                  { key: 'carbonVerified' as const, label: 'Carbon Verified' },
                  { key: 'credits' as const, label: 'Credits' },
                  { key: 'verificationRate' as const, label: 'Verification %' },
                  { key: 'status' as const, label: 'Status' },
                  { key: 'lastUpdated' as const, label: 'Last Updated' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-gray-300 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.key ? (
                        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} className="opacity-30" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, index) => (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.03 * index }}
                  className="group border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-white group-hover:text-emerald-300 transition-colors">
                      {project.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{project.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{project.location}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-white">{project.carbonVerified.toLocaleString()} tCO₂e</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-300">{project.credits.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${project.verificationRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{project.verificationRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[project.status] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{project.lastUpdated}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="py-12 text-center">
            <Search size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No projects match your search criteria</p>
          </div>
        )}
      </motion.div>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  )
}
