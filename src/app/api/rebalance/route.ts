import { NextResponse } from "next/server";
import { fetchYields } from "@/lib/fetchers/defillama";
import { YieldOpportunity, RebalancePosition, RebalanceMove, RebalanceResult } from "@/lib/types";

export const dynamic = "force-dynamic";

function findCurrentPool(yields: YieldOpportunity[], protocol: string, token: string): YieldOpportunity | null {
  const tokenUpper = token.toUpperCase();
  return yields.find(
    (y) =>
      (y.protocol.toLowerCase() === protocol.toLowerCase() ||
        y.protocolSlug.toLowerCase() === protocol.toLowerCase()) &&
      y.token.toUpperCase() === tokenUpper
  ) || null;
}

function findBetterPools(
  yields: YieldOpportunity[],
  token: string,
  currentApy: number,
  optimizeFor: "apy" | "risk" | "sharpe",
  riskTolerance: "low" | "medium" | "high"
): YieldOpportunity[] {
  const tokenUpper = token.toUpperCase();
  const candidates = yields.filter((y) => y.token.toUpperCase() === tokenUpper);

  const riskMax = riskTolerance === "low" ? 4 : riskTolerance === "medium" ? 7 : 10;

  return candidates
    .filter((y) => {
      if (optimizeFor === "risk") return y.riskScore < riskMax;
      if (optimizeFor === "sharpe") return y.riskScore <= riskMax && y.apy > currentApy * 0.8;
      return y.apy > currentApy; // apy mode
    })
    .sort((a, b) => {
      if (optimizeFor === "risk") return a.riskScore - b.riskScore;
      if (optimizeFor === "sharpe") {
        const sharpeA = a.riskScore > 0 ? a.apy / a.riskScore : a.apy;
        const sharpeB = b.riskScore > 0 ? b.apy / b.riskScore : b.apy;
        return sharpeB - sharpeA;
      }
      return b.apy - a.apy;
    })
    .slice(0, 3);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const positions: RebalancePosition[] = body.positions || [];
    const riskTolerance: "low" | "medium" | "high" = body.riskTolerance || "medium";
    const optimizeFor: "apy" | "risk" | "sharpe" = body.optimizeFor || "apy";

    if (!positions.length) {
      return NextResponse.json({ error: "No positions provided" }, { status: 400 });
    }

    const yields = await fetchYields();
    const moves: RebalanceMove[] = [];

    let currentWeightedApy = 0;
    let currentWeightedRisk = 0;
    let totalValue = 0;
    let optimizedWeightedApy = 0;
    let optimizedWeightedRisk = 0;

    for (const pos of positions) {
      totalValue += pos.amount;
      const current = findCurrentPool(yields, pos.protocol, pos.token);
      const currentApy = current?.apy || 0;
      const currentRisk = current?.riskScore || 5;

      currentWeightedApy += currentApy * pos.amount;
      currentWeightedRisk += currentRisk * pos.amount;

      const better = findBetterPools(yields, pos.token, currentApy, optimizeFor, riskTolerance);
      const best = better[0];

      if (best && best.pool !== current?.pool) {
        const apyGain = best.apy - currentApy;
        let reason: string;
        if (optimizeFor === "risk") {
          reason = `Lower risk: ${best.protocol} (risk ${best.riskScore}) vs current (risk ${currentRisk}), APY ${best.apy.toFixed(2)}%`;
        } else if (optimizeFor === "sharpe") {
          const currentSharpe = currentRisk > 0 ? currentApy / currentRisk : 0;
          const newSharpe = best.riskScore > 0 ? best.apy / best.riskScore : 0;
          reason = `Better risk-adjusted return: Sharpe ${newSharpe.toFixed(2)} vs ${currentSharpe.toFixed(2)}, APY ${best.apy.toFixed(2)}%`;
        } else {
          reason = `Higher APY: ${best.apy.toFixed(2)}% vs ${currentApy.toFixed(2)}% (+${apyGain.toFixed(2)}pp)`;
        }

        moves.push({
          from: { protocol: pos.protocol, token: pos.token, amount: pos.amount },
          to: { protocol: best.protocol, pool: best.pool, token: best.token, apy: best.apy, riskLevel: best.riskLevel },
          reason,
          apyGain,
        });
        optimizedWeightedApy += best.apy * pos.amount;
        optimizedWeightedRisk += best.riskScore * pos.amount;
      } else {
        optimizedWeightedApy += currentApy * pos.amount;
        optimizedWeightedRisk += currentRisk * pos.amount;
      }
    }

    const result: RebalanceResult = {
      currentMetrics: {
        weightedApy: totalValue > 0 ? Math.round((currentWeightedApy / totalValue) * 100) / 100 : 0,
        avgRiskScore: totalValue > 0 ? Math.round((currentWeightedRisk / totalValue) * 10) / 10 : 0,
        totalValue,
      },
      optimizedMetrics: {
        weightedApy: totalValue > 0 ? Math.round((optimizedWeightedApy / totalValue) * 100) / 100 : 0,
        avgRiskScore: totalValue > 0 ? Math.round((optimizedWeightedRisk / totalValue) * 10) / 10 : 0,
        totalValue,
      },
      moves: moves.sort((a, b) => b.apyGain - a.apyGain),
      improvement: {
        apyGain: totalValue > 0 ? Math.round(((optimizedWeightedApy - currentWeightedApy) / totalValue) * 100) / 100 : 0,
        apyGainPct: currentWeightedApy > 0 ? Math.round(((optimizedWeightedApy - currentWeightedApy) / currentWeightedApy) * 10000) / 100 : 0,
      },
    };

    return NextResponse.json({
      result,
      meta: {
        positionsAnalyzed: positions.length,
        movesRecommended: moves.length,
        optimizeFor,
        riskTolerance,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Rebalance API error:", error);
    return NextResponse.json({ error: "Failed to compute rebalance" }, { status: 500 });
  }
}
