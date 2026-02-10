import { NextResponse } from "next/server";
import { fetchYields } from "@/lib/fetchers/defillama";
import { PROTOCOLS, ProtocolHealth } from "@/lib/types";

export const dynamic = "force-dynamic";

function computeHealthScore(
  pools: { apy: number; tvl: number; sigma: number | null; apyMean30d: number | null }[],
  slug: string
): Omit<ProtocolHealth, "protocol" | "slug" | "category"> {
  const info = PROTOCOLS[slug];
  const totalTvl = pools.reduce((s, p) => s + p.tvl, 0);
  const avgApy = pools.length > 0 ? pools.reduce((s, p) => s + p.apy, 0) / pools.length : 0;

  // TVL depth (0-25)
  let tvlDepth: number;
  if (totalTvl > 500_000_000) tvlDepth = 25;
  else if (totalTvl > 100_000_000) tvlDepth = 22;
  else if (totalTvl > 50_000_000) tvlDepth = 18;
  else if (totalTvl > 10_000_000) tvlDepth = 14;
  else if (totalTvl > 1_000_000) tvlDepth = 8;
  else tvlDepth = 3;

  // Pool diversity (0-15)
  const poolCount = pools.length;
  let poolDiversity: number;
  if (poolCount >= 10) poolDiversity = 15;
  else if (poolCount >= 6) poolDiversity = 12;
  else if (poolCount >= 3) poolDiversity = 8;
  else poolDiversity = 4;

  // APY stability via sigma (0-20) — lower sigma is better
  const sigmas = pools.map((p) => p.sigma).filter((s): s is number => s !== null);
  let apyStability: number;
  if (sigmas.length === 0) {
    apyStability = 10; // neutral if no data
  } else {
    const avgSigma = sigmas.reduce((s, v) => s + v, 0) / sigmas.length;
    if (avgSigma < 0.5) apyStability = 20;
    else if (avgSigma < 1) apyStability = 16;
    else if (avgSigma < 2) apyStability = 12;
    else if (avgSigma < 5) apyStability = 6;
    else apyStability = 2;
  }

  // Audit status (0-15)
  const auditScore = info?.audited ? 15 : 3;

  // Protocol maturity (0-15)
  const months = info?.ageMonths || 6;
  let maturityScore: number;
  if (months >= 36) maturityScore = 15;
  else if (months >= 24) maturityScore = 12;
  else if (months >= 12) maturityScore = 9;
  else if (months >= 6) maturityScore = 5;
  else maturityScore = 2;

  // Yield competitiveness (0-10)
  let yieldCompetitiveness: number;
  if (avgApy >= 10) yieldCompetitiveness = 10;
  else if (avgApy >= 7) yieldCompetitiveness = 8;
  else if (avgApy >= 5) yieldCompetitiveness = 6;
  else if (avgApy >= 3) yieldCompetitiveness = 4;
  else yieldCompetitiveness = 2;

  const score = tvlDepth + poolDiversity + apyStability + auditScore + maturityScore + yieldCompetitiveness;

  let grade: "A" | "B" | "C" | "D" | "F";
  if (score >= 80) grade = "A";
  else if (score >= 65) grade = "B";
  else if (score >= 50) grade = "C";
  else if (score >= 35) grade = "D";
  else grade = "F";

  return {
    grade,
    score,
    tvlDepth,
    poolDiversity,
    apyStability,
    auditScore,
    maturityScore,
    yieldCompetitiveness,
    poolCount,
    totalTvl,
    avgApy: Math.round(avgApy * 100) / 100,
  };
}

export async function GET() {
  try {
    const yields = await fetchYields();

    // Group by protocol slug
    const grouped = new Map<string, typeof yields>();
    for (const y of yields) {
      const existing = grouped.get(y.protocolSlug) || [];
      existing.push(y);
      grouped.set(y.protocolSlug, existing);
    }

    const healthScores: ProtocolHealth[] = [];
    for (const [slug, pools] of grouped) {
      const info = PROTOCOLS[slug];
      const health = computeHealthScore(pools, slug);
      healthScores.push({
        protocol: info?.name || slug,
        slug,
        category: info?.category || "DeFi",
        ...health,
      });
    }

    healthScores.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      protocols: healthScores,
      meta: {
        totalProtocols: healthScores.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Health API error:", error);
    return NextResponse.json(
      { error: "Failed to compute protocol health" },
      { status: 500 }
    );
  }
}
