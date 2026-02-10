"use client";

import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import { YieldOpportunity } from "@/lib/types";
import { formatUsd } from "@/lib/format";

interface ComparisonTableProps {
  pools: YieldOpportunity[];
}

interface MetricRow {
  label: string;
  getValue: (p: YieldOpportunity) => string | number;
  getNumeric?: (p: YieldOpportunity) => number;
  higherIsBetter?: boolean;
  format?: "pct" | "usd" | "text" | "risk" | "bool" | "months";
}

const metrics: MetricRow[] = [
  { label: "APY", getValue: (p) => `${p.apy.toFixed(2)}%`, getNumeric: (p) => p.apy, higherIsBetter: true },
  { label: "Base APY", getValue: (p) => `${p.apyBase.toFixed(2)}%`, getNumeric: (p) => p.apyBase, higherIsBetter: true },
  { label: "Reward APY", getValue: (p) => p.apyReward > 0 ? `${p.apyReward.toFixed(2)}%` : "\u2014" },
  { label: "30d Average", getValue: (p) => p.apyMean30d ? `${p.apyMean30d.toFixed(2)}%` : "\u2014" },
  { label: "TVL", getValue: (p) => formatUsd(p.tvl), getNumeric: (p) => p.tvl, higherIsBetter: true },
  { label: "Risk Score", getValue: (p) => `${p.riskScore}/15`, getNumeric: (p) => p.riskScore, higherIsBetter: false },
  { label: "Risk Level", getValue: (p) => p.riskLevel, format: "risk" },
  { label: "Category", getValue: (p) => p.protocolCategory },
  { label: "Audited", getValue: (p) => p.protocolAudited ? "Yes" : "No", format: "bool" },
  { label: "Protocol Age", getValue: (p) => `${p.protocolAgeMonths}mo`, getNumeric: (p) => p.protocolAgeMonths, higherIsBetter: true },
  { label: "Exposure", getValue: (p) => p.exposure },
  { label: "IL Risk", getValue: (p) => p.ilRisk === "yes" ? "Yes" : "No", format: "bool" },
  { label: "Peg", getValue: (p) => p.pegCurrency },
];

export function ComparisonTable({ pools }: ComparisonTableProps) {
  if (pools.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-card/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Select at least 2 pools to compare them side by side
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground p-3 w-32">
                Metric
              </th>
              {pools.map((p) => (
                <th key={p.id} className="text-center p-3 min-w-[140px]">
                  <div className="text-xs font-semibold">{p.protocol}</div>
                  <div className="text-[10px] text-muted-foreground">{p.token}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              // Find best value
              let bestIdx = -1;
              if (metric.getNumeric && pools.length >= 2) {
                const values = pools.map((p) => metric.getNumeric!(p));
                if (metric.higherIsBetter) {
                  bestIdx = values.indexOf(Math.max(...values));
                } else {
                  bestIdx = values.indexOf(Math.min(...values));
                }
              }

              return (
                <tr key={metric.label} className="border-b border-border/20">
                  <td className="text-xs text-muted-foreground p-3 font-medium">
                    {metric.label}
                  </td>
                  {pools.map((p, i) => {
                    const value = metric.getValue(p);
                    const isBest = i === bestIdx;
                    return (
                      <td key={p.id} className="text-center p-3">
                        {metric.format === "risk" ? (
                          <div className="flex justify-center">
                            <RiskBadge level={p.riskLevel} />
                          </div>
                        ) : metric.format === "bool" ? (
                          <span className={`text-xs ${value === "Yes" ? "text-emerald-400" : "text-red-400"}`}>
                            {value}
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-mono ${
                              isBest ? "text-emerald-400 font-bold" : ""
                            }`}
                          >
                            {value}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
