"use client";

import { motion } from "framer-motion";
import {
  Users,
  UserCircle,
  Shield,
  Search,
  MoreHorizontal,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
  Eye,
  Ban,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

// Demo Users
const demoUsers = [
  { id: "u1", name: "Priya Sharma", email: "priya@example.com", role: "user", status: "active", projects: 12, credits: 4520, lastActive: "2 min ago", joined: "Mar 2023", avatar: "PS" },
  { id: "u2", name: "Rajesh Kumar", email: "rajesh@example.com", role: "user", status: "active", projects: 8, credits: 3200, lastActive: "15 min ago", joined: "Jun 2023", avatar: "RK" },
  { id: "u3", name: "Ananya Patel", email: "ananya@example.com", role: "admin", status: "active", projects: 24, credits: 12800, lastActive: "Just now", joined: "Jan 2023", avatar: "AP" },
  { id: "u4", name: "Vikram Singh", email: "vikram@example.com", role: "user", status: "active", projects: 6, credits: 1890, lastActive: "1 hr ago", joined: "Aug 2023", avatar: "VS" },
  { id: "u5", name: "Meera Nair", email: "meera@example.com", role: "user", status: "inactive", projects: 3, credits: 950, lastActive: "3 days ago", joined: "Oct 2023", avatar: "MN" },
  { id: "u6", name: "Arjun Reddy", email: "arjun@example.com", role: "user", status: "active", projects: 15, credits: 6700, lastActive: "30 min ago", joined: "Apr 2023", avatar: "AR" },
  { id: "u7", name: "Deepa Menon", email: "deepa@example.com", role: "user", status: "active", projects: 9, credits: 4100, lastActive: "2 hr ago", joined: "May 2023", avatar: "DM" },
  { id: "u8", name: "Suresh Babu", email: "suresh@example.com", role: "user", status: "suspended", projects: 2, credits: 320, lastActive: "1 week ago", joined: "Dec 2023", avatar: "SB" },
  { id: "u9", name: "Kavitha Rao", email: "kavitha@example.com", role: "user", status: "active", projects: 11, credits: 5200, lastActive: "45 min ago", joined: "Feb 2023", avatar: "KR" },
  { id: "u10", name: "Amit Deshmukh", email: "amit@example.com", role: "user", status: "active", projects: 7, credits: 2800, lastActive: "4 hr ago", joined: "Jul 2023", avatar: "AD" },
  { id: "u11", name: "Lakshmi Iyer", email: "lakshmi@example.com", role: "admin", status: "active", projects: 18, credits: 9500, lastActive: "10 min ago", joined: "Jan 2023", avatar: "LI" },
  { id: "u12", name: "Rahul Joshi", email: "rahul@example.com", role: "user", status: "active", projects: 5, credits: 1600, lastActive: "6 hr ago", joined: "Sep 2023", avatar: "RJ" },
];

const activityLog = [
  { user: "Priya Sharma", action: "Submitted verification for Sundarbans Project", time: "2 min ago", type: "verification" },
  { user: "Arjun Reddy", action: "Listed 500 credits on marketplace", time: "15 min ago", type: "trade" },
  { user: "Kavitha Rao", action: "Completed onboarding for new community", time: "30 min ago", type: "community" },
  { user: "Rajesh Kumar", action: "Downloaded analytics report", time: "1 hr ago", type: "report" },
  { user: "Deepa Menon", action: "Updated project boundaries on map", time: "2 hr ago", type: "project" },
  { user: "Amit Deshmukh", action: "Bought 200 credits at $24.50", time: "3 hr ago", type: "trade" },
  { user: "Vikram Singh", action: "Registered new saltmarsh project", time: "4 hr ago", type: "project" },
  { user: "Ananya Patel", action: "Approved fraud alert FRD-00005", time: "5 hr ago", type: "admin" },
];

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user, allUsers } = useAuth();

  // Merge real registered users into the table
  const realUserRows = allUsers
    .filter((u) => !demoUsers.some((d) => d.email === u.email))
    .map((u) => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      role: u.role,
      status: "active" as const,
      projects: 0,
      credits: 0,
      lastActive: "Just now",
      joined: new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      avatar: u.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    }));

  const allTableUsers = [...realUserRows, ...demoUsers];

  const filteredUsers = allTableUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  if (user?.role !== "admin") {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500">You need administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">Monitor and manage all platform users</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Download className="w-4 h-4" />
          Export Users
        </button>
      </motion.div>

      {/* KPIs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "12", change: "+3 this month", up: true, icon: Users, color: "bg-emerald-50 text-emerald-600" },
          { label: "Active Now", value: "8", change: "67% online", up: true, icon: Activity, color: "bg-sky-50 text-sky-600" },
          { label: "Total Credits", value: "53,580", change: "+12.4%", up: true, icon: TrendingUp, color: "bg-teal-50 text-teal-600" },
          { label: "Admins", value: "2", change: "2 active", up: true, icon: Shield, color: "bg-violet-50 text-violet-600" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="p-5 rounded-2xl bg-white border border-gray-200 hover:shadow-sm transition-all"
          >
            <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center mb-3`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-sm text-gray-500">{kpi.label}</div>
            <div className="flex items-center gap-1 mt-1">
              {kpi.up ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
              <span className="text-xs text-emerald-600">{kpi.change}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white border border-gray-200"
      >
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["User", "Role", "Status", "Projects", "Credits", "Last Active", "Joined", ""].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.02 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === "admin" ? "bg-violet-50 text-violet-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {u.role === "admin" && <Shield className="w-3 h-3" />}
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.status === "active" ? "bg-emerald-50 text-emerald-700" :
                      u.status === "inactive" ? "bg-gray-100 text-gray-500" :
                      "bg-red-50 text-red-600"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        u.status === "active" ? "bg-emerald-500" :
                        u.status === "inactive" ? "bg-gray-400" :
                        "bg-red-500"
                      }`} />
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">{u.projects}</td>
                  <td className="px-4 py-3.5 text-sm text-emerald-600 font-medium">{u.credits.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {u.lastActive}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {u.joined}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-400">Showing {filteredUsers.length} of {demoUsers.length} users</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === 1 ? "bg-emerald-50 text-emerald-700" : "text-gray-400 hover:bg-gray-50"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-white border border-gray-200 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {activityLog.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.03 }}
              className="flex items-start gap-3"
            >
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                  log.type === "verification" ? "bg-emerald-500" :
                  log.type === "trade" ? "bg-sky-500" :
                  log.type === "community" ? "bg-teal-500" :
                  log.type === "admin" ? "bg-violet-500" :
                  log.type === "report" ? "bg-amber-500" :
                  "bg-gray-400"
                }`} />
                {i < activityLog.length - 1 && <div className="w-px h-8 bg-gray-100 mt-1" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{log.user}</span> {log.action}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{log.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
