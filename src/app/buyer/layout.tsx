"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Leaf,
  ShoppingCart,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Search,
  UserCircle,
  Building2,
  FolderOpen,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useState, ReactNode, useEffect } from "react";

const navItems = [
  { href: "/buyer", label: "Overview", icon: LayoutDashboard },
  { href: "/buyer/marketplace", label: "Marketplace", icon: ShoppingCart },
  { href: "/buyer/my-projects", label: "My Projects", icon: FolderOpen },
  { href: "/buyer/portfolio", label: "My Portfolio", icon: Briefcase },
  { href: "/buyer/ngo-directory", label: "Verifiers", icon: ShieldCheck },
  { href: "/buyer/reports", label: "Reports", icon: FileText },
  { href: "/buyer/settings", label: "Settings", icon: Settings },
];

function BuyerContent({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading, dbMissing } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "buyer")) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading || !user) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-[68px]"} hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-200 flex-shrink-0`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-gray-900 text-sm">CarbonRush AI</span>}
        </div>

        {/* Role Badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Corporate Buyer</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5">
          <div className={`mb-2 ${sidebarOpen ? "px-2" : "px-0"}`}>
            {sidebarOpen && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Dashboard</p>}
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          {user && sidebarOpen && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400 truncate">Corporate Buyer</p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-full mt-2 py-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-sm">CarbonRush AI</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all ${
                      isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-400 hover:text-gray-600">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 w-72">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search marketplace, credits..."
                className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
              <Building2 className="w-3 h-3" />
              Buyer
            </span>
            <button className="relative p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {dbMissing && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">Database Schema Missing</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  The application is successfully connected to Supabase, but the database tables could not be found. Please copy the contents of <code>supabase-schema.sql</code> and execute it in the <strong>SQL Editor</strong> of your Supabase Dashboard to initialize the tables.
                </p>
              </div>
            </div>
          )}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BuyerContent>{children}</BuyerContent>
    </AuthProvider>
  );
}
