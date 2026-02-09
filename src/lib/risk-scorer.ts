import { RiskLevel, RiskBreakdown, RiskFactor } from "./types";

interface RiskInput {
  tvl: number;
  utilizationRate: number | null;
  protocolAgeMonths: number;
  audited: boolean;
  apy: number;
  ilRisk: string;
}

function tvlFactor(tvl: number): RiskFactor {
  let score: number;
  let explanation: string;
  if (tvl > 100_000_000) {
    score = 0;
    explanation = "Very deep liquidity (>$100M) — minimal risk";
  } else if (tvl > 50_000_000) {
    score = 0.5;
    explanation = "Strong liquidity ($50-100M)";
  } else if (tvl > 10_000_000) {
    score = 1;
    explanation = "Moderate liquidity ($10-50M)";
  } else if (tvl > 1_000_000) {
    score = 2;
    explanation = "Lower liquidity ($1-10M) — some risk";
  } else {
    score = 3;
    explanation = "Low liquidity (<$1M) — elevated risk";
  }
  return { score, maxScore: 3, explanation };
}

function utilizationFactor(rate: number | null): RiskFactor {
  if (rate === null) {
    return { score: 0, maxScore: 3, explanation: "Utilization data not available" };
  }
  let score: number;
  let explanation: string;
  if (rate > 0.95) {
    score = 3;
    explanation = `Very high utilization (${(rate * 100).toFixed(0)}%) — withdrawal risk`;
  } else if (rate > 0.85) {
    score = 1.5;
    explanation = `High utilization (${(rate * 100).toFixed(0)}%)`;
  } else if (rate > 0.75) {
    score = 0.5;
    explanation = `Moderate utilization (${(rate * 100).toFixed(0)}%)`;
  } else {
    score = 0;
    explanation = `Healthy utilization (${(rate * 100).toFixed(0)}%)`;
  }
  return { score, maxScore: 3, explanation };
}

function protocolAgeFactor(months: number): RiskFactor {
  let score: number;
  let explanation: string;
  if (months < 3) {
    score = 3;
    explanation = `Very new protocol (<3 months) — higher smart contract risk`;
  } else if (months < 6) {
    score = 2;
    explanation = `New protocol (${months} months) — moderate smart contract risk`;
  } else if (months < 12) {
    score = 1;
    explanation = `Established protocol (${months} months)`;
  } else {
    score = 0;
    explanation = `Mature protocol (${months}+ months) — battle-tested`;
  }
  return { score, maxScore: 3, explanation };
}

function auditFactor(audited: boolean): RiskFactor {
  if (!audited) {
    return { score: 2, maxScore: 2, explanation: "No audit found — unverified smart contracts" };
  }
  return { score: 0, maxScore: 2, explanation: "Audited smart contracts" };
}

function apyLevelFactor(apy: number): RiskFactor {
  let score: number;
  let explanation: string;
  if (apy > 50) {
    score = 3;
    explanation = `Extremely high APY (${apy.toFixed(1)}%) — likely unsustainable or high risk`;
  } else if (apy > 25) {
    score = 2;
    explanation = `Very high APY (${apy.toFixed(1)}%) — may include temporary incentives`;
  } else if (apy > 15) {
    score = 1;
    explanation = `Above-average APY (${apy.toFixed(1)}%) — some elevated risk`;
  } else {
    score = 0;
    explanation = `Normal APY range (${apy.toFixed(1)}%) for stablecoins`;
  }
  return { score, maxScore: 3, explanation };
}

function ilRiskFactor(ilRisk: string): RiskFactor {
  if (ilRisk === "yes") {
    return { score: 1, maxScore: 1, explanation: "Exposed to impermanent loss (LP pool)" };
  }
  return { score: 0, maxScore: 1, explanation: "No impermanent loss risk (single-asset)" };
}

export function scoreRisk(input: RiskInput): { level: RiskLevel; score: number; breakdown: RiskBreakdown } {
  const breakdown: RiskBreakdown = {
    tvl: tvlFactor(input.tvl),
    utilization: utilizationFactor(input.utilizationRate),
    protocolAge: protocolAgeFactor(input.protocolAgeMonths),
    audit: auditFactor(input.audited),
    apyLevel: apyLevelFactor(input.apy),
    ilRisk: ilRiskFactor(input.ilRisk),
  };

  const score =
    breakdown.tvl.score +
    breakdown.utilization.score +
    breakdown.protocolAge.score +
    breakdown.audit.score +
    breakdown.apyLevel.score +
    breakdown.ilRisk.score;

  const level: RiskLevel = score >= 5 ? "high" : score >= 2.5 ? "medium" : "low";

  return { level, score: Math.round(score * 10) / 10, breakdown };
}
