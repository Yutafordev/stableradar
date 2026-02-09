import { NextResponse } from "next/server";
import { fetchYields, fetchBorrowRates } from "@/lib/fetchers/defillama";
import { YieldOpportunity, BorrowRate } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

interface Strategy {
  name: string;
  type: string;
  description: string;
  expectedApy: number;
  riskLevel: string;
  steps: string[];
  protocols: string[];
  pools: { protocol: string; token: string; apy: number; tvl: number }[];
}

function generateStrategies(
  yields: YieldOpportunity[],
  borrowRates: BorrowRate[]
): Strategy[] {
  const strategies: Strategy[] = [];

  const safeYields = yields
    .filter((y) => y.riskLevel === "low" && y.tvl > 1_000_000)
    .sort((a, b) => b.apy - a.apy);

  if (safeYields.length > 0) {
    const best = safeYields[0];
    strategies.push({
      name: "Safe Harbor",
      type: "conservative",
      description: `Deposit stablecoins in the highest-yielding low-risk pool with strong TVL.`,
      expectedApy: best.apy,
      riskLevel: "low",
      steps: [
        `Deposit ${best.token} into ${best.protocol}`,
        `Current APY: ${best.apy.toFixed(2)}% on ${formatUsd(best.tvl)} TVL`,
      ],
      protocols: [best.protocol],
      pools: [{ protocol: best.protocol, token: best.token, apy: best.apy, tvl: best.tvl }],
    });
  }

  const topByToken = new Map<string, YieldOpportunity>();
  for (const y of yields) {
    if (y.riskLevel !== "high" && y.tvl > 500_000) {
      const existing = topByToken.get(y.token);
      if (!existing || y.apy > existing.apy) {
        topByToken.set(y.token, y);
      }
    }
  }

  if (topByToken.size >= 2) {
    const picks = [...topByToken.values()].sort((a, b) => b.apy - a.apy).slice(0, 4);
    const avgApy = picks.reduce((sum, p) => sum + p.apy, 0) / picks.length;
    strategies.push({
      name: "Diversified Yield",
      type: "balanced",
      description: "Split across top stablecoin pools to reduce single-protocol risk.",
      expectedApy: avgApy,
      riskLevel: "medium",
      steps: picks.map(
        (p) => `${p.token} on ${p.protocol}: ${p.apy.toFixed(2)}% APY`
      ),
      protocols: [...new Set(picks.map((p) => p.protocol))],
      pools: picks.map((p) => ({ protocol: p.protocol, token: p.token, apy: p.apy, tvl: p.tvl })),
    });
  }

  if (borrowRates.length > 0 && yields.length > 0) {
    const cheapestBorrow = borrowRates[0];
    const bestYieldForToken = yields
      .filter(
        (y) => y.token === cheapestBorrow.borrowToken && y.riskLevel !== "high"
      )
      .sort((a, b) => b.apy - a.apy)[0];

    if (bestYieldForToken && bestYieldForToken.apy > cheapestBorrow.borrowApy) {
      const spread = bestYieldForToken.apy - cheapestBorrow.borrowApy;
      strategies.push({
        name: "Yield Arbitrage",
        type: "aggressive",
        description: `Borrow ${cheapestBorrow.borrowToken} cheaply and deposit at a higher rate elsewhere.`,
        expectedApy: spread,
        riskLevel: "high",
        steps: [
          `Borrow ${cheapestBorrow.borrowToken} on ${cheapestBorrow.protocol} at ${cheapestBorrow.borrowApy.toFixed(2)}%`,
          `Deposit into ${bestYieldForToken.protocol} at ${bestYieldForToken.apy.toFixed(2)}%`,
          `Net spread: ${spread.toFixed(2)}% APY`,
        ],
        protocols: [cheapestBorrow.protocol, bestYieldForToken.protocol],
        pools: [
          { protocol: cheapestBorrow.protocol, token: cheapestBorrow.borrowToken, apy: -cheapestBorrow.borrowApy, tvl: cheapestBorrow.tvl },
          { protocol: bestYieldForToken.protocol, token: bestYieldForToken.token, apy: bestYieldForToken.apy, tvl: bestYieldForToken.tvl },
        ],
      });
    }
  }

  return strategies;
}

export async function GET() {
  try {
    const [yields, borrowRates] = await Promise.all([
      fetchYields(),
      fetchBorrowRates(),
    ]);

    const strategies = generateStrategies(yields, borrowRates);

    return NextResponse.json({
      strategies,
      meta: {
        count: strategies.length,
        lastUpdated: new Date().toISOString(),
        source: "StableRadar Strategy Engine",
        disclaimer: "Not financial advice. Strategies are generated algorithmically based on current market data.",
      },
    });
  } catch (error) {
    console.error("Error generating strategies:", error);
    return NextResponse.json(
      { error: "Failed to generate strategies" },
      { status: 500 }
    );
  }
}
