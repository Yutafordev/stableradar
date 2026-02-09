"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YieldOpportunity } from "@/lib/types";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

const barColors: Record<string, string> = {
  USDC: "bg-blue-500",
  USDT: "bg-green-500",
  PYUSD: "bg-purple-500",
  USDS: "bg-sky-500",
  USDe: "bg-pink-500",
  USDY: "bg-orange-500",
  DAI: "bg-yellow-500",
};

const barBgColors: Record<string, string> = {
  USDC: "bg-blue-500/10",
  USDT: "bg-green-500/10",
  PYUSD: "bg-purple-500/10",
  USDS: "bg-sky-500/10",
  USDe: "bg-pink-500/10",
  USDY: "bg-orange-500/10",
  DAI: "bg-yellow-500/10",
};

interface TopYield {
  protocol: string;
  token: string;
  apy: number;
  tvl: number;
  riskLevel: string;
  symbol: string;
}

export function YieldChart({ yields }: { yields: YieldOpportunity[] }) {
  // Get top 12 yields sorted by APY
  const topYields: TopYield[] = yields
    .slice(0, 12)
    .map((y) => ({
      protocol: y.protocol,
      token: y.token,
      apy: y.apy,
      tvl: y.tvl,
      riskLevel: y.riskLevel,
      symbol: y.symbol,
    }));

  const maxApy = Math.max(...topYields.map((y) => y.apy), 1);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">
          Top Yields by APY
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {topYields.map((y, i) => {
            const barWidth = Math.max((y.apy / maxApy) * 100, 2);
            const barColor = barColors[y.token] || "bg-muted-foreground";
            const bgColor = barBgColors[y.token] || "bg-muted/10";

            return (
              <div key={`${y.protocol}-${y.symbol}-${i}`} className="group">
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground w-4 text-right shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-medium truncate">
                      {y.protocol}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {y.token}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-muted-foreground">
                      {formatUsd(y.tvl)}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 w-16 text-right">
                      {y.apy.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className={`h-2 rounded-full ${bgColor} overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskVsYieldMap({ yields }: { yields: YieldOpportunity[] }) {
  // Group by risk level and compute stats
  const riskGroups = {
    low: yields.filter((y) => y.riskLevel === "low"),
    medium: yields.filter((y) => y.riskLevel === "medium"),
    high: yields.filter((y) => y.riskLevel === "high"),
  };

  const riskStats = Object.entries(riskGroups).map(([level, pools]) => {
    const avgApy = pools.length > 0
      ? pools.reduce((sum, y) => sum + y.apy, 0) / pools.length
      : 0;
    const totalTvl = pools.reduce((sum, y) => sum + y.tvl, 0);
    const bestPool = pools.length > 0
      ? pools.reduce((best, y) => (y.apy > best.apy ? y : best))
      : null;
    return { level, count: pools.length, avgApy, totalTvl, bestPool };
  });

  const riskColors = {
    low: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", bar: "bg-emerald-500" },
    medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", bar: "bg-amber-500" },
    high: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", bar: "bg-red-500" },
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">
          Risk vs. Yield Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-3">
          {riskStats.map((rs) => {
            const colors = riskColors[rs.level as keyof typeof riskColors];
            return (
              <div
                key={rs.level}
                className={`rounded-lg ${colors.bg} border ${colors.border} p-3`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase ${colors.text}`}>
                    {rs.level} Risk
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {rs.count} pools
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Avg APY</p>
                    <p className="text-lg font-bold font-mono">
                      {rs.avgApy.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Total TVL</p>
                    <p className="text-sm font-medium">{formatUsd(rs.totalTvl)}</p>
                  </div>
                  {rs.bestPool && (
                    <div>
                      <p className="text-[10px] text-muted-foreground">Top Pool</p>
                      <p className="text-[11px] truncate">
                        {rs.bestPool.protocol} {rs.bestPool.token}
                      </p>
                      <p className={`text-xs font-bold ${colors.text}`}>
                        {rs.bestPool.apy.toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
