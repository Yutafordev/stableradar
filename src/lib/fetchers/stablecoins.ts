import { StablecoinPegData } from "../types";

const STABLECOINS_URL =
  "https://stablecoins.llama.fi/stablecoins?includePrices=true";

// ── In-memory cache (same pattern as defillama.ts) ──
let cachedData: StablecoinPegData[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Map pegType strings from API to human-readable peg value
const PEG_VALUES: Record<string, number> = {
  peggedUSD: 1.0,
  peggedEUR: 1.0,
  peggedCHF: 1.0,
  peggedGBP: 1.0,
  peggedCAD: 1.0,
  peggedJPY: 1.0,
};

const PEG_LABELS: Record<string, string> = {
  peggedUSD: "USD",
  peggedEUR: "EUR",
  peggedCHF: "CHF",
  peggedGBP: "GBP",
  peggedCAD: "CAD",
  peggedJPY: "JPY",
};

function getPegKey(pegType: string): string {
  // The API uses keys like "peggedUSD" inside circulating objects
  return pegType; // e.g. "peggedUSD"
}

function computeSupplyChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function computeStabilityScore(
  deviationPct: number,
  supplyChange24h: number,
  supplyChange7d: number,
  supplyChange30d: number,
  solanaCirculating: number
): { score: number; level: "excellent" | "good" | "fair" | "poor" } {
  let score = 100;

  // Deviation penalty (biggest factor)
  const absDeviation = Math.abs(deviationPct);
  if (absDeviation > 5) score -= 60;
  else if (absDeviation > 2) score -= 40;
  else if (absDeviation > 1) score -= 25;
  else if (absDeviation > 0.5) score -= 15;
  else if (absDeviation > 0.1) score -= 5;

  // Supply change penalties (large moves = instability)
  const abs24h = Math.abs(supplyChange24h);
  if (abs24h > 10) score -= 15;
  else if (abs24h > 5) score -= 10;
  else if (abs24h > 2) score -= 5;

  const abs7d = Math.abs(supplyChange7d);
  if (abs7d > 20) score -= 10;
  else if (abs7d > 10) score -= 5;

  const abs30d = Math.abs(supplyChange30d);
  if (abs30d > 30) score -= 10;
  else if (abs30d > 15) score -= 5;

  // Low Solana circulating penalty
  if (solanaCirculating < 100_000) score -= 10;
  else if (solanaCirculating < 1_000_000) score -= 5;

  score = Math.max(0, Math.min(100, score));

  let level: "excellent" | "good" | "fair" | "poor";
  if (score >= 85) level = "excellent";
  else if (score >= 65) level = "good";
  else if (score >= 40) level = "fair";
  else level = "poor";

  return { score, level };
}

function collectRiskFactors(
  deviationPct: number,
  supplyChange24h: number,
  supplyChange7d: number,
  solanaCirculating: number,
  pegMechanism: string
): string[] {
  const factors: string[] = [];
  const absDeviation = Math.abs(deviationPct);

  if (absDeviation > 1) factors.push("Significant depeg detected");
  else if (absDeviation > 0.5) factors.push("Moderate price deviation");
  else if (absDeviation > 0.1) factors.push("Minor price deviation");

  if (Math.abs(supplyChange24h) > 5)
    factors.push(`Supply ${supplyChange24h > 0 ? "increased" : "decreased"} ${Math.abs(supplyChange24h).toFixed(1)}% in 24h`);

  if (Math.abs(supplyChange7d) > 10)
    factors.push(`Supply ${supplyChange7d > 0 ? "increased" : "decreased"} ${Math.abs(supplyChange7d).toFixed(1)}% in 7d`);

  if (solanaCirculating < 100_000)
    factors.push("Very low Solana liquidity");
  else if (solanaCirculating < 1_000_000)
    factors.push("Low Solana liquidity");

  if (pegMechanism === "algorithmic")
    factors.push("Algorithmic peg mechanism");

  return factors;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchStablecoinPegData(): Promise<StablecoinPegData[]> {
  const now = Date.now();
  if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
    return cachedData;
  }

  const res = await fetch(STABLECOINS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Stablecoins API error: ${res.status}`);

  const json = await res.json();
  const assets: any[] = json.peggedAssets ?? [];

  const results: StablecoinPegData[] = [];

  for (const asset of assets) {
    // Only include stablecoins that exist on Solana
    const solanaChain = asset.chainCirculating?.Solana;
    if (!solanaChain) continue;

    const pegType: string = asset.pegType ?? "peggedUSD";
    const pegKey = getPegKey(pegType);
    const pegValue = PEG_VALUES[pegType] ?? 1.0;
    const price: number = asset.price ?? pegValue;

    // Get circulating values
    const totalCirculating: number =
      asset.circulating?.[pegKey] ?? 0;
    const solanaCirculating: number =
      solanaChain.current?.[pegKey] ?? 0;

    // Skip stablecoins with negligible Solana presence
    if (solanaCirculating < 1000) continue;

    const prevDay: number =
      asset.circulatingPrevDay?.[pegKey] ?? totalCirculating;
    const prevWeek: number =
      asset.circulatingPrevWeek?.[pegKey] ?? totalCirculating;
    const prevMonth: number =
      asset.circulatingPrevMonth?.[pegKey] ?? totalCirculating;

    const deviation = price - pegValue;
    const deviationPct =
      pegValue !== 0 ? ((price - pegValue) / pegValue) * 100 : 0;

    const supplyChange24h = computeSupplyChange(totalCirculating, prevDay);
    const supplyChange7d = computeSupplyChange(totalCirculating, prevWeek);
    const supplyChange30d = computeSupplyChange(totalCirculating, prevMonth);

    const pegMechanism: string = asset.pegMechanism ?? "unknown";

    const { score, level } = computeStabilityScore(
      deviationPct,
      supplyChange24h,
      supplyChange7d,
      supplyChange30d,
      solanaCirculating
    );

    const riskFactors = collectRiskFactors(
      deviationPct,
      supplyChange24h,
      supplyChange7d,
      solanaCirculating,
      pegMechanism
    );

    results.push({
      symbol: asset.symbol ?? "UNKNOWN",
      name: asset.name ?? asset.symbol ?? "Unknown",
      pegType: PEG_LABELS[pegType] ?? pegType,
      pegMechanism,
      price,
      pegValue,
      deviation: Math.round(deviation * 10000) / 10000,
      deviationPct: Math.round(deviationPct * 10000) / 10000,
      circulating: totalCirculating,
      solanaCirculating,
      supplyChange24h: Math.round(supplyChange24h * 100) / 100,
      supplyChange7d: Math.round(supplyChange7d * 100) / 100,
      supplyChange30d: Math.round(supplyChange30d * 100) / 100,
      stabilityScore: score,
      stabilityLevel: level,
      riskFactors,
    });
  }

  // Sort by Solana circulating (most important first)
  results.sort((a, b) => b.solanaCirculating - a.solanaCirculating);

  cachedData = results;
  cacheTimestamp = now;
  return results;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
