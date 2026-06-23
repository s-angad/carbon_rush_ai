"use client";

import { motion } from "framer-motion";
import {
  Map,
  Layers,
  Eye,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Activity,
  Droplets,
  TreePine,
  Fish,
  Wind,
  MapPin,
  Satellite,
  Signal,
} from "lucide-react";
import { useState } from "react";

// Project markers for India's coast
const markers = [
  { name: "Sundarbans Delta", lat: 21.95, lng: 88.90, type: "mangrove", carbon: 12450, health: 94, x: 375, y: 225 },
  { name: "Gulf of Kutch", lat: 22.95, lng: 69.67, type: "wetland", carbon: 8920, health: 87, x: 155, y: 210 },
  { name: "Pichavaram", lat: 11.43, lng: 79.78, type: "seagrass", carbon: 6340, health: 91, x: 295, y: 390 },
  { name: "Bhitarkanika", lat: 20.73, lng: 87.02, type: "mangrove", carbon: 9870, health: 89, x: 355, y: 245 },
  { name: "Coringa", lat: 16.77, lng: 82.35, type: "mangrove", carbon: 7650, health: 85, x: 325, y: 310 },
  { name: "Muthupet Lagoon", lat: 10.40, lng: 79.52, type: "wetland", carbon: 5430, health: 83, x: 290, y: 405 },
  { name: "Vembanad Lake", lat: 9.58, lng: 76.37, type: "wetland", carbon: 4890, health: 88, x: 260, y: 420 },
  { name: "Chilika Lake", lat: 19.72, lng: 85.32, type: "wetland", carbon: 15200, health: 92, x: 340, y: 260 },
  { name: "Goa Mangroves", lat: 15.40, lng: 73.88, type: "mangrove", carbon: 3420, health: 86, x: 230, y: 330 },
  { name: "Ratnagiri Coast", lat: 16.99, lng: 73.30, type: "saltmarsh", carbon: 2890, health: 81, x: 225, y: 310 },
  { name: "Mumbai Mangroves", lat: 19.08, lng: 72.88, type: "mangrove", carbon: 4560, health: 79, x: 215, y: 270 },
  { name: "Godavari Delta", lat: 16.53, lng: 82.23, type: "mangrove", carbon: 8200, health: 90, x: 320, y: 315 },
  { name: "Krishna Estuary", lat: 15.88, lng: 80.92, type: "wetland", carbon: 6100, health: 84, x: 310, y: 328 },
  { name: "Pulicat Lake", lat: 13.42, lng: 80.32, type: "wetland", carbon: 4200, health: 82, x: 305, y: 365 },
  { name: "Karwar Coast", lat: 14.81, lng: 74.13, type: "coral", carbon: 2100, health: 77, x: 238, y: 345 },
  { name: "Mangalore Wetlands", lat: 12.87, lng: 74.84, type: "wetland", carbon: 3800, health: 85, x: 245, y: 375 },
  { name: "Kochi Backwaters", lat: 9.93, lng: 76.27, type: "wetland", carbon: 5600, health: 90, x: 255, y: 415 },
  { name: "Mahanadi Delta", lat: 20.32, lng: 86.77, type: "mangrove", carbon: 7400, health: 88, x: 350, y: 250 },
  { name: "Hooghly Estuary", lat: 22.00, lng: 88.10, type: "mangrove", carbon: 6800, health: 86, x: 365, y: 220 },
  { name: "Havelock Island", lat: 11.98, lng: 93.00, type: "coral", carbon: 3200, health: 93, x: 420, y: 385 },
  { name: "Diu Coast", lat: 20.71, lng: 70.99, type: "saltmarsh", carbon: 2400, health: 80, x: 170, y: 250 },
  { name: "Kavvayi Island", lat: 12.10, lng: 75.20, type: "mangrove", carbon: 1800, health: 84, x: 248, y: 385 },
  { name: "Puducherry Coast", lat: 11.94, lng: 79.81, type: "seagrass", carbon: 2600, health: 82, x: 296, y: 388 },
  { name: "Mandovi River", lat: 15.50, lng: 73.83, type: "mangrove", carbon: 1950, health: 87, x: 228, y: 325 },
  { name: "Tapi Estuary", lat: 21.17, lng: 72.83, type: "wetland", carbon: 3100, health: 78, x: 210, y: 237 },
];

const typeColors: Record<string, { bg: string; text: string; glow: string }> = {
  mangrove: { bg: "bg-emerald-500", text: "text-emerald-400", glow: "rgba(16,185,129,0.6)" },
  wetland: { bg: "bg-sky-500", text: "text-sky-400", glow: "rgba(14,165,233,0.6)" },
  seagrass: { bg: "bg-teal-500", text: "text-teal-400", glow: "rgba(20,184,166,0.6)" },
  coral: { bg: "bg-pink-500", text: "text-pink-400", glow: "rgba(236,72,153,0.6)" },
  saltmarsh: { bg: "bg-lime-500", text: "text-lime-400", glow: "rgba(132,204,22,0.6)" },
};

const layers = [
  { name: "Mangrove Zones", color: "#10B981", enabled: true },
  { name: "Wetlands", color: "#0EA5E9", enabled: true },
  { name: "Seagrass Beds", color: "#14B8A6", enabled: true },
  { name: "Carbon Density", color: "#84CC16", enabled: false },
  { name: "Satellite Overlay", color: "#F59E0B", enabled: false },
];

const sidebarProjects = markers.slice(0, 12);

export default function MapsPage() {
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [year, setYear] = useState(2025);
  const [layerStates, setLayerStates] = useState(layers.map(l => l.enabled));

  const toggleLayer = (i: number) => {
    const next = [...layerStates];
    next[i] = !next[i];
    setLayerStates(next);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
          <Map className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Maps & Monitoring</h1>
          <p className="text-sm text-gray-400">Real-time blue carbon ecosystem monitoring across India</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 relative rounded-2xl bg-[#0a1628] border border-white/[0.06] overflow-hidden"
          style={{ minHeight: 560 }}
        >
          {/* Stats Overlay - Top Left */}
          <div className="absolute top-4 left-4 z-20 space-y-2">
            {[
              { icon: Map, label: "Area Monitored", value: "125,000 ha" },
              { icon: Signal, label: "Active Sensors", value: "1,247" },
              { icon: Satellite, label: "Satellite Passes", value: "12 today" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0F172A]/80 backdrop-blur-sm border border-white/[0.06]"
              >
                <s.icon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-gray-400">{s.label}:</span>
                <span className="text-xs text-white font-medium">{s.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Layer Controls - Top Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute top-4 right-4 z-20 p-3 rounded-xl bg-[#0F172A]/80 backdrop-blur-sm border border-white/[0.06]"
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Layers</span>
            </div>
            <div className="space-y-1.5">
              {layers.map((layer, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={layerStates[i]}
                    onChange={() => toggleLayer(i)}
                    className="sr-only"
                  />
                  <div className={`w-3.5 h-3.5 rounded border transition-all ${layerStates[i] ? "border-transparent" : "border-gray-600"}`}
                    style={{ background: layerStates[i] ? layer.color : "transparent" }}
                  >
                    {layerStates[i] && <svg viewBox="0 0 14 14" className="w-full h-full"><path d="M3 7l3 3 5-5" fill="none" stroke="white" strokeWidth="2" /></svg>}
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{layer.name}</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Map Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(16,185,129,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.02) 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }} />

          {/* India Outline */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 550" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="coastGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                <stop offset="100%" stopColor="rgba(14,165,233,0.3)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            
            {/* Simplified India coast path */}
            <path
              d="M200,55 L220,45 L250,35 L280,40 L310,50 L330,60 L360,75 L375,90 L385,105 L390,125 L388,145 L382,165 L378,185 L375,205 L370,220 L365,235 L372,255 L378,275 L380,295 L375,315 L368,335 L358,355 L345,375 L330,395 L315,415 L300,435 L285,455 L270,475 L260,495 L255,510 L250,520 L245,510 L240,495 L230,475 L215,455 L200,435 L185,415 L170,395 L158,375 L148,355 L140,335 L135,315 L133,295 L135,275 L130,255 L128,235 L125,220 L128,205 L132,185 L138,165 L145,145 L152,125 L160,105 L170,90 L182,75 L192,65 Z"
              fill="rgba(16,185,129,0.03)"
              stroke="url(#coastGrad)"
              strokeWidth="1.5"
            />

            {/* Connection lines between nearby projects */}
            {markers.slice(0, 10).map((m, i) => {
              const next = markers[(i + 1) % 10];
              return (
                <line
                  key={`conn-${i}`}
                  x1={m.x} y1={m.y} x2={next.x} y2={next.y}
                  stroke="rgba(16,185,129,0.08)"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Project Markers */}
            {markers.map((marker, i) => {
              const tc = typeColors[marker.type];
              const isHovered = hoveredMarker === i;
              const isSelected = selectedMarker === i;
              return (
                <g key={i}>
                  {/* Pulse ring */}
                  <circle cx={marker.x} cy={marker.y} r={isHovered || isSelected ? 14 : 8} fill="none" stroke={tc.glow} strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" values={isHovered ? "14;20;14" : "8;12;8"} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Main dot */}
                  <circle
                    cx={marker.x} cy={marker.y} r={isHovered || isSelected ? 5 : 3.5}
                    fill={tc.glow.replace("0.6", "1")} filter="url(#glow)"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredMarker(i)}
                    onMouseLeave={() => setHoveredMarker(null)}
                    onClick={() => setSelectedMarker(i === selectedMarker ? null : i)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredMarker !== null && (
            <div
              className="absolute z-30 p-3 rounded-xl bg-[#1E293B]/90 backdrop-blur-sm border border-white/10 shadow-xl pointer-events-none"
              style={{
                left: markers[hoveredMarker].x + 15,
                top: markers[hoveredMarker].y - 20,
                transform: "translateY(-50%)",
              }}
            >
              <p className="text-sm text-white font-semibold">{markers[hoveredMarker].name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColors[markers[hoveredMarker].type].text} bg-white/5`}>
                  {markers[hoveredMarker].type}
                </span>
                <span className="text-xs text-gray-400">{markers[hoveredMarker].carbon.toLocaleString()} tCO₂</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">Health: {markers[hoveredMarker].health}%</div>
            </div>
          )}

          {/* Health Score - Bottom Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-4 left-4 z-20 p-4 rounded-xl bg-[#0F172A]/80 backdrop-blur-sm border border-white/[0.06] w-56"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white font-semibold">Env. Health Score</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-14 h-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={150.8} strokeDashoffset={150.8 * (1 - 0.874)} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">87.4</span>
              </div>
              <div className="text-xs text-emerald-400 font-medium">Good<br /><span className="text-gray-500">+2.1 vs last month</span></div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Water Quality", value: 85, icon: Droplets, color: "#0EA5E9" },
                { label: "Vegetation", value: 92, icon: TreePine, color: "#10B981" },
                { label: "Biodiversity", value: 78, icon: Fish, color: "#14B8A6" },
                { label: "Carbon Density", value: 91, icon: Wind, color: "#84CC16" },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <m.icon className="w-3 h-3 text-gray-500" />
                  <span className="text-[10px] text-gray-400 w-16">{m.label}</span>
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
                  </div>
                  <span className="text-[10px] text-white font-medium w-7 text-right">{m.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Timeline - Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0F172A]/80 backdrop-blur-sm border border-white/[0.06]"
          >
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors">
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setYear(Math.max(2020, year - 1))} className="text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex gap-1.5">
              {[2020, 2021, 2022, 2023, 2024, 2025].map(y => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${year === y ? "bg-emerald-500 text-white" : "text-gray-500 hover:text-white"}`}
                >
                  {y}
                </button>
              ))}
            </div>
            <button onClick={() => setYear(Math.min(2025, year + 1))} className="text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </motion.div>

        {/* Project Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-[#1E293B]/50 backdrop-blur-xl border border-white/[0.06]"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Projects</h3>
            <span className="ml-auto text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{markers.length}</span>
          </div>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {sidebarProjects.map((m, i) => {
              const tc = typeColors[m.type];
              const isActive = selectedMarker === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.03 }}
                  onClick={() => setSelectedMarker(isActive ? null : i)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isActive ? "bg-emerald-500/10 border-emerald-500/20 border" : "bg-[#0F172A]/40 border border-transparent hover:border-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${tc.bg}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{m.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium ${tc.text}`}>{m.type}</span>
                        <span className="text-[10px] text-gray-500">{m.carbon.toLocaleString()} tCO₂</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${m.health}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400">{m.health}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
