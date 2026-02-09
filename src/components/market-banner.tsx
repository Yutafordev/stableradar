"use client";

import { YieldOpportunity, RiskAlert } from "@/lib/types";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getMarketCondition(avgApy: number, alertCount: number, highRiskCount: number): {
  label: string;
  color: string;
  description: string;
} {
  if (avgApy > 8 && highRiskCount > 10) {
    return {
      label: "Elevated Risk",
      color: "text-amber-400",
      description: "High yields available but risk levels are elevated. Exercise caution.",
    };
  }
  if (avgApy > 5) {
    return {
      label: "Strong Yields",
      color: "text-emerald-400",
      description: "Above-average yields across protocols. Good opportunities available.",
    };
  }
  if (avgApy < 2) {
    return {
      label: "Low Yield",
      color: "text-blue-400",
      description: "Yields compressed across the market. Focus on risk-minimized positions.",
    };
  }
  return {
    label: "Normal Market",
    color: "text-foreground",
    description: "Yields at typical levels. Standard risk-reward available.",
  };
}

export function MarketBanner({
  yields,
  alerts,
}: {
  yields: YieldOpportunity[];
  alerts: RiskAlert[];
}) {
  const avgApy = yields.length > 0
    ? yields.reduce((sum, y) => sum + y.apy, 0) / yields.length
    : 0;
  const totalTvl = yields.reduce((sum, y) => sum + y.tvl, 0);
  const highRiskCount = yields.filter((y) => y.riskLevel === "high").length;
  const highAlertCount = alerts.filter((a) => a.severity === "high").length;
  const condition = getMarketCondition(avgApy, alerts.length, highRiskCount);

  const bestSafe = yields
    .filter((y) => y.riskLevel === "low" && y.tvl > 1_000_000)
    .sort((a, b) => b.apy - a.apy)[0];

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-3 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${condition.color}`}>
              {condition.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {condition.description}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">TVL:</span>
            <span className="font-mono font-medium">{formatUsd(totalTvl)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Avg:</span>
            <span className="font-mono font-medium">{avgApy.toFixed(2)}%</span>
          </div>
          {bestSafe && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Best Safe:</span>
              <span className="font-mono font-medium text-emerald-400">
                {bestSafe.apy.toFixed(2)}%
              </span>
              <span className="text-muted-foreground">({bestSafe.protocol})</span>
            </div>
          )}
          {highAlertCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-red-400 font-medium">
                {highAlertCount} high alerts
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
