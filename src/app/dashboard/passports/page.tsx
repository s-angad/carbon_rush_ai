'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Leaf,
  ShieldCheck,
  Hash,
  CalendarDays,
  User,
  Coins,
  CheckCircle2,
  Clock,
  Zap,
  Fingerprint,
  Globe,
} from 'lucide-react';

/* ─────────────────────────  TYPES  ───────────────────────── */

type PassportStatus = 'verified' | 'active' | 'pending';
type ProjectType = 'Mangrove' | 'Wetland' | 'Seagrass' | 'Coral' | 'Saltmarsh';

interface CarbonPassport {
  id: string;
  carbonId: string;
  projectName: string;
  projectType: ProjectType;
  location: string;
  carbonVerified: number;   // tCO₂e
  creditsIssued: number;
  verificationScore: number; // 0-100
  blockchainHash: string;
  status: PassportStatus;
  owner: string;
  issueDate: string;
}

/* ─────────────────────────  DATA  ────────────────────────── */

const passports: CarbonPassport[] = [
  {
    id: '1',
    carbonId: 'CRP-00142',
    projectName: 'Sundarbans Mangrove Shield',
    projectType: 'Mangrove',
    location: 'Sundarbans, West Bengal',
    carbonVerified: 24_850,
    creditsIssued: 22_365,
    verificationScore: 97,
    blockchainHash: '0x8a3f…d42e1b',
    status: 'verified',
    owner: 'BlueTide Conservation Ltd.',
    issueDate: '2025-11-12',
  },
  {
    id: '2',
    carbonId: 'CRP-00178',
    projectName: 'Pichavaram Delta Corridor',
    projectType: 'Mangrove',
    location: 'Pichavaram, Tamil Nadu',
    carbonVerified: 18_400,
    creditsIssued: 16_560,
    verificationScore: 94,
    blockchainHash: '0x1b7e…f93a04',
    status: 'verified',
    owner: 'ClimaRoots India Pvt.',
    issueDate: '2025-09-28',
  },
  {
    id: '3',
    carbonId: 'CRP-00215',
    projectName: 'Chilika Seagrass Preserve',
    projectType: 'Seagrass',
    location: 'Chilika Lake, Odisha',
    carbonVerified: 12_100,
    creditsIssued: 10_890,
    verificationScore: 91,
    blockchainHash: '0x4d2c…71eb9f',
    status: 'active',
    owner: 'Oceanic Carbon Trust',
    issueDate: '2025-12-05',
  },
  {
    id: '4',
    carbonId: 'CRP-00263',
    projectName: 'Gulf of Kutch Coral Bank',
    projectType: 'Coral',
    location: 'Gulf of Kutch, Gujarat',
    carbonVerified: 9_750,
    creditsIssued: 8_775,
    verificationScore: 88,
    blockchainHash: '0xf0a8…5ce3d7',
    status: 'active',
    owner: 'Reef Genesis Foundation',
    issueDate: '2026-01-17',
  },
  {
    id: '5',
    carbonId: 'CRP-00301',
    projectName: 'Vembanad Wetland Nexus',
    projectType: 'Wetland',
    location: 'Vembanad, Kerala',
    carbonVerified: 15_300,
    creditsIssued: 13_770,
    verificationScore: 93,
    blockchainHash: '0x7e91…a2d0c4',
    status: 'verified',
    owner: 'GreenDelta Eco Ventures',
    issueDate: '2025-08-03',
  },
  {
    id: '6',
    carbonId: 'CRP-00329',
    projectName: 'Bhitarkanika Saltmarsh Ring',
    projectType: 'Saltmarsh',
    location: 'Bhitarkanika, Odisha',
    carbonVerified: 7_200,
    creditsIssued: 6_480,
    verificationScore: 85,
    blockchainHash: '0xc3f4…9b01ea',
    status: 'pending',
    owner: 'TerraBlue Holdings',
    issueDate: '2026-03-22',
  },
  {
    id: '7',
    carbonId: 'CRP-00347',
    projectName: 'Lakshadweep Coral Sanctuary',
    projectType: 'Coral',
    location: 'Lakshadweep Islands',
    carbonVerified: 11_600,
    creditsIssued: 10_440,
    verificationScore: 90,
    blockchainHash: '0x2a6d…e8f753',
    status: 'active',
    owner: 'IslandCarbon Collective',
    issueDate: '2026-02-10',
  },
  {
    id: '8',
    carbonId: 'CRP-00384',
    projectName: 'Pulicat Seagrass Meadow',
    projectType: 'Seagrass',
    location: 'Pulicat, Andhra Pradesh',
    carbonVerified: 8_950,
    creditsIssued: 5_370,
    verificationScore: 72,
    blockchainHash: '0x59b1…3ca7d0',
    status: 'pending',
    owner: 'Coastal Carbon Co-op',
    issueDate: '2026-04-14',
  },
  {
    id: '9',
    carbonId: 'CRP-00412',
    projectName: 'Coringa Mangrove Haven',
    projectType: 'Mangrove',
    location: 'Coringa, Andhra Pradesh',
    carbonVerified: 20_100,
    creditsIssued: 18_090,
    verificationScore: 96,
    blockchainHash: '0xe7f2…41bc86',
    status: 'verified',
    owner: 'EcoShore India Ltd.',
    issueDate: '2025-10-30',
  },
];

/* ─────────────────────  HELPERS  ──────────────────────────── */

const filterTabs = ['All', 'Active', 'Verified', 'Pending'] as const;
type FilterTab = (typeof filterTabs)[number];

const statusConfig: Record<
  PassportStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  verified: {
    label: 'Verified',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
  },
  active: {
    label: 'Active',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15 border-sky-500/30',
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  pending: {
    label: 'Pending',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15 border-amber-500/30',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
};

const typeColors: Record<ProjectType, string> = {
  Mangrove: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Wetland: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  Seagrass: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  Coral: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
  Saltmarsh: 'bg-lime-500/15 text-lime-400 border-lime-500/25',
};

function formatNumber(n: number) {
  return n.toLocaleString('en-IN');
}

/* ──────────  Circular Progress (SVG)  ─────────────────────── */

function CircularScore({ score }: { score: number }) {
  const radius = 28;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 90
      ? '#10B981'
      : score >= 80
        ? '#0EA5E9'
        : score >= 70
          ? '#F59E0B'
          : '#EF4444';

  return (
    <div className="relative flex items-center justify-center w-[72px] h-[72px]">
      <svg
        width={72}
        height={72}
        viewBox="0 0 72 72"
        className="transform -rotate-90"
      >
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <span
        className="absolute text-sm font-bold"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

/* ──────────  QR Code Placeholder  ─────────────────────────── */

function QrGrid() {
  // Generate an 7×7 deterministic grid pattern
  const pattern = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
  ];

  return (
    <div className="grid grid-cols-7 gap-[2px] w-[52px] h-[52px]">
      {pattern.flat().map((v, i) => (
        <div
          key={i}
          className={`rounded-[1.5px] ${
            v ? 'bg-white/30' : 'bg-transparent'
          }`}
        />
      ))}
    </div>
  );
}

/* ──────────────  PASSPORT CARD  ──────────────────────────── */

function PassportCard({
  passport,
  index,
}: {
  passport: CarbonPassport;
  index: number;
}) {
  const sts = statusConfig[passport.status];
  const typeCls = typeColors[passport.projectType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{
        scale: 1.025,
        boxShadow:
          '0 0 40px rgba(16,185,129,0.12), 0 25px 50px rgba(0,0,0,0.35)',
      }}
      className="group relative rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 overflow-hidden cursor-pointer transition-colors duration-300 hover:border-emerald-500/30"
    >
      {/* ── Holographic overlay ── */}
      <div className="holographic absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* ── Shimmer line on hover ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-full top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
      </div>

      {/* ── Top strip ── */}
      <div className="relative px-5 pt-5 pb-3 flex items-start justify-between">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono text-[11px] text-emerald-400/80 tracking-wider">
              {passport.carbonId}
            </span>
          </div>
          <h3 className="text-[15px] font-semibold text-white leading-snug truncate pr-2">
            {passport.projectName}
          </h3>
        </div>

        {/* Status badge */}
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${sts.bg} ${sts.color}`}
        >
          {sts.icon}
          {sts.label}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="px-5 pb-5 space-y-4">
        {/* Type + Location */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${typeCls}`}
          >
            <Leaf className="w-3 h-3" />
            {passport.projectType}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />
            {passport.location}
          </span>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Carbon Verified
            </p>
            <p className="text-lg font-bold text-emerald-400 leading-tight">
              {formatNumber(passport.carbonVerified)}{' '}
              <span className="text-[10px] font-normal text-slate-500">
                tCO₂e
              </span>
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Credits Issued
            </p>
            <p className="text-lg font-bold text-sky-400 leading-tight">
              {formatNumber(passport.creditsIssued)}
            </p>
          </div>
        </div>

        {/* ── Verification Score + QR ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CircularScore score={passport.verificationScore} />
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Verification
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Score
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <QrGrid />
            <span className="text-[8px] text-slate-600 font-mono">
              SCAN
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ── Footer meta ── */}
        <div className="space-y-2 text-xs">
          {/* Blockchain hash */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Hash className="w-3 h-3" />
              Blockchain
            </span>
            <span className="flex items-center gap-1.5 font-mono text-slate-400">
              {passport.blockchainHash}
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          </div>

          {/* Owner */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <User className="w-3 h-3" />
              Owner
            </span>
            <span className="text-slate-400 truncate max-w-[170px]">
              {passport.owner}
            </span>
          </div>

          {/* Issue date */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <CalendarDays className="w-3 h-3" />
              Issued
            </span>
            <span className="text-slate-400">
              {new Date(passport.issueDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom accent bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 opacity-60 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

/* ═══════════════════  PAGE  ══════════════════════════════════ */

export default function CarbonPassportsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const filtered =
    activeTab === 'All'
      ? passports
      : passports.filter(
          (p) => p.status === activeTab.toLowerCase(),
        );

  /* ── Summary stats ── */
  const totalCarbon = passports.reduce((a, p) => a + p.carbonVerified, 0);
  const totalCredits = passports.reduce((a, p) => a + p.creditsIssued, 0);
  const avgScore = Math.round(
    passports.reduce((a, p) => a + p.verificationScore, 0) / passports.length,
  );

  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px] space-y-8">
        {/* ────────── Header ────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Carbon Passports
              </h1>
              <p className="text-sm text-slate-400">
                Blockchain-verified identity for every carbon project
              </p>
            </div>
          </div>
        </motion.div>

        {/* ────────── Summary strip ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            {
              label: 'Total Passports',
              value: passports.length.toString(),
              accent: 'text-white',
              icon: <Fingerprint className="w-4 h-4 text-emerald-400" />,
            },
            {
              label: 'Carbon Verified',
              value: `${formatNumber(totalCarbon)} tCO₂e`,
              accent: 'text-emerald-400',
              icon: <Leaf className="w-4 h-4 text-emerald-400" />,
            },
            {
              label: 'Credits Issued',
              value: formatNumber(totalCredits),
              accent: 'text-sky-400',
              icon: <Coins className="w-4 h-4 text-sky-400" />,
            },
            {
              label: 'Avg Verification',
              value: `${avgScore}%`,
              accent: 'text-cyan-400',
              icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <p className={`text-base font-semibold ${stat.accent}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ────────── Filter Tabs ────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center gap-2 flex-wrap"
        >
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white bg-emerald-500/15 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white bg-white/5 border border-white/5 hover:border-white/10'
                }`}
              >
                {tab}
                {tab !== 'All' && (
                  <span
                    className={`ml-1.5 text-xs ${
                      isActive ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {
                      passports.filter(
                        (p) => p.status === tab.toLowerCase(),
                      ).length
                    }
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ────────── Card Grid ────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((passport, i) => (
              <PassportCard key={passport.id} passport={passport} index={i} />
            ))}

            {filtered.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-20 text-slate-500">
                <ShieldCheck className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No passports match this filter.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
