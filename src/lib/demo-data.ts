// CarbonRush AI - Comprehensive Demo Data
// 500+ Projects, 10,000+ Credits, Multiple Organizations

// ===== Types =====
export interface Project {
  id: string;
  name: string;
  location: string;
  state: string;
  lat: number;
  lng: number;
  type: "mangrove" | "wetland" | "seagrass" | "coral" | "saltmarsh";
  status: "active" | "verified" | "pending" | "under_review";
  carbonVerified: number;
  creditsIssued: number;
  area: number; // hectares
  ngo: string;
  community: string;
  startDate: string;
  verificationScore: number;
  ndviScore: number;
  healthScore: number;
  carbonRate: number; // tonnes/hectare/year
  fraudRisk: number;
  blockchainTx: string;
}

export interface CarbonCredit {
  id: string;
  projectId: string;
  vintage: number;
  quantity: number;
  price: number;
  status: "available" | "sold" | "retired";
  buyer?: string;
  issuedAt: string;
  retiredAt?: string;
  tokenId?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: "ngo" | "msme" | "community" | "corporate" | "government";
  location: string;
  projects: number;
  creditsEarned: number;
  totalEarnings: number;
  joinedAt: string;
}

export interface Verification {
  id: string;
  projectId: string;
  projectName: string;
  type: "satellite" | "ground" | "ai" | "manual";
  status: "completed" | "in_progress" | "failed" | "pending";
  confidence: number;
  timestamp: string;
  carbonEstimate: number;
  ndviDelta: number;
  verifier: string;
}

export interface MarketOrder {
  id: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  buyer: string;
  status: "filled" | "open" | "partial";
  timestamp: string;
}

export interface FraudAlert {
  id: string;
  projectId: string;
  projectName: string;
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  description: string;
  timestamp: string;
  status: "investigating" | "resolved" | "dismissed";
}

// ===== Constants =====
const INDIAN_COASTAL_STATES = [
  "Gujarat", "Maharashtra", "Goa", "Karnataka", "Kerala",
  "Tamil Nadu", "Andhra Pradesh", "Odisha", "West Bengal",
  "Andaman & Nicobar", "Lakshadweep", "Puducherry"
];

const PROJECT_TYPES: Project["type"][] = ["mangrove", "wetland", "seagrass", "coral", "saltmarsh"];

const NGOs = [
  "Coastal Green Foundation", "Blue Carbon India Trust", "Mangrove Alliance",
  "Ocean Restoration Network", "Wetland Warriors", "SeaGreen Initiative",
  "Coral Guard Society", "Sundarbans Conservation Trust", "Kerala Marine Foundation",
  "Gujarat Coastal Trust", "Tamil Nadu Green Coast", "Odisha Blue Carbon",
  "Bay of Bengal Initiative", "Arabian Sea Guardians", "Andaman Marine Trust",
  "National Wetland Society", "Green Coast Alliance", "Marine Carbon Foundation",
  "Indian Ocean Blue Initiative", "Coastal Livelihood Trust"
];

const COMMUNITIES = [
  "Sundarbans Fisher Collective", "Kutch Coastal Community", "Pichavaram Village Council",
  "Bhitarkanika Community", "Coringa Village Network", "Muthupet Fishing Alliance",
  "Vembanad Lake Community", "Chilika Lagoon Collective", "Goa Mangrove Network",
  "Ratnagiri Coastal Group", "Pulicat Lake Community", "Kavvayi Island Council",
  "Diu Fisher Community", "Lakshadweep Marine Group", "Port Blair Coast Alliance",
  "Mahanadi Delta Collective", "Godavari Delta Network", "Krishna Estuary Group",
  "Hooghly River Community", "Tapi Estuary Collective"
];

const BUYERS = [
  "Tata Sustainability Fund", "Reliance Green Capital", "Infosys Carbon Neutral",
  "Wipro Nature Trust", "Mahindra EarthCare", "Adani Green Energy",
  "ITC Sustainability", "HCL Climate Action", "Microsoft India Green",
  "Google Climate Fund", "Amazon Climate Pledge India", "Shell India Carbon",
  "BP India Neutral", "Total Energies India", "Goldman Sachs ESG",
  "BlackRock Climate", "JPMorgan Green Fund", "World Bank Carbon Finance"
];

const LOCATIONS = [
  { name: "Sundarbans Delta", state: "West Bengal", lat: 21.9497, lng: 88.8967 },
  { name: "Gulf of Kutch", state: "Gujarat", lat: 22.9500, lng: 69.6667 },
  { name: "Pichavaram Mangroves", state: "Tamil Nadu", lat: 11.4250, lng: 79.7750 },
  { name: "Bhitarkanika", state: "Odisha", lat: 20.7333, lng: 87.0167 },
  { name: "Coringa Wildlife", state: "Andhra Pradesh", lat: 16.7667, lng: 82.3500 },
  { name: "Muthupet Lagoon", state: "Tamil Nadu", lat: 10.4000, lng: 79.5167 },
  { name: "Vembanad Lake", state: "Kerala", lat: 9.5833, lng: 76.3667 },
  { name: "Chilika Lake", state: "Odisha", lat: 19.7167, lng: 85.3167 },
  { name: "Goa Mangroves", state: "Goa", lat: 15.4000, lng: 73.8833 },
  { name: "Ratnagiri Coast", state: "Maharashtra", lat: 16.9944, lng: 73.3000 },
  { name: "Pulicat Lake", state: "Tamil Nadu", lat: 13.4167, lng: 80.3167 },
  { name: "Kavvayi Island", state: "Kerala", lat: 12.1000, lng: 75.2000 },
  { name: "Diu Coast", state: "Gujarat", lat: 20.7144, lng: 70.9875 },
  { name: "Havelock Island", state: "Andaman & Nicobar", lat: 11.9833, lng: 93.0000 },
  { name: "Mahanadi Delta", state: "Odisha", lat: 20.3167, lng: 86.7667 },
  { name: "Godavari Delta", state: "Andhra Pradesh", lat: 16.5333, lng: 82.2333 },
  { name: "Krishna Estuary", state: "Andhra Pradesh", lat: 15.8833, lng: 80.9167 },
  { name: "Mumbai Mangroves", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Kochi Backwaters", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Karwar Coast", state: "Karnataka", lat: 14.8127, lng: 74.1297 },
  { name: "Mangalore Wetlands", state: "Karnataka", lat: 12.8714, lng: 74.8431 },
  { name: "Puducherry Coast", state: "Puducherry", lat: 11.9416, lng: 79.8083 },
  { name: "Mandovi River", state: "Goa", lat: 15.5000, lng: 73.8333 },
  { name: "Hooghly Estuary", state: "West Bengal", lat: 22.0000, lng: 88.1000 },
  { name: "Tapi Estuary", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
];

// ===== Generators =====
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBlockchainTx(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
}

function generateDate(yearStart: number, yearEnd: number): string {
  const start = new Date(yearStart, 0, 1).getTime();
  const end = new Date(yearEnd, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start)).toISOString();
}

// ===== Generate Projects =====
export function generateProjects(count: number = 500): Project[] {
  const projects: Project[] = [];
  for (let i = 0; i < count; i++) {
    const loc = LOCATIONS[i % LOCATIONS.length];
    const latOffset = randomBetween(-0.5, 0.5);
    const lngOffset = randomBetween(-0.5, 0.5);
    const type = PROJECT_TYPES[i % PROJECT_TYPES.length];
    const area = randomInt(10, 2000);
    const carbonRate = type === "mangrove" ? randomBetween(8, 25) :
                       type === "wetland" ? randomBetween(5, 15) :
                       type === "seagrass" ? randomBetween(3, 12) :
                       type === "coral" ? randomBetween(2, 8) :
                       randomBetween(4, 10);
    
    const carbonVerified = Math.round(area * carbonRate * randomBetween(1, 5));
    const creditsIssued = Math.round(carbonVerified * randomBetween(0.7, 0.95));

    projects.push({
      id: `CRP-${String(i + 1).padStart(5, "0")}`,
      name: `${loc.name} ${type.charAt(0).toUpperCase() + type.slice(1)} Project ${Math.ceil((i + 1) / LOCATIONS.length)}`,
      location: loc.name,
      state: loc.state,
      lat: loc.lat + latOffset,
      lng: loc.lng + lngOffset,
      type,
      status: randomChoice(["active", "active", "verified", "verified", "verified", "pending", "under_review"]),
      carbonVerified,
      creditsIssued,
      area,
      ngo: randomChoice(NGOs),
      community: randomChoice(COMMUNITIES),
      startDate: generateDate(2020, 2024),
      verificationScore: randomBetween(82, 99),
      ndviScore: randomBetween(0.3, 0.9),
      healthScore: randomBetween(65, 98),
      carbonRate,
      fraudRisk: randomBetween(0.01, 0.15),
      blockchainTx: generateBlockchainTx(),
    });
  }
  return projects;
}

// ===== Generate Credits =====
export function generateCredits(projects: Project[], count: number = 10000): CarbonCredit[] {
  const credits: CarbonCredit[] = [];
  for (let i = 0; i < count; i++) {
    const project = randomChoice(projects);
    const status = randomChoice(["available", "available", "sold", "sold", "sold", "retired"]) as CarbonCredit["status"];
    const price = randomBetween(8, 45);
    const quantity = randomInt(10, 500);
    
    credits.push({
      id: `CRC-${String(i + 1).padStart(6, "0")}`,
      projectId: project.id,
      vintage: randomChoice([2022, 2023, 2024, 2025]),
      quantity,
      price: Math.round(price * 100) / 100,
      status,
      buyer: status === "sold" || status === "retired" ? randomChoice(BUYERS) : undefined,
      issuedAt: generateDate(2022, 2025),
      retiredAt: status === "retired" ? generateDate(2024, 2025) : undefined,
      tokenId: `${randomInt(1, 99999)}`,
    });
  }
  return credits;
}

// ===== Generate Organizations =====
export function generateOrganizations(): Organization[] {
  const orgs: Organization[] = [];
  
  NGOs.forEach((name, i) => {
    orgs.push({
      id: `ORG-${String(i + 1).padStart(4, "0")}`,
      name,
      type: "ngo",
      location: randomChoice(INDIAN_COASTAL_STATES),
      projects: randomInt(5, 40),
      creditsEarned: randomInt(1000, 50000),
      totalEarnings: randomInt(50000, 2000000),
      joinedAt: generateDate(2021, 2024),
    });
  });

  COMMUNITIES.forEach((name, i) => {
    orgs.push({
      id: `ORG-${String(i + 21).padStart(4, "0")}`,
      name,
      type: "community",
      location: randomChoice(INDIAN_COASTAL_STATES),
      projects: randomInt(2, 15),
      creditsEarned: randomInt(500, 20000),
      totalEarnings: randomInt(10000, 500000),
      joinedAt: generateDate(2022, 2025),
    });
  });

  const MSME_NAMES = [
    "GreenShell Exports", "CoastalCraft India", "SeaFresh Processing",
    "Mangrove Honey Co.", "Blue Crab Fisheries", "Eco Salt Works",
    "Tidal Farm Solutions", "Sea Bamboo Industries", "Reef Tourism Co.",
    "Coastal Solar Farms"
  ];

  MSME_NAMES.forEach((name, i) => {
    orgs.push({
      id: `ORG-${String(i + 41).padStart(4, "0")}`,
      name,
      type: "msme",
      location: randomChoice(INDIAN_COASTAL_STATES),
      projects: randomInt(1, 8),
      creditsEarned: randomInt(200, 10000),
      totalEarnings: randomInt(5000, 200000),
      joinedAt: generateDate(2023, 2025),
    });
  });

  return orgs;
}

// ===== Generate Verifications =====
export function generateVerifications(projects: Project[], count: number = 100): Verification[] {
  const verifications: Verification[] = [];
  for (let i = 0; i < count; i++) {
    const project = randomChoice(projects);
    verifications.push({
      id: `VER-${String(i + 1).padStart(5, "0")}`,
      projectId: project.id,
      projectName: project.name,
      type: randomChoice(["satellite", "satellite", "ai", "ai", "ground", "manual"]),
      status: randomChoice(["completed", "completed", "completed", "in_progress", "pending"]),
      confidence: randomBetween(85, 99.5),
      timestamp: generateDate(2024, 2025),
      carbonEstimate: randomInt(100, 10000),
      ndviDelta: randomBetween(-0.05, 0.3),
      verifier: randomChoice(["CarbonRush AI Engine", "Satellite V2.0", "Ground Team Alpha", "Partner Auditor"]),
    });
  }
  return verifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ===== Generate Market Orders =====
export function generateMarketOrders(count: number = 50): MarketOrder[] {
  const orders: MarketOrder[] = [];
  for (let i = 0; i < count; i++) {
    const quantity = randomInt(50, 5000);
    const price = randomBetween(12, 42);
    orders.push({
      id: `MKT-${String(i + 1).padStart(5, "0")}`,
      type: randomChoice(["buy", "sell"]),
      quantity,
      price: Math.round(price * 100) / 100,
      total: Math.round(quantity * price),
      buyer: randomChoice(BUYERS),
      status: randomChoice(["filled", "filled", "open", "partial"]),
      timestamp: generateDate(2024, 2025),
    });
  }
  return orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ===== Generate Fraud Alerts =====
export function generateFraudAlerts(projects: Project[], count: number = 25): FraudAlert[] {
  const FRAUD_TYPES = [
    "Duplicate area claim detected",
    "NDVI anomaly - possible deforestation",
    "Carbon estimate exceeds baseline",
    "Suspicious ownership transfer",
    "Verification data inconsistency",
    "Historical imagery mismatch",
    "Overlapping project boundaries",
    "Unverified sequestration claim",
  ];

  const alerts: FraudAlert[] = [];
  for (let i = 0; i < count; i++) {
    const project = randomChoice(projects);
    const type = randomChoice(FRAUD_TYPES);
    alerts.push({
      id: `FRD-${String(i + 1).padStart(5, "0")}`,
      projectId: project.id,
      projectName: project.name,
      severity: randomChoice(["low", "low", "medium", "medium", "high", "critical"]),
      type,
      description: `${type} for project ${project.name} in ${project.location}. Automated systems flagged this for review.`,
      timestamp: generateDate(2024, 2025),
      status: randomChoice(["investigating", "resolved", "resolved", "dismissed"]),
    });
  }
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ===== Time Series Data =====
export function generateTimeSeriesData(months: number = 24): { month: string; carbon: number; credits: number; revenue: number; projects: number }[] {
  const data = [];
  const startDate = new Date(2024, 0, 1);
  let cumulativeCarbon = 12500;
  let cumulativeCredits = 8200;
  let cumulativeRevenue = 245000;
  let cumulativeProjects = 120;

  for (let i = 0; i < months; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    cumulativeCarbon += randomInt(800, 3500);
    cumulativeCredits += randomInt(400, 2000);
    cumulativeRevenue += randomInt(20000, 150000);
    cumulativeProjects += randomInt(5, 25);

    data.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      carbon: cumulativeCarbon,
      credits: cumulativeCredits,
      revenue: cumulativeRevenue,
      projects: cumulativeProjects,
    });
  }
  return data;
}

// ===== Market Price History =====
export function generatePriceHistory(days: number = 90): { date: string; price: number; volume: number }[] {
  const data = [];
  let price = 24.5;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    price += randomBetween(-1.5, 2.0);
    price = Math.max(15, Math.min(50, price));
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Math.round(price * 100) / 100,
      volume: randomInt(5000, 50000),
    });
  }
  return data;
}

// ===== KPI Summary =====
export interface KPISummary {
  totalCarbonVerified: number;
  creditsIssued: number;
  activeProjects: number;
  carbonValueGenerated: number;
  communitiesImpacted: number;
  verificationAccuracy: number;
  totalArea: number;
  ngoPartners: number;
  countriesReached: number;
  blockchainTransactions: number;
}

export function generateKPISummary(): KPISummary {
  return {
    totalCarbonVerified: 847532,
    creditsIssued: 623841,
    activeProjects: 512,
    carbonValueGenerated: 18750000,
    communitiesImpacted: 2847,
    verificationAccuracy: 97.3,
    totalArea: 125000,
    ngoPartners: 48,
    countriesReached: 1,
    blockchainTransactions: 45231,
  };
}

// ===== NDVI Band Data =====
export function generateNDVIData(): { month: string; ndvi: number; biomass: number; health: number }[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map(month => ({
    month,
    ndvi: randomBetween(0.35, 0.85),
    biomass: randomBetween(120, 340),
    health: randomBetween(60, 95),
  }));
}

// ===== Singleton Data Store =====
let _projects: Project[] | null = null;
let _credits: CarbonCredit[] | null = null;
let _organizations: Organization[] | null = null;
let _verifications: Verification[] | null = null;
let _marketOrders: MarketOrder[] | null = null;
let _fraudAlerts: FraudAlert[] | null = null;
let _kpiSummary: KPISummary | null = null;
let _timeSeries: ReturnType<typeof generateTimeSeriesData> | null = null;
let _priceHistory: ReturnType<typeof generatePriceHistory> | null = null;

export function getProjects(): Project[] {
  if (!_projects) _projects = generateProjects(512);
  return _projects;
}

export function getCredits(): CarbonCredit[] {
  if (!_credits) _credits = generateCredits(getProjects(), 10240);
  return _credits;
}

export function getOrganizations(): Organization[] {
  if (!_organizations) _organizations = generateOrganizations();
  return _organizations;
}

export function getVerifications(): Verification[] {
  if (!_verifications) _verifications = generateVerifications(getProjects(), 120);
  return _verifications;
}

export function getMarketOrders(): MarketOrder[] {
  if (!_marketOrders) _marketOrders = generateMarketOrders(60);
  return _marketOrders;
}

export function getFraudAlerts(): FraudAlert[] {
  if (!_fraudAlerts) _fraudAlerts = generateFraudAlerts(getProjects(), 30);
  return _fraudAlerts;
}

export function getKPISummary(): KPISummary {
  if (!_kpiSummary) _kpiSummary = generateKPISummary();
  return _kpiSummary;
}

export function getTimeSeries() {
  if (!_timeSeries) _timeSeries = generateTimeSeriesData(24);
  return _timeSeries;
}

export function getPriceHistory() {
  if (!_priceHistory) _priceHistory = generatePriceHistory(90);
  return _priceHistory;
}
