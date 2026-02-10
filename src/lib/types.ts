export type RiskLevel = "low" | "medium" | "high";

export type PegCurrency = "USD" | "EUR" | "CHF" | "GBP" | "CAD" | "JPY";

export interface RiskFactor {
  score: number;
  maxScore: number;
  explanation: string;
}

export interface RiskBreakdown {
  tvl: RiskFactor;
  utilization: RiskFactor;
  protocolAge: RiskFactor;
  audit: RiskFactor;
  apyLevel: RiskFactor;
  ilRisk: RiskFactor;
}

export interface YieldOpportunity {
  id: string;
  protocol: string;
  protocolSlug: string;
  pool: string;
  symbol: string;
  token: string;
  pegCurrency: PegCurrency;
  apy: number;
  apyBase: number;
  apyReward: number;
  apyMean30d: number | null;
  apyBase7d: number | null;
  tvl: number;
  riskLevel: RiskLevel;
  riskScore: number;
  riskBreakdown: RiskBreakdown | null;
  utilizationRate: number | null;
  chain: string;
  poolMeta: string | null;
  exposure: string;
  ilRisk: string;
  stablecoin: boolean;
  updatedAt: string;
  mu: number | null;
  sigma: number | null;
  il7d: number | null;
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;
  underlyingTokens: string[] | null;
  protocolCategory: string;
  protocolAudited: boolean;
  protocolAgeMonths: number;
  protocolUrl: string;
}

export interface BorrowRate {
  id: string;
  protocol: string;
  protocolSlug: string;
  pool: string;
  symbol: string;
  collateralToken: string;
  borrowToken: string;
  borrowApy: number;
  supplyApy: number;
  tvl: number;
  ltv: number | null;
  utilizationRate: number | null;
  riskLevel: RiskLevel;
  riskScore: number;
  chain: string;
  updatedAt: string;
}

export interface RiskAlert {
  id: string;
  type: "high_utilization" | "tvl_drop" | "rate_spike" | "high_apy" | "low_tvl";
  severity: RiskLevel;
  protocol: string;
  pool: string;
  symbol: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
}

export interface DashboardStats {
  bestYield: YieldOpportunity | null;
  averageApy: number;
  totalTvl: number;
  protocolCount: number;
  alertCount: number;
  poolCount: number;
}

export interface DefiLlamaPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
  pool: string;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  poolMeta: string | null;
  mu: number | null;
  sigma: number | null;
  count: number | null;
  outlier: boolean;
  underlyingTokens: string[] | null;
  il7d: number | null;
  apyBase7d: number | null;
  apyMean30d: number | null;
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;
  apyBaseInception: number | null;
}

export interface ProtocolInfo {
  name: string;
  slug: string;
  url: string;
  category: string;
  audited: boolean;
  ageMonths: number;
}

export const PROTOCOLS: Record<string, ProtocolInfo> = {
  "kamino-lend": {
    name: "Kamino",
    slug: "kamino-lend",
    url: "https://app.kamino.finance",
    category: "Lending",
    audited: true,
    ageMonths: 18,
  },
  "marginfi": {
    name: "Marginfi",
    slug: "marginfi",
    url: "https://app.marginfi.com",
    category: "Lending",
    audited: true,
    ageMonths: 24,
  },
  "save": {
    name: "Save (Solend)",
    slug: "save",
    url: "https://save.finance",
    category: "Lending",
    audited: true,
    ageMonths: 36,
  },
  "solend": {
    name: "Save (Solend)",
    slug: "solend",
    url: "https://save.finance",
    category: "Lending",
    audited: true,
    ageMonths: 36,
  },
  "drift-protocol": {
    name: "Drift",
    slug: "drift-protocol",
    url: "https://app.drift.trade",
    category: "Perps/Lending",
    audited: true,
    ageMonths: 30,
  },
  "meteora": {
    name: "Meteora",
    slug: "meteora",
    url: "https://app.meteora.ag",
    category: "DEX/LP",
    audited: true,
    ageMonths: 20,
  },
  "raydium-amm": {
    name: "Raydium",
    slug: "raydium-amm",
    url: "https://raydium.io",
    category: "DEX/LP",
    audited: true,
    ageMonths: 36,
  },
  "raydium": {
    name: "Raydium",
    slug: "raydium",
    url: "https://raydium.io",
    category: "DEX/LP",
    audited: true,
    ageMonths: 36,
  },
  "raydium-clmm": {
    name: "Raydium CLMM",
    slug: "raydium-clmm",
    url: "https://raydium.io",
    category: "DEX/LP",
    audited: true,
    ageMonths: 20,
  },
  "jupiter": {
    name: "Jupiter",
    slug: "jupiter",
    url: "https://jup.ag",
    category: "DEX",
    audited: true,
    ageMonths: 24,
  },
  "ondo-yield-assets": {
    name: "Ondo Finance",
    slug: "ondo-yield-assets",
    url: "https://ondo.finance",
    category: "RWA",
    audited: true,
    ageMonths: 18,
  },
  "lulo": {
    name: "Lulo (Flexlend)",
    slug: "lulo",
    url: "https://flexlend.fi",
    category: "Yield Aggregator",
    audited: true,
    ageMonths: 12,
  },
  "loopscale": {
    name: "Loopscale",
    slug: "loopscale",
    url: "https://loopscale.com",
    category: "Lending",
    audited: true,
    ageMonths: 10,
  },
  "francium": {
    name: "Francium",
    slug: "francium",
    url: "https://francium.io",
    category: "Lending",
    audited: true,
    ageMonths: 24,
  },
  "orca-dex": {
    name: "Orca DEX",
    slug: "orca-dex",
    url: "https://orca.so",
    category: "DEX/LP",
    audited: true,
    ageMonths: 36,
  },
  "kamino-liquidity": {
    name: "Kamino Liquidity",
    slug: "kamino-liquidity",
    url: "https://app.kamino.finance",
    category: "DEX/LP",
    audited: true,
    ageMonths: 18,
  },
  "allbridge-classic": {
    name: "Allbridge",
    slug: "allbridge-classic",
    url: "https://allbridge.io",
    category: "Bridge",
    audited: true,
    ageMonths: 24,
  },
  "wasabi": {
    name: "Wasabi",
    slug: "wasabi",
    url: "https://wasabi.xyz",
    category: "Lending",
    audited: false,
    ageMonths: 6,
  },
};

export const STABLECOIN_SYMBOLS = [
  // USD-pegged
  "USDC", "USDT", "PYUSD", "USDS", "USDe", "USDY", "DAI",
  // EUR-pegged
  "EURC", "VEUR",
  // CHF-pegged
  "VCHF",
  // GBP-pegged
  "TGBP",
  // CAD-pegged
  "QCAD",
  // JPY-pegged
  "GYEN",
];

export const PEG_CURRENCY_MAP: Record<string, PegCurrency> = {
  USDC: "USD", USDT: "USD", PYUSD: "USD", USDS: "USD", USDe: "USD", USDY: "USD", DAI: "USD",
  EURC: "EUR", VEUR: "EUR",
  VCHF: "CHF",
  TGBP: "GBP",
  QCAD: "CAD",
  GYEN: "JPY",
};

// ── Wallet Watcher types ──

export interface WalletPosition {
  mint: string;
  symbol: string;
  balance: number;
  usdValue: number;
  pegCurrency: PegCurrency;
  account: string;
}

export interface WalletYieldMatch {
  position: WalletPosition;
  bestPool: YieldOpportunity | null;
  topPools: YieldOpportunity[];
  potentialAnnualYield: number;
}

export interface WalletAnalysis {
  address: string;
  solBalance: number;
  positions: WalletPosition[];
  totalUsdValue: number;
  yieldMatches: WalletYieldMatch[];
  avgRiskScore: number;
  timestamp: string;
}

// ── Portfolio Tracker types ──

export interface PortfolioPosition {
  id: string;
  protocol: string;
  protocolSlug: string;
  token: string;
  amount: number;
  poolId?: string;
  addedAt: string;
}

export interface PortfolioPositionDetail {
  position: PortfolioPosition;
  currentApy: number | null;
  annualYield: number;
  riskLevel: RiskLevel | null;
  betterPool: YieldOpportunity | null;
  betterPoolGain: number;
}

export interface PortfolioSummary {
  positions: PortfolioPosition[];
  totalValue: number;
  weightedAvgApy: number;
  totalAnnualYield: number;
  positionDetails: PortfolioPositionDetail[];
}

export const TARGET_PROTOCOLS = [
  "kamino-lend",
  "marginfi",
  "save",
  "solend",
  "drift-protocol",
  "meteora",
  "raydium-amm",
  "raydium",
  "raydium-clmm",
  "lulo",
  "ondo-yield-assets",
  "jupiter",
];

// ── Depeg Monitor types ──

export interface StablecoinPegData {
  symbol: string;
  name: string;
  pegType: string;
  pegMechanism: string;
  price: number;
  pegValue: number;
  deviation: number;
  deviationPct: number;
  circulating: number;
  solanaCirculating: number;
  supplyChange24h: number;
  supplyChange7d: number;
  supplyChange30d: number;
  stabilityScore: number;
  stabilityLevel: "excellent" | "good" | "fair" | "poor";
  riskFactors: string[];
}

// ── Market Overview types ──

export interface ProtocolSummary {
  name: string;
  slug: string;
  tvl: number;
  category: string;
  change1d: number;
  change7d: number;
  logo: string;
}

export interface TvlDataPoint {
  date: string;
  tvl: number;
}

export interface CategoryBreakdown {
  category: string;
  tvl: number;
  count: number;
}

export interface SolanaMarketData {
  totalTvl: number;
  tvlChange1d: number;
  tvlChange7d: number;
  topProtocols: ProtocolSummary[];
  tvlHistory: TvlDataPoint[];
  categoryBreakdown: CategoryBreakdown[];
}
