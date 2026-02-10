"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import { YieldOpportunity } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const CHART_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

interface ResultsSummaryProps {
  pools: YieldOpportunity[];
  amount: number;
  months: number;
  portfolioWeights?: Record<string, number>;
}

export function ResultsSummary({ pools, amount, months, portfolioWeights }: ResultsSummaryProps) {
  if (pools.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {pools.map((pool, i) => {
        const poolAmount = portfolioWeights
          ? amount * ((portfolioWeights[pool.id] || 0) / 100)
          : amount;
        const monthlyRate = pool.apy / 100 / 12;
        const finalValue = poolAmount * Math.pow(1 + monthlyRate, months);
        const returnAmount = finalValue - poolAmount;
        const returnPct = poolAmount > 0 ? (returnAmount / poolAmount) * 100 : 0;

        return (
          <Card
            key={pool.id}
            className="bg-card/30 border-border/50"
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-sm font-medium truncate">
                    {pool.protocol}
                  </span>
                </div>
                <RiskBadge level={pool.riskLevel} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Token</span>
                  <span>{pool.token}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current APY</span>
                  <span className="font-mono text-emerald-400">{pool.apy.toFixed(2)}%</span>
                </div>
                {portfolioWeights && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Allocation</span>
                    <span className="font-mono">{portfolioWeights[pool.id] || 0}%</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Invested</span>
                  <span className="font-mono">{formatNumber(poolAmount)}</span>
                </div>
                <div className="border-t border-border/30 pt-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Projected Value</span>
                    <span className="font-mono font-bold">{formatNumber(finalValue)}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-0.5">
                    <span className="text-muted-foreground">Return</span>
                    <span className="font-mono text-emerald-400">
                      +{formatNumber(returnAmount)} ({returnPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
