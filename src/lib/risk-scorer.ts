import { RiskLevel } from "./types";

interface RiskInput {
  tvl: number;
  utilizationRate: number | null;
  protocolAgeMonths: number;
  audited: boolean;
  apy: number;
  ilRisk: string;
}

export function scoreRisk(input: RiskInput): { level: RiskLevel; score: number } {
  let score = 0;

  // TVL factor
  if (input.tvl > 100_000_000) score += 0;
  else if (input.tvl > 50_000_000) score += 0.5;
  else if (input.tvl > 10_000_000) score += 1;
  else if (input.tvl > 1_000_000) score += 2;
  else score += 3;

  // Utilization factor
  if (input.utilizationRate !== null) {
    if (input.utilizationRate > 0.95) score += 3;
    else if (input.utilizationRate > 0.85) score += 1.5;
    else if (input.utilizationRate > 0.75) score += 0.5;
  }

  // Protocol maturity
  if (input.protocolAgeMonths < 3) score += 3;
  else if (input.protocolAgeMonths < 6) score += 2;
  else if (input.protocolAgeMonths < 12) score += 1;

  // Audit factor
  if (!input.audited) score += 2;

  // Suspiciously high APY for stablecoins
  if (input.apy > 50) score += 3;
  else if (input.apy > 25) score += 2;
  else if (input.apy > 15) score += 1;

  // IL risk
  if (input.ilRisk === "yes") score += 1;

  const level: RiskLevel = score >= 5 ? "high" : score >= 2.5 ? "medium" : "low";

  return { level, score: Math.round(score * 10) / 10 };
}
