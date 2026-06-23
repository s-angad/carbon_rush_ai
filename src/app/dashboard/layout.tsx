'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CreditCard,
  Brain,
  ShieldAlert,
  TrendingUp,
  Users,
  Map,
  Blocks,
  BarChart3,
  Search,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Globe,
  LogOut,
  HelpCircle,
  Command,
} from 'lucide-react'

// ─── Navigation Data ──────────────────────────────────────────────────────────
interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  badgeColor?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Carbon Passports', href: '/dashboard/passports', icon: CreditCard, badge: '12', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
  { label: 'AI Verification', href: '/dashboard/verification', icon: Brain, badge: '3', badgeColor: 'bg-sky-500/20 text-sky-400' },
  { label: 'Fraud Detection', href: '/dashboard/fraud', icon: ShieldAlert },
  { label: 'Marketplace', href: '/dashboard/marketplace', icon: TrendingUp },
  { label: 'Community', href: '/dashboard/community', icon: Users },
  { label: 'Maps & Monitoring', href: '/dashboard/maps', icon: Map },
  { label: 'Blockchain', href: '/dashboard/blockchain', icon: Blocks },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
]

const bottomNavItems: NavItem[] = [
  { label: 'Help & Support', href: '/dashboard/help', icon: HelpCircle },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

// ─── Breadcrumb Labels ────────────────────────────────────────────────────────
const segmentLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  passports: 'Carbon Passports',
  verification: 'AI Verification',
  fraud: 'Fraud Detection',
  marketplace: 'Marketplace',
  community: 'Community',
  maps: 'Maps & Monitoring',
  blockchain: 'Blockchain',
  analytics: 'Analytics',
  settings: 'Settings',
  help: 'Help & Support',
}

// ─── Sidebar Nav Link ─────────────────────────────────────────────────────────
function SidebarLink({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
}) {
  const Icon = item.icon

  return (
    <Link href={item.href} prefetch={null}>
      <motion.div
        className={`
          group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium
          transition-colors duration-200 cursor-pointer
          ${
            isActive
              ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-400'
              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
          }
        `}
        whileHover={{ x: isCollapsed ? 0 : 2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400"
            layoutId="activeIndicator"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}

        <div
          className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'text-gray-500 group-hover:text-gray-300 group-hover:bg-white/[0.04]'
          }`}
        >
          <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
        </div>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              className="flex items-center justify-between flex-1 min-w-0"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={`ml-auto flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-white/10 text-gray-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1E293B] border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl">
            {item.label}
            {item.badge && (
              <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-white/10 text-gray-400'}`}>
                {item.badge}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </Link>
  )
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Build breadcrumbs from pathname
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      label: segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + segments.slice(0, index + 1).join('/'),
      isLast: index === segments.length - 1,
    }))
  }, [pathname])

  // Get current page title for the header
  const currentPageTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F172A]">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <motion.aside
        className="relative flex flex-col h-full bg-[#0F172A] border-r border-white/[0.06] z-30"
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] flex-shrink-0">
          <div className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf size={18} className="text-white" strokeWidth={2.5} />
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 animate-pulse-glow" />
          </div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                className="flex flex-col min-w-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-sm font-bold tracking-tight text-white">
                  Carbon<span className="text-emerald-400">Rush</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                  AI Platform
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1">
          {/* Section label */}
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.p
                className="px-3 pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                Navigation
              </motion.p>
            )}
          </AnimatePresence>

          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              }
              isCollapsed={isCollapsed}
            />
          ))}
        </div>

        {/* Bottom section */}
        <div className="flex-shrink-0 border-t border-white/[0.06] px-3 py-3 space-y-1">
          {bottomNavItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={pathname.startsWith(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}

          {/* User profile */}
          <div className="mt-2 pt-3 border-t border-white/[0.06]">
            <div
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04] transition-colors duration-200 cursor-pointer group ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  AS
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0F172A]" />
              </div>

              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p className="text-[13px] font-medium text-white truncate">
                      Arjun Singh
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      arjun@carbonrush.ai
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isCollapsed && (
                <LogOut
                  size={16}
                  className="flex-shrink-0 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
              )}
            </div>
          </div>
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute -right-3 top-20 z-40 w-6 h-6 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#334155] hover:border-white/20 transition-all duration-200 shadow-lg"
        >
          {isCollapsed ? (
            <ChevronRight size={12} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={12} strokeWidth={2.5} />
          )}
        </button>
      </motion.aside>

      {/* ── Main Area ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-white/[0.06] bg-[#0F172A]/80 backdrop-blur-xl flex-shrink-0 z-20">
          {/* Left: Breadcrumb + page title */}
          <div className="flex flex-col justify-center min-w-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[11px]">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-gray-600">/</span>}
                  {crumb.isLast ? (
                    <span className="text-gray-400 font-medium">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-gray-500 hover:text-gray-300 transition-colors duration-150"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
            <h1 className="text-lg font-semibold text-white tracking-tight mt-0.5 truncate">
              {currentPageTitle}
            </h1>
          </div>

          {/* Right: Search, notifications, user */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Search bar */}
            <div className="relative group hidden md:flex">
              <div className="flex items-center gap-2 px-3 py-2 w-64 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] focus-within:border-emerald-500/30 focus-within:bg-white/[0.06] transition-all duration-200">
                <Search size={15} className="text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
                />
                <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-gray-500 font-mono flex-shrink-0">
                  <Command size={10} />K
                </kbd>
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-white/[0.08] hidden md:block" />

            {/* Notifications */}
            <button className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/[0.06] transition-colors duration-200 group">
              <Bell size={18} className="text-gray-400 group-hover:text-white transition-colors duration-200" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </span>
            </button>

            {/* Globe/Environment indicator */}
            <button className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/[0.06] transition-colors duration-200 group">
              <Globe size={18} className="text-gray-400 group-hover:text-white transition-colors duration-200" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-white/[0.08]" />

            {/* User avatar */}
            <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-white/[0.06] transition-colors duration-200 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  AS
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0F172A]" />
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-[13px] font-medium text-white leading-tight">Arjun S.</span>
                <span className="text-[10px] text-gray-500 leading-tight">Admin</span>
              </div>
            </button>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
