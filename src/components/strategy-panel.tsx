"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YieldOpportunity, BorrowRate } from "@/lib/types";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

interface Strategy {
  name: string;
  description: string;
  expectedApy: number;
  riskLevel: "low" | "medium" | "high";
  steps: string[];
  protocols: string[];
}

function generateStrategies(
  yields: YieldOpportunity[],
  borrowRates: BorrowRate[]
): Strategy[] {
  const strategies: Strategy[] = [];

  // Strategy 1: Best safe yield
  const safeYields = yields
    .filter((y) => y.riskLevel === "low" && y.tvl > 1_000_000)
    .sort((a, b) => b.apy - a.apy);

  if (safeYields.length > 0) {
    const best = safeYields[0];
    strategies.push({
      name: "Safe Harbor",
      description: `Deposit stablecoins in the highest-yielding low-risk pool with strong TVL.`,
      expectedApy: best.apy,
      riskLevel: "low",
      steps: [
        `Deposit ${best.token} into ${best.protocol}`,
        `Current APY: ${best.apy.toFixed(2)}% on ${formatUsd(best.tvl)} TVL`,
        `Pool: ${best.symbol}`,
      ],
      protocols: [best.protocol],
    });
  }

  // Strategy 2: Yield diversification across protocols
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
    const picks = [...topByToken.values()].sort((a, b) => b.apy - a.apy).slice(0, 3);
    const avgApy = picks.reduce((sum, p) => sum + p.apy, 0) / picks.length;
    strategies.push({
      name: "Diversified Yield",
      description: "Split across top stablecoin pools to reduce single-protocol risk.",
      expectedApy: avgApy,
      riskLevel: "medium",
      steps: picks.map(
        (p) => `${p.token} on ${p.protocol}: ${p.apy.toFixed(2)}% (${formatUsd(p.tvl)} TVL)`
      ),
      protocols: picks.map((p) => p.protocol),
    });
  }

  // Strategy 3: Borrow-Supply Arbitrage
  if (borrowRates.length > 0 && yields.length > 0) {
    const cheapestBorrow = borrowRates[0]; // Already sorted by borrow APY
    const bestYieldForToken = yields
      .filter(
        (y) => y.token === cheapestBorrow.borrowToken && y.riskLevel !== "high"
      )
      .sort((a, b) => b.apy - a.apy)[0];

    if (bestYieldForToken && bestYieldForToken.apy > cheapestBorrow.borrowApy) {
      const spread = bestYieldForToken.apy - cheapestBorrow.borrowApy;
      strategies.push({
        name: "Yield Arbitrage",
        description: `Borrow ${cheapestBorrow.borrowToken} cheaply and deposit at a higher rate elsewhere.`,
        expectedApy: spread,
        riskLevel: "high",
        steps: [
          `Borrow ${cheapestBorrow.borrowToken} on ${cheapestBorrow.protocol} at ${cheapestBorrow.borrowApy.toFixed(2)}%`,
          `Deposit into ${bestYieldForToken.protocol} at ${bestYieldForToken.apy.toFixed(2)}%`,
          `Net spread: ${spread.toFixed(2)}% APY`,
        ],
        protocols: [cheapestBorrow.protocol, bestYieldForToken.protocol],
      });
    }
  }

  // Strategy 4: High-yield opportunity
  const highYield = yields
    .filter((y) => y.apy > 10 && y.tvl > 100_000)
    .sort((a, b) => b.apy - a.apy)[0];

  if (highYield && highYield.riskLevel !== "low") {
    strategies.push({
      name: "Alpha Hunter",
      description: "Chase the highest yields with proportional risk. Use small allocation.",
      expectedApy: highYield.apy,
      riskLevel: highYield.riskLevel as "medium" | "high",
      steps: [
        `Allocate ≤10% to ${highYield.protocol} ${highYield.token}`,
        `Current APY: ${highYield.apy.toFixed(2)}% on ${formatUsd(highYield.tvl)} TVL`,
        `Monitor closely — set alert for rate drops below ${(highYield.apy * 0.5).toFixed(1)}%`,
      ],
      protocols: [highYield.protocol],
    });
  }

  return strategies;
}

const riskColors = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-red-500/10 text-red-400 border-red-500/20",
};

const strategyIcons: Record<string, string> = {
  "Safe Harbor": "🛡",
  "Diversified Yield": "📊",
  "Yield Arbitrage": "⚡",
  "Alpha Hunter": "🎯",
};

export function StrategyPanel({
  yields,
  borrowRates,
}: {
  yields: YieldOpportunity[];
  borrowRates: BorrowRate[];
}) {
  const strategies = generateStrategies(yields, borrowRates);

  if (strategies.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {strategies.map((s) => (
          <Card
            key={s.name}
            className="bg-card/50 border-border/50 hover:border-border transition-colors"
          >
            <CardHeader className="p-3 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span>{strategyIcons[s.name] || "💡"}</span>
                  {s.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {s.expectedApy.toFixed(2)}%
                  </span>
                  <Badge
                    variant="outline"
                    className={riskColors[s.riskLevel]}
                  >
                    {s.riskLevel}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground mb-2">
                {s.description}
              </p>
              <div className="space-y-1">
                {s.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-muted-foreground mt-px shrink-0">
                      {i + 1}.
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {s.protocols.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
