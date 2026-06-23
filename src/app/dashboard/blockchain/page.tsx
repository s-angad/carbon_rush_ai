'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Blocks,
  Copy,
  CheckCircle2,
  ExternalLink,
  Shield,
  Zap,
  Coins,
  FileCode2,
  Fingerprint,
  ArrowRightLeft,
  Flame,
  ClipboardCheck,
  Users,
  Award,
  Leaf,
  Hash,
  Clock,
  Activity,
  Link2,
  ChevronRight,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Transaction {
  hash: string
  type: 'Mint NFT' | 'Transfer Credit' | 'Retire Credit' | 'Verify Project'
  from: string
  to: string
  amount: string
  timestamp: string
  status: 'confirmed'
  gasUsed: string
}

interface NFTPassport {
  id: string
  tokenId: string
  projectName: string
  carbonVerified: string
  gradientFrom: string
  gradientTo: string
  owners: number
}

interface SmartContract {
  name: string
  address: string
  status: 'Active' | 'Paused'
  metric: string
  metricValue: string
  description: string
  icon: React.ElementType
  color: string
}

interface RetirementCert {
  id: string
  projectName: string
  creditsRetired: string
  retiredBy: string
  date: string
  certificateId: string
  registry: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const networkStats = [
  { label: 'Total Transactions', value: '45,231', icon: Activity, change: '+1,240 this week', color: 'from-emerald-500 to-emerald-600', glow: 'shadow-emerald-500/20' },
  { label: 'Carbon Passport NFTs', value: '512', icon: Fingerprint, change: '+23 minted today', color: 'from-sky-500 to-sky-600', glow: 'shadow-sky-500/20' },
  { label: 'Credits Tokenized', value: '623,841', icon: Coins, change: '≈ $18.7M value', color: 'from-violet-500 to-violet-600', glow: 'shadow-violet-500/20' },
  { label: 'Smart Contracts', value: '3', icon: FileCode2, change: 'All Active', color: 'from-amber-500 to-amber-600', glow: 'shadow-amber-500/20' },
]

const transactions: Transaction[] = [
  { hash: '0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a', type: 'Mint NFT', from: '0x1234...abcd', to: '0x5678...efgh', amount: '1 NFT', timestamp: '2 min ago', status: 'confirmed', gasUsed: '0.0042' },
  { hash: '0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c', type: 'Transfer Credit', from: '0xabcd...1234', to: '0xefgh...5678', amount: '1,500 tCO₂e', timestamp: '5 min ago', status: 'confirmed', gasUsed: '0.0031' },
  { hash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d', type: 'Retire Credit', from: '0x9876...dcba', to: '0x0000...0000', amount: '250 tCO₂e', timestamp: '12 min ago', status: 'confirmed', gasUsed: '0.0058' },
  { hash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f', type: 'Verify Project', from: '0xface...b00k', to: '0xdead...beef', amount: 'Verified', timestamp: '18 min ago', status: 'confirmed', gasUsed: '0.0073' },
  { hash: '0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b', type: 'Mint NFT', from: '0x1111...2222', to: '0x3333...4444', amount: '1 NFT', timestamp: '24 min ago', status: 'confirmed', gasUsed: '0.0039' },
  { hash: '0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d', type: 'Transfer Credit', from: '0x5555...6666', to: '0x7777...8888', amount: '3,200 tCO₂e', timestamp: '31 min ago', status: 'confirmed', gasUsed: '0.0035' },
  { hash: '0x0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f', type: 'Retire Credit', from: '0x9999...aaaa', to: '0x0000...0000', amount: '780 tCO₂e', timestamp: '45 min ago', status: 'confirmed', gasUsed: '0.0061' },
  { hash: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b', type: 'Verify Project', from: '0xbbbb...cccc', to: '0xdddd...eeee', amount: 'Verified', timestamp: '52 min ago', status: 'confirmed', gasUsed: '0.0069' },
  { hash: '0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d', type: 'Transfer Credit', from: '0xffff...0001', to: '0x0002...0003', amount: '5,100 tCO₂e', timestamp: '1 hr ago', status: 'confirmed', gasUsed: '0.0033' },
  { hash: '0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f', type: 'Mint NFT', from: '0x0004...0005', to: '0x0006...0007', amount: '1 NFT', timestamp: '1.2 hr ago', status: 'confirmed', gasUsed: '0.0044' },
  { hash: '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b', type: 'Retire Credit', from: '0x0008...0009', to: '0x0000...0000', amount: '420 tCO₂e', timestamp: '1.5 hr ago', status: 'confirmed', gasUsed: '0.0055' },
  { hash: '0x0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d', type: 'Verify Project', from: '0x000a...000b', to: '0x000c...000d', amount: 'Verified', timestamp: '2 hr ago', status: 'confirmed', gasUsed: '0.0071' },
]

const nftPassports: NFTPassport[] = [
  { id: '1', tokenId: '#0001', projectName: 'Amazon Reforestation', carbonVerified: '12,450 tCO₂e', gradientFrom: 'from-emerald-500', gradientTo: 'to-teal-600', owners: 3 },
  { id: '2', tokenId: '#0002', projectName: 'Sahara Solar Grid', carbonVerified: '8,320 tCO₂e', gradientFrom: 'from-amber-500', gradientTo: 'to-orange-600', owners: 2 },
  { id: '3', tokenId: '#0003', projectName: 'Nordic Wind Farm', carbonVerified: '15,780 tCO₂e', gradientFrom: 'from-sky-500', gradientTo: 'to-blue-600', owners: 4 },
  { id: '4', tokenId: '#0004', projectName: 'Borneo Mangroves', carbonVerified: '6,290 tCO₂e', gradientFrom: 'from-green-500', gradientTo: 'to-emerald-700', owners: 2 },
  { id: '5', tokenId: '#0005', projectName: 'Kenya Cookstoves', carbonVerified: '3,150 tCO₂e', gradientFrom: 'from-violet-500', gradientTo: 'to-purple-600', owners: 5 },
  { id: '6', tokenId: '#0006', projectName: 'Patagonia Peatlands', carbonVerified: '9,870 tCO₂e', gradientFrom: 'from-cyan-500', gradientTo: 'to-teal-700', owners: 3 },
]

const smartContracts: SmartContract[] = [
  {
    name: 'CarbonPassportNFT',
    address: '0x7a3F...8B2C',
    status: 'Active',
    metric: 'Interactions',
    metricValue: '14,892',
    description: 'ERC-721 contract for minting verifiable carbon passport NFTs with on-chain metadata.',
    icon: Fingerprint,
    color: 'emerald',
  },
  {
    name: 'CarbonCreditToken',
    address: '0x9B8c...7D6E',
    status: 'Active',
    metric: 'Total Supply',
    metricValue: '623,841 CCT',
    description: 'ERC-20 fungible token representing tokenized carbon credits on Polygon.',
    icon: Coins,
    color: 'sky',
  },
  {
    name: 'RetirementCertificate',
    address: '0x2C3d...4E5F',
    status: 'Active',
    metric: 'Certificates Issued',
    metricValue: '1,247',
    description: 'Issues immutable on-chain retirement certificates for permanently retired credits.',
    icon: Award,
    color: 'violet',
  },
]

const retirementCerts: RetirementCert[] = [
  { id: '1', projectName: 'Amazon Reforestation', creditsRetired: '2,500 tCO₂e', retiredBy: 'GreenCorp Industries', date: 'Jun 22, 2026', certificateId: 'RC-2026-00487', registry: 'Verra VCS' },
  { id: '2', projectName: 'Nordic Wind Farm', creditsRetired: '5,100 tCO₂e', retiredBy: 'EcoTech Solutions', date: 'Jun 21, 2026', certificateId: 'RC-2026-00486', registry: 'Gold Standard' },
  { id: '3', projectName: 'Kenya Cookstoves', creditsRetired: '780 tCO₂e', retiredBy: 'ClimateFirst Fund', date: 'Jun 20, 2026', certificateId: 'RC-2026-00485', registry: 'Verra VCS' },
  { id: '4', projectName: 'Sahara Solar Grid', creditsRetired: '3,200 tCO₂e', retiredBy: 'NetZero Partners', date: 'Jun 19, 2026', certificateId: 'RC-2026-00484', registry: 'Gold Standard' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeConfig: Record<Transaction['type'], { icon: React.ElementType; color: string; bg: string }> = {
  'Mint NFT': { icon: Fingerprint, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'Transfer Credit': { icon: ArrowRightLeft, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  'Retire Credit': { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'Verify Project': { icon: ClipboardCheck, color: 'text-violet-400', bg: 'bg-violet-500/10' },
}

const contractColors: Record<string, { border: string; iconBg: string; iconText: string; glow: string }> = {
  emerald: { border: 'border-emerald-500/20', iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', glow: 'shadow-emerald-500/5' },
  sky: { border: 'border-sky-500/20', iconBg: 'bg-sky-500/10', iconText: 'text-sky-400', glow: 'shadow-sky-500/5' },
  violet: { border: 'border-violet-500/20', iconBg: 'bg-violet-500/10', iconText: 'text-violet-400', glow: 'shadow-violet-500/5' },
}

function truncateHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}

// ─── Animations ───────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

// ─── Copy Button Component ───────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 p-1 rounded-md hover:bg-white/10 transition-colors duration-150 group/copy"
      title="Copy hash"
    >
      {copied ? (
        <CheckCircle2 size={13} className="text-emerald-400" />
      ) : (
        <Copy size={13} className="text-gray-500 group-hover/copy:text-gray-300 transition-colors" />
      )}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlockchainExplorerPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 shadow-lg shadow-emerald-500/20">
            <Blocks size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Blockchain Explorer
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Polygon-powered immutable carbon verification
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Polygon Mainnet</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Hash size={13} className="text-gray-400" />
            <span className="text-xs font-mono text-gray-400">Block #58,241,093</span>
          </div>
        </div>
      </motion.div>

      {/* ── Network Stats ───────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {networkStats.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="relative group rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.glow}`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <ExternalLink size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                </div>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                <p className="text-[11px] text-emerald-400/70 mt-2 font-medium">{stat.change}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ── Recent Transactions ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Activity size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
              <p className="text-[11px] text-gray-500">Last 12 on-chain transactions</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:border-white/[0.15] transition-all duration-200">
            View All <ChevronRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Tx Hash</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">From</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">To</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Time</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => {
                const config = typeConfig[tx.type]
                const TypeIcon = config.icon
                return (
                  <motion.tr
                    key={tx.hash}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                    className="group border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200 relative"
                  >
                    {/* Green left border */}
                    <td className="relative px-6 py-3.5">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500/40 group-hover:bg-emerald-400 transition-colors duration-200 rounded-r-full" />
                      <div className="flex items-center">
                        <span className="text-xs font-mono text-sky-400 hover:text-sky-300 cursor-pointer transition-colors">
                          {truncateHash(tx.hash)}
                        </span>
                        <CopyButton text={tx.hash} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${config.bg}`}>
                          <TypeIcon size={13} className={config.color} />
                        </div>
                        <span className="text-xs font-medium text-gray-300">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-gray-400">{tx.from}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-gray-400">{tx.to}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-white">{tx.amount}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-600" />
                        <span className="text-xs text-gray-500">{tx.timestamp}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">Confirmed</span>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── NFT Passport Gallery ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Fingerprint size={16} className="text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">NFT Passport Gallery</h2>
              <p className="text-[11px] text-gray-500">Carbon verification passports on-chain</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 font-mono">512 total minted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nftPassports.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.06 * index, duration: 0.4 }}
              className="group rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] overflow-hidden hover:border-white/[0.15] hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
            >
              {/* Gradient image placeholder */}
              <div className={`h-32 bg-gradient-to-br ${nft.gradientFrom} ${nft.gradientTo} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMEwyNSAxMEwzMCA1TDM1IDE1TDQwIDEwVjQwSDBWMTBMNSAxNUwxMCA1TDE1IDEwTDIwIDBaIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-30" />
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/30 backdrop-blur-sm text-[10px] font-mono font-bold text-white/90">
                  {nft.tokenId}
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <Shield size={14} className="text-white/80" />
                  <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Verified</span>
                </div>
              </div>

              {/* Card content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {nft.projectName}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Token ID: {nft.tokenId}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Carbon Verified</p>
                    <p className="text-sm font-bold text-emerald-400">{nft.carbonVerified}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Ownership Chain</p>
                    <div className="flex items-center justify-end gap-0.5 mt-1">
                      {Array.from({ length: nft.owners }).map((_, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-[#1E293B] flex items-center justify-center -ml-1 first:ml-0"
                        >
                          <Users size={9} className="text-gray-300" />
                        </div>
                      ))}
                      <span className="text-[10px] text-gray-500 ml-1">{nft.owners}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                  <Link2 size={12} className="text-gray-600" />
                  <span className="text-[10px] text-gray-500 font-mono">ipfs://Qm...{nft.tokenId.replace('#', '')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Smart Contracts Panel ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <FileCode2 size={16} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Smart Contracts</h2>
            <p className="text-[11px] text-gray-500">Deployed on Polygon Mainnet</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {smartContracts.map((contract, index) => {
            const colors = contractColors[contract.color]
            const Icon = contract.icon
            return (
              <motion.div
                key={contract.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                className={`rounded-2xl bg-white/[0.03] backdrop-blur-xl border ${colors.border} p-5 hover:shadow-xl ${colors.glow} transition-all duration-300 group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                    <Icon size={18} className={colors.iconText} />
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-400">{contract.status}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1 font-mono">{contract.name}</h3>
                <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">{contract.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Address</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sky-400">{contract.address}</span>
                      <CopyButton text={contract.address} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{contract.metric}</span>
                    <span className="font-semibold text-white">{contract.metricValue}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <button className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-white transition-colors duration-200">
                    <ExternalLink size={12} />
                    View on PolygonScan
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Retirement Certificates ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Award size={16} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Retirement Certificates</h2>
            <p className="text-[11px] text-gray-500">Permanently retired carbon credits on-chain</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {retirementCerts.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 * index, duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden group"
            >
              {/* Elegant border gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-transparent to-sky-500/20 p-[1px]">
                <div className="h-full w-full rounded-2xl bg-[#0F172A]" />
              </div>

              <div className="relative p-5 space-y-4">
                {/* Certificate header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 flex items-center justify-center border border-white/[0.08]">
                      <Leaf size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{cert.projectName}</h3>
                      <p className="text-[10px] text-gray-500">{cert.registry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-400">Retired</span>
                  </div>
                </div>

                {/* Certificate details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2.5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Credits Retired</p>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">{cert.creditsRetired}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2.5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Certificate ID</p>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">{cert.certificateId}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div>
                    <p className="text-[10px] text-gray-500">Retired by</p>
                    <p className="text-xs text-gray-300 font-medium">{cert.retiredBy}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">Date</p>
                    <p className="text-xs text-gray-400">{cert.date}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  )
}
