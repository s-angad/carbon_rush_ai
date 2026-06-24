"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, User, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { AuthProvider, useAuth, UserRole } from "@/lib/auth";

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          setLoading(false);
        } else {
          setSuccess("Login successful! Redirecting...");
          setTimeout(() => router.push("/dashboard"), 500);
        }
      } else {
        if (!fullName.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, fullName.trim(), role);
        if (result.error) {
          setError(result.error);
          setLoading(false);
        } else {
          setSuccess("Account created! Redirecting to dashboard...");
          setTimeout(() => router.push("/dashboard"), 500);
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={i} cx={200} cy={200} r={50 + i * 30} fill="none" stroke="white" strokeWidth="0.5" opacity={0.3} />
            ))}
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">CarbonRush AI</span>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">Building the Trust Layer for Carbon</h1>
          <p className="text-emerald-100/80 text-lg leading-relaxed">AI-powered verification, blockchain transparency, and tokenized carbon markets for India&apos;s blue carbon ecosystems.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: "Projects Verified", value: "512+" },
              { label: "Carbon Tokenized", value: "847K tCO₂" },
              { label: "Communities", value: "2,847" },
              { label: "AI Accuracy", value: "97.3%" },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-emerald-200/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-emerald-200/50 text-sm">© 2025 CarbonRush AI</div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CarbonRush AI</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-gray-500 mb-6">
            {isLogin ? "Sign in to access your dashboard" : "Join CarbonRush — choose your role below"}
          </p>

          {/* Demo credentials info */}
          {isLogin && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800 mb-2">🔑 Demo Accounts</p>
              <div className="space-y-1">
                <p className="text-xs text-emerald-700"><strong>Admin:</strong> admin@carbonrush.ai / admin123</p>
                <p className="text-xs text-emerald-700"><strong>User:</strong> user@carbonrush.ai / user123</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required={!isLogin} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "user" as const, label: "User", desc: "Browse & trade credits", icon: User },
                    { value: "admin" as const, label: "Admin", desc: "Monitor all users", icon: ShieldCheck },
                  ].map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${role === opt.value ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <opt.icon className={`w-5 h-5 mb-1 ${role === opt.value ? "text-emerald-600" : "text-gray-400"}`} />
                      <div className={`text-sm font-semibold ${role === opt.value ? "text-emerald-900" : "text-gray-700"}`}>{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{isLogin ? "Signing In..." : "Creating Account..."}</>
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"}<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
              className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
