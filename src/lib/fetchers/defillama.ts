import {
  DefiLlamaPool,
  YieldOpportunity,
  BorrowRate,
  RiskAlert,
  PROTOCOLS,
  STABLECOIN_SYMBOLS,
} from "../types";
import { scoreRisk } from "../risk-scorer";

const DEFI_LLAMA_POOLS_URL = "https://yields.llama.fi/pools";

function getProtocolName(slug: string): string {
  return (
    PROTOCOLS[slug]?.name ||
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

function isStablecoinSymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  return STABLECOIN_SYMBOLS.some((s) => upper.includes(s));
}

function extractPrimaryToken(symbol: string): string {
  const upper = symbol.toUpperCase();
  for (const s of STABLECOIN_SYMBOLS) {
    if (upper.startsWith(s)) return s;
  }
  for (const s of STABLECOIN_SYMBOLS) {
    if (upper.includes(s)) return s;
  }
  return symbol.split("-")[0] || symbol;
}

function isLendingProtocol(project: string): boolean {
  const lendingProjects = [
    "kamino-lend",
    "marginfi",
    "save",
    "solend",
    "drift-protocol",
    "lulo",
    "loopscale",
    "francium",
    "wasabi",
    "project-0",
  ];
  return lendingProjects.includes(project);
}

let cachedPools: DefiLlamaPool[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchPools(): Promise<DefiLlamaPool[]> {
  const now = Date.now();
  if (cachedPools && now - cacheTimestamp < CACHE_DURATION) {
    return cachedPools;
  }

  const res = await fetch(DEFI_LLAMA_POOLS_URL, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`DeFi Llama API error: ${res.status}`);

  const data = await res.json();
  cachedPools = data.data as DefiLlamaPool[];
  cacheTimestamp = now;
  return cachedPools;
}

export async function fetchYields(): Promise<YieldOpportunity[]> {
  const pools = await fetchPools();

  const solanaPools = pools.filter(
    (p) =>
      p.chain === "Solana" &&
      p.stablecoin === true &&
      isStablecoinSymbol(p.symbol) &&
      p.tvlUsd > 10_000 &&
      p.apy !== null &&
      p.apy !== undefined &&
      p.apy >= 0 &&
      !p.outlier
  );

  const seen = new Set<string>();
  const deduped = solanaPools.filter((p) => {
    const key = `${p.project}-${p.symbol}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped
    .map((p) => {
      const protocolInfo = PROTOCOLS[p.project];
      const risk = scoreRisk({
        tvl: p.tvlUsd,
        utilizationRate: null,
        protocolAgeMonths: protocolInfo?.ageMonths || 6,
        audited: protocolInfo?.audited ?? false,
        apy: p.apy || 0,
        ilRisk: p.ilRisk || "no",
      });

      return {
        id: p.pool,
        protocol: getProtocolName(p.project),
        protocolSlug: p.project,
        pool: p.pool,
        symbol: p.symbol,
        token: extractPrimaryToken(p.symbol),
        apy: Math.round((p.apy || 0) * 100) / 100,
        apyBase: Math.round((p.apyBase || 0) * 100) / 100,
        apyReward: Math.round((p.apyReward || 0) * 100) / 100,
        tvl: p.tvlUsd,
        riskLevel: risk.level,
        riskScore: risk.score,
        utilizationRate: null,
        chain: "Solana",
        poolMeta: p.poolMeta,
        exposure: p.exposure || "single",
        ilRisk: p.ilRisk || "no",
        stablecoin: true,
        updatedAt: new Date().toISOString(),
      };
    })
    .sort((a, b) => b.apy - a.apy);
}

export async function fetchBorrowRates(): Promise<BorrowRate[]> {
  const pools = await fetchPools();

  const lendingPools = pools.filter(
    (p) =>
      p.chain === "Solana" &&
      isStablecoinSymbol(p.symbol) &&
      p.tvlUsd > 100_000 &&
      isLendingProtocol(p.project) &&
      p.exposure === "single" &&
      !p.outlier
  );

  const seen = new Set<string>();
  const deduped = lendingPools.filter((p) => {
    const key = `${p.project}-${p.symbol}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped
    .map((p) => {
      const protocolInfo = PROTOCOLS[p.project];
      const supplyApy = p.apy || 0;
      // Estimate borrow rate from supply rate + spread
      // Typical borrow rate is 1.2-2x the supply rate for lending protocols
      const estimatedBorrowApy = Math.round(supplyApy * 1.5 * 100) / 100;

      const risk = scoreRisk({
        tvl: p.tvlUsd,
        utilizationRate: null,
        protocolAgeMonths: protocolInfo?.ageMonths || 6,
        audited: protocolInfo?.audited ?? false,
        apy: supplyApy,
        ilRisk: "no",
      });

      return {
        id: `borrow-${p.pool}`,
        protocol: getProtocolName(p.project),
        protocolSlug: p.project,
        pool: p.pool,
        symbol: p.symbol,
        collateralToken: "SOL",
        borrowToken: extractPrimaryToken(p.symbol),
        borrowApy: estimatedBorrowApy,
        supplyApy: Math.round(supplyApy * 100) / 100,
        tvl: p.tvlUsd,
        ltv: protocolInfo ? getLtv(p.project) : null,
        utilizationRate: null,
        riskLevel: risk.level,
        riskScore: risk.score,
        chain: "Solana",
        updatedAt: new Date().toISOString(),
      };
    })
    .sort((a, b) => a.borrowApy - b.borrowApy);
}

function getLtv(project: string): number | null {
  const ltvMap: Record<string, number> = {
    "kamino-lend": 0.75,
    "marginfi": 0.8,
    "save": 0.75,
    "solend": 0.75,
    "drift-protocol": 0.8,
    "lulo": 0.7,
    "loopscale": 0.65,
  };
  return ltvMap[project] || null;
}

export async function generateAlerts(): Promise<RiskAlert[]> {
  const pools = await fetchPools();
  const alerts: RiskAlert[] = [];

  const solanaPools = pools.filter(
    (p) =>
      p.chain === "Solana" &&
      p.stablecoin === true &&
      isStablecoinSymbol(p.symbol) &&
      p.tvlUsd > 10_000 &&
      !p.outlier
  );

  for (const p of solanaPools) {
    // High APY alert (potential risk or opportunity)
    if (p.apy && p.apy > 20) {
      alerts.push({
        id: `high-apy-${p.pool}`,
        type: "high_apy",
        severity: p.apy > 50 ? "high" : "medium",
        protocol: getProtocolName(p.project),
        pool: p.pool,
        symbol: p.symbol,
        message: `${getProtocolName(p.project)} ${p.symbol} pool has unusually high APY of ${p.apy.toFixed(2)}%. This may indicate high risk or temporary incentives.`,
        value: p.apy,
        threshold: 20,
        timestamp: new Date().toISOString(),
      });
    }

    // Low TVL alert
    if (p.tvlUsd < 100_000 && p.apy && p.apy > 5) {
      alerts.push({
        id: `low-tvl-${p.pool}`,
        type: "low_tvl",
        severity: "high",
        protocol: getProtocolName(p.project),
        pool: p.pool,
        symbol: p.symbol,
        message: `${getProtocolName(p.project)} ${p.symbol} pool has low TVL ($${(p.tvlUsd / 1000).toFixed(0)}K) with ${p.apy.toFixed(2)}% APY. Low liquidity increases risk.`,
        value: p.tvlUsd,
        threshold: 100_000,
        timestamp: new Date().toISOString(),
      });
    }

    // TVL drop alert (using 30d mean vs current APY as proxy)
    if (p.apyMean30d && p.apy && p.apyMean30d > 0) {
      const rateChange = ((p.apy - p.apyMean30d) / p.apyMean30d) * 100;
      if (Math.abs(rateChange) > 50 && p.tvlUsd > 500_000) {
        alerts.push({
          id: `rate-change-${p.pool}`,
          type: "rate_spike",
          severity: Math.abs(rateChange) > 100 ? "high" : "medium",
          protocol: getProtocolName(p.project),
          pool: p.pool,
          symbol: p.symbol,
          message: `${getProtocolName(p.project)} ${p.symbol} APY ${rateChange > 0 ? "spiked" : "dropped"} ${Math.abs(rateChange).toFixed(0)}% vs 30-day average (${p.apyMean30d.toFixed(2)}% -> ${p.apy.toFixed(2)}%).`,
          value: rateChange,
          threshold: 50,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
