"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/lib/types";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Best APY
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {stats.bestYield ? `${stats.bestYield.apy.toFixed(2)}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {stats.bestYield
              ? `${stats.bestYield.protocol} ${stats.bestYield.token}`
              : ""}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Avg APY
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats.averageApy.toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Across all pools
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Total TVL
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatUsd(stats.totalTvl)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stablecoin pools
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Protocols
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats.protocolCount}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tracked
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Pools
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats.poolCount}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stablecoin
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Alerts
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              stats.alertCount > 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {stats.alertCount}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
