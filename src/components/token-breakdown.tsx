"use client";

import { Card, CardContent } from "@/components/ui/card";
import { YieldOpportunity } from "@/lib/types";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

interface TokenSummary {
  token: string;
  poolCount: number;
  totalTvl: number;
  bestApy: number;
  bestProtocol: string;
  avgApy: number;
}

const tokenGradients: Record<string, string> = {
  USDC: "from-blue-500/20 to-blue-600/5",
  USDT: "from-green-500/20 to-green-600/5",
  PYUSD: "from-purple-500/20 to-purple-600/5",
  USDS: "from-sky-500/20 to-sky-600/5",
  USDe: "from-pink-500/20 to-pink-600/5",
  USDY: "from-orange-500/20 to-orange-600/5",
  DAI: "from-yellow-500/20 to-yellow-600/5",
};

const tokenTextColors: Record<string, string> = {
  USDC: "text-blue-400",
  USDT: "text-green-400",
  PYUSD: "text-purple-400",
  USDS: "text-sky-400",
  USDe: "text-pink-400",
  USDY: "text-orange-400",
  DAI: "text-yellow-400",
};

export function TokenBreakdown({ yields }: { yields: YieldOpportunity[] }) {
  const tokenMap = new Map<string, TokenSummary>();

  for (const y of yields) {
    const existing = tokenMap.get(y.token);
    if (existing) {
      existing.poolCount++;
      existing.totalTvl += y.tvl;
      existing.avgApy =
        (existing.avgApy * (existing.poolCount - 1) + y.apy) /
        existing.poolCount;
      if (y.apy > existing.bestApy) {
        existing.bestApy = y.apy;
        existing.bestProtocol = y.protocol;
      }
    } else {
      tokenMap.set(y.token, {
        token: y.token,
        poolCount: 1,
        totalTvl: y.tvl,
        bestApy: y.apy,
        bestProtocol: y.protocol,
        avgApy: y.apy,
      });
    }
  }

  const tokens = [...tokenMap.values()].sort((a, b) => b.totalTvl - a.totalTvl);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
      {tokens.map((t) => (
        <Card
          key={t.token}
          className={`bg-gradient-to-br ${
            tokenGradients[t.token] || "from-muted/20 to-muted/5"
          } border-border/30 hover:border-border/60 transition-colors`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-bold ${
                  tokenTextColors[t.token] || "text-foreground"
                }`}
              >
                {t.token}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t.poolCount} pools
              </span>
            </div>
            <div className="space-y-1">
              <div>
                <p className="text-[10px] text-muted-foreground">Best APY</p>
                <p className="text-sm font-bold text-emerald-400">
                  {t.bestApy.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">TVL</p>
                <p className="text-sm font-medium">{formatUsd(t.totalTvl)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
