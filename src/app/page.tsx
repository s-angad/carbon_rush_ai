"use client";

import { motion, useInView } from "framer-motion";
import {
  Leaf,
  Shield,
  Globe,
  Zap,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Lock,
  Layers,
  Play,
  ChevronRight,
  ExternalLink,
  Globe as GlobeIcon2,
  Link as LinkIcon,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

// ===== Animated Counter Component =====
function AnimatedCounter({ end, duration = 2, prefix = "", suffix = "" }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ===== Particle Effect =====
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1 + "px",
            height: Math.random() * 4 + 1 + "px",
            background: i % 2 === 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(14, 165, 233, 0.4)",
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            animation: `particle-float ${8 + Math.random() * 12}s linear infinite`,
            animationDelay: `-${Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// ===== Globe Component =====
function AnimatedGlobe() {
  return (
    <div className="relative w-[340px] h-[340px] md:w-[440px] md:h-[440px]">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)" }} />
      <div className="absolute inset-4 rounded-full animate-spin-slow opacity-30" style={{ border: "1px dashed rgba(16, 185, 129, 0.3)" }} />
      <div className="absolute inset-10 rounded-full animate-spin-slow opacity-20" style={{ border: "1px dashed rgba(14, 165, 233, 0.3)", animationDirection: "reverse", animationDuration: "30s" }} />
      
      {/* Main globe */}
      <div className="absolute inset-12 rounded-full" style={{
        background: "radial-gradient(circle at 35% 35%, rgba(16, 185, 129, 0.15), rgba(14, 165, 233, 0.08) 50%, rgba(15, 23, 42, 0.95))",
        boxShadow: "inset -15px -15px 50px rgba(0,0,0,0.5), inset 8px 8px 30px rgba(16,185,129,0.08), 0 0 60px rgba(16,185,129,0.12), 0 0 120px rgba(14,165,233,0.06)",
      }}>
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full animate-spin-slow" style={{ animationDuration: "40s" }} viewBox="0 0 200 200">
          <ellipse cx="100" cy="100" rx="90" ry="90" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="70" ry="90" fill="none" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="45" ry="90" fill="none" stroke="rgba(16,185,129,0.06)" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="20" ry="90" fill="none" stroke="rgba(16,185,129,0.05)" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="90" ry="20" fill="none" stroke="rgba(14,165,233,0.06)" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="90" ry="45" fill="none" stroke="rgba(14,165,233,0.06)" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="90" ry="70" fill="none" stroke="rgba(14,165,233,0.06)" strokeWidth="0.5" />
        </svg>
        
        {/* Glowing dots representing projects */}
        {[
          { top: "30%", left: "55%", delay: "0s" },
          { top: "45%", left: "60%", delay: "1s" },
          { top: "55%", left: "58%", delay: "2s" },
          { top: "40%", left: "50%", delay: "0.5s" },
          { top: "50%", left: "65%", delay: "1.5s" },
          { top: "35%", left: "45%", delay: "3s" },
          { top: "60%", left: "55%", delay: "2.5s" },
          { top: "42%", left: "62%", delay: "0.8s" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-pulse-glow"
            style={{
              top: pos.top,
              left: pos.left,
              background: i % 2 === 0 ? "#10B981" : "#0EA5E9",
              boxShadow: `0 0 10px ${i % 2 === 0 ? "rgba(16,185,129,0.6)" : "rgba(14,165,233,0.6)"}`,
              animationDelay: pos.delay,
            }}
          />
        ))}
        
        {/* Highlight sheen */}
        <div className="absolute inset-0 rounded-full" style={{
          background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.06) 0%, transparent 50%)"
        }} />
      </div>
    </div>
  );
}

// ===== Feature Card =====
function FeatureCard({ icon: Icon, title, description, delay }: { icon: React.ElementType; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative p-6 rounded-2xl bg-[#1E293B]/40 backdrop-blur-xl border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/[0.03] to-sky-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-shadow">
          <Icon className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ===== How It Works Step =====
function StepCard({ number, title, description, delay }: { number: number; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex gap-5"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm">
        {number}
      </div>
      <div>
        <h4 className="text-white font-semibold mb-1">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ===== Main Landing Page =====
export default function LandingPage() {
  const features = [
    { icon: Sparkles, title: "AI-Powered Verification", description: "Autonomous satellite analysis with NDVI monitoring, biomass estimation, and 97.3% accuracy carbon quantification." },
    { icon: Shield, title: "Blockchain Transparency", description: "Every carbon credit verified on Polygon blockchain with immutable audit trails and Carbon Passport NFTs." },
    { icon: TrendingUp, title: "Carbon Marketplace", description: "Buy, sell, and retire tokenized carbon credits with real-time pricing and institutional-grade trading." },
    { icon: Users, title: "Community First", description: "Direct financial inclusion for 2,847+ coastal communities, NGOs, and MSMEs with multilingual AI copilot." },
    { icon: Lock, title: "Fraud Detection", description: "Advanced anomaly detection engine preventing duplicate claims and ensuring carbon market integrity." },
    { icon: Layers, title: "Digital Public Infrastructure", description: "Aadhaar for Carbon, UPI for Green Value — scalable architecture for national carbon markets." },
  ];

  const stats = [
    { value: 847532, label: "Tonnes CO₂ Verified", suffix: "+" },
    { value: 512, label: "Active Projects", suffix: "+" },
    { value: 2847, label: "Communities Impacted", suffix: "+" },
    { value: 18, label: "Million $ Carbon Value", prefix: "$", suffix: "M+" },
  ];

  const partners = ["IUCN", "UNDP", "World Bank", "NABARD", "ISRO", "MoEFCC", "NITI Aayog", "Verra"];

  return (
    <div className="relative min-h-screen bg-[#0F172A] overflow-hidden">
      <ParticleField />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Carbon<span className="gradient-text">Rush</span> AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a>
            <a href="#impact" className="text-gray-400 hover:text-white transition-colors text-sm">Impact</a>
            <Link href="/dashboard" className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
              Launch Dashboard
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6"
            >
              <Zap className="w-3 h-3" />
              India&apos;s Digital Public Infrastructure for Carbon
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
            >
              Building the{" "}
              <span className="gradient-text">Trust Layer</span>{" "}
              for Carbon
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed max-w-xl"
            >
              AI-powered carbon verification, blockchain-backed transparency, and tokenized carbon markets for a sustainable future.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-medium hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
              >
                Launch Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-300">
                <Play className="w-4 h-4 text-emerald-400" />
                Watch Demo
              </button>
            </motion.div>

            {/* Floating stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 flex gap-8"
            >
              {[
                { value: "97.3%", label: "AI Accuracy" },
                { value: "512+", label: "Projects" },
                { value: "$18M+", label: "Carbon Value" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <AnimatedGlobe />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-emerald-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="impact" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  <AnimatedCounter end={stat.value} prefix={stat.prefix || ""} suffix={stat.suffix || ""} />
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium mb-4">
              <Globe className="w-3 h-3" />
              Platform Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              End-to-end carbon{" "}
              <span className="gradient-text">infrastructure</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From satellite verification to tokenized trading — everything needed to build trust in carbon markets.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
                <BarChart3 className="w-3 h-3" />
                How It Works
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Four steps to{" "}
                <span className="gradient-text">verified carbon</span>
              </h2>
              <p className="text-gray-400 mb-10">
                Our autonomous pipeline transforms satellite data into verified, tradeable carbon credits.
              </p>

              <div className="space-y-8">
                <StepCard number={1} title="Satellite Capture" description="AI continuously monitors blue carbon ecosystems via satellite imagery with NDVI analysis." delay={0.1} />
                <StepCard number={2} title="AI Verification" description="Machine learning models estimate carbon sequestration with 97.3% accuracy and detect anomalies." delay={0.2} />
                <StepCard number={3} title="Blockchain Certification" description="Verified carbon data is recorded on Polygon blockchain as immutable Carbon Passport NFTs." delay={0.3} />
                <StepCard number={4} title="Market & Trade" description="Tokenized credits enter the marketplace where buyers, NGOs, and communities transact directly." delay={0.4} />
              </div>
            </motion.div>

            {/* Visual: Pipeline graphic */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative p-8 rounded-3xl bg-[#1E293B]/30 backdrop-blur-xl border border-white/[0.06]">
                {/* Simulated dashboard preview */}
                <div className="space-y-4">
                  {[
                    { label: "Carbon Sequestered", value: "847,532 tCO₂", color: "from-emerald-500 to-emerald-600", width: "92%" },
                    { label: "Credits Tokenized", value: "623,841", color: "from-sky-500 to-sky-600", width: "76%" },
                    { label: "Blockchain Verified", value: "99.8%", color: "from-teal-500 to-teal-600", width: "99%" },
                    { label: "Community Payouts", value: "₹14.2 Cr", color: "from-lime-500 to-lime-600", width: "68%" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                      className="p-4 rounded-xl bg-[#0F172A]/60 border border-white/[0.04]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">{item.label}</span>
                        <span className="text-white font-semibold text-sm">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: item.width }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 0.5 + i * 0.15 }}
                          className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Verification badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                  className="mt-6 flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-emerald-400 text-sm font-medium">All Systems Verified</div>
                    <div className="text-gray-500 text-xs">Polygon Block #48,291,034</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DPI Vision Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 md:p-16 rounded-3xl overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-[#1E293B]/50 to-sky-500/10" />
            <div className="absolute inset-0 backdrop-blur-3xl" />
            <div className="absolute inset-[1px] rounded-3xl bg-[#0F172A]/80" />

            <div className="relative text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                <span className="gradient-text">&quot;Aadhaar for Carbon.</span>
                <br />
                <span className="gradient-text">UPI for Green Value.&quot;</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
                Inspired by India&apos;s Digital Public Infrastructure revolution, CarbonRush AI creates the trust layer
                that carbon markets have been missing — enabling transparent verification, seamless value transfer,
                and direct financial inclusion for millions.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {["Identity Layer", "Verification Layer", "Settlement Layer", "Inclusion Layer"].map((layer, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium"
                  >
                    <ChevronRight className="w-3 h-3 inline mr-1 text-emerald-400" />
                    {layer}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners / Trust Bar */}
      <section className="py-16 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 text-sm mb-8 uppercase tracking-wider">Trusted by leading organizations</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {partners.map((partner, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.4 }}
                whileHover={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-lg font-semibold text-gray-400 transition-opacity cursor-default"
              >
                {partner}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to transform{" "}
              <span className="gradient-text">carbon markets?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Join the next generation of climate infrastructure. Start verifying, tokenizing, and trading carbon credits today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-medium text-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/s-angad/carbon_rush"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">CarbonRush AI</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Building India&apos;s Digital Public Infrastructure for carbon markets. Autonomous verification, tokenized trading, community inclusion.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
              <div className="space-y-2">
                {["Dashboard", "Verification", "Marketplace", "Analytics"].map(item => (
                  <Link key={item} href="/dashboard" className="block text-gray-500 hover:text-white text-sm transition-colors">{item}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Resources</h4>
              <div className="space-y-2">
                {["Documentation", "API Reference", "Carbon Standards", "Research"].map(item => (
                  <a key={item} href="#" className="block text-gray-500 hover:text-white text-sm transition-colors">{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Connect</h4>
              <div className="flex gap-3">
                {[ExternalLink, GlobeIcon2, LinkIcon, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.04] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs">© 2025 CarbonRush AI. Building trust in carbon markets.</p>
            <p className="text-gray-600 text-xs">Made with 💚 for India&apos;s Blue Carbon Future</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
