import { NextResponse } from "next/server";
import { fetchYields } from "@/lib/fetchers/defillama";
import { YieldOpportunity } from "@/lib/types";

export const dynamic = "force-dynamic";

type RiskTolerance = "low" | "medium" | "high";

interface RecommendRequest {
  riskTolerance: RiskTolerance;
  token?: string;
  amount?: number;
  minTvl?: number;
  excludeProtocols?: string[];
}

interface Recommendation {
  pool: YieldOpportunity;
  matchScore: number;
  estimatedAnnualYield: number | null;
  reasoning: string;
}

function scorePool(
  pool: YieldOpportunity,
  risk: RiskTolerance
): { score: number; reasoning: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // APY score (0-40)
  const apyScore = Math.min(pool.apy / 0.5, 40);
  score += apyScore;
  reasons.push(`APY ${pool.apy.toFixed(2)}% (+${apyScore.toFixed(0)}pts)`);

  // Risk alignment (±20)
  const riskTarget = risk === "low" ? 2 : risk === "medium" ? 5 : 10;
  const riskDiff = Math.abs(pool.riskScore - riskTarget);
  const riskPenalty = Math.min(riskDiff * 4, 20);
  if (risk === "low" && pool.riskScore <= 3) {
    score += 20;
    reasons.push("Low risk profile matches (+20pts)");
  } else if (risk === "high" && pool.riskScore >= 4) {
    score += 15;
    reasons.push("Higher risk accepted for yield (+15pts)");
  } else {
    score += 20 - riskPenalty;
    reasons.push(
      `Risk alignment: score ${pool.riskScore} vs target ${riskTarget} (${(20 - riskPenalty).toFixed(0)}pts)`
    );
  }

  // TVL depth (0-20)
  let tvlScore: number;
  if (pool.tvl > 100_000_000) {
    tvlScore = 20;
    reasons.push("Deep liquidity >$100M (+20pts)");
  } else if (pool.tvl > 50_000_000) {
    tvlScore = 16;
    reasons.push("Strong liquidity $50-100M (+16pts)");
  } else if (pool.tvl > 10_000_000) {
    tvlScore = 12;
    reasons.push("Good liquidity $10-50M (+12pts)");
  } else if (pool.tvl > 1_000_000) {
    tvlScore = 6;
    reasons.push("Moderate liquidity $1-10M (+6pts)");
  } else {
    tvlScore = 2;
    reasons.push("Low liquidity <$1M (+2pts)");
  }
  score += tvlScore;

  // Stability (0-10) — low sigma or small deviation from 30d mean
  if (pool.apyMean30d !== null) {
    const deviation = Math.abs(pool.apy - pool.apyMean30d);
    const devPct = pool.apyMean30d > 0 ? deviation / pool.apyMean30d : 1;
    const stabilityScore = Math.max(0, 10 - devPct * 20);
    score += stabilityScore;
    reasons.push(
      `Yield stability: ${(devPct * 100).toFixed(0)}% deviation (+${stabilityScore.toFixed(0)}pts)`
    );
  }

  // Maturity (0-10)
  const maturityScore = Math.min(pool.protocolAgeMonths / 3, 10);
  score += maturityScore;
  if (pool.protocolAudited) {
    score += 2;
    reasons.push(`Audited, ${pool.protocolAgeMonths}mo old (+${(maturityScore + 2).toFixed(0)}pts)`);
  } else {
    reasons.push(`${pool.protocolAgeMonths}mo old, unaudited (+${maturityScore.toFixed(0)}pts)`);
  }

  return { score: Math.round(score * 10) / 10, reasoning: reasons };
}

function parseRequest(searchParams: URLSearchParams): RecommendRequest {
  return {
    riskTolerance: (searchParams.get("risk") as RiskTolerance) || "medium",
    token: searchParams.get("token") || undefined,
    amount: searchParams.get("amount")
      ? parseFloat(searchParams.get("amount")!)
      : undefined,
    minTvl: searchParams.get("minTvl")
      ? parseFloat(searchParams.get("minTvl")!)
      : undefined,
    excludeProtocols: searchParams.get("excludeProtocols")
      ? searchParams.get("excludeProtocols")!.split(",")
      : undefined,
  };
}

function buildRecommendations(
  req: RecommendRequest,
  yields: YieldOpportunity[]
): { recommendations: Recommendation[]; totalAnalyzed: number } {
  let filtered = yields;

  if (req.token) {
    filtered = filtered.filter(
      (y) => y.token.toUpperCase() === req.token!.toUpperCase()
    );
  }
  if (req.minTvl) {
    filtered = filtered.filter((y) => y.tvl >= req.minTvl!);
  }
  if (req.excludeProtocols && req.excludeProtocols.length > 0) {
    const excluded = new Set(req.excludeProtocols.map((p) => p.toLowerCase()));
    filtered = filtered.filter(
      (y) => !excluded.has(y.protocolSlug.toLowerCase())
    );
  }

  const totalAnalyzed = filtered.length;

  const scored = filtered.map((pool) => {
    const { score, reasoning } = scorePool(pool, req.riskTolerance);
    const estimatedAnnualYield = req.amount
      ? Math.round(req.amount * (pool.apy / 100) * 100) / 100
      : null;
    return {
      pool,
      matchScore: score,
      estimatedAnnualYield,
      reasoning: reasoning.join(". ") + ".",
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return {
    recommendations: scored.slice(0, 5),
    totalAnalyzed,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const req = parseRequest(searchParams);
    const yields = await fetchYields();
    const { recommendations, totalAnalyzed } = buildRecommendations(
      req,
      yields
    );

    return NextResponse.json({
      recommendations,
      meta: {
        totalPoolsAnalyzed: totalAnalyzed,
        riskTolerance: req.riskTolerance,
        token: req.token || "all",
        timestamp: new Date().toISOString(),
        source: "StableRadar / DeFi Llama",
      },
    });
  } catch (error) {
    console.error("Agent recommend error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RecommendRequest>;
    const req: RecommendRequest = {
      riskTolerance: body.riskTolerance || "medium",
      token: body.token,
      amount: body.amount,
      minTvl: body.minTvl,
      excludeProtocols: body.excludeProtocols,
    };

    const yields = await fetchYields();
    const { recommendations, totalAnalyzed } = buildRecommendations(
      req,
      yields
    );

    return NextResponse.json({
      recommendations,
      meta: {
        totalPoolsAnalyzed: totalAnalyzed,
        riskTolerance: req.riskTolerance,
        token: req.token || "all",
        amount: req.amount || null,
        timestamp: new Date().toISOString(),
        source: "StableRadar / DeFi Llama",
      },
    });
  } catch (error) {
    console.error("Agent recommend error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
