"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import { formatNumber } from "@/lib/format";
import { YieldOpportunity } from "@/lib/types";

const POOL_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

interface PoolResult {
  pool: YieldOpportunity;
  finalAmount: number;
  totalGainUsd: number;
  totalGainPct: number;
  effectiveApy: number;
  bestDay: { date: string; gain: number };
  worstDay: { date: string; gain: number };
}

interface BacktestResultsProps {
  results: PoolResult[];
  initialAmount: number;
}

function formatDate(dateStr: string): string {
  if (dateStr === "-") return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function BacktestResults({ results, initialAmount }: BacktestResultsProps) {
  if (results.length === 0) return null;

  // Determine the winner (highest final amount)
  const sorted = [...results].sort((a, b) => b.finalAmount - a.finalAmount);
  const winnerId = sorted[0].pool.id;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Backtest Results</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((r, idx) => {
          const isWinner = r.pool.id === winnerId && results.length > 1;
          const gainPositive = r.totalGainUsd >= 0;

          return (
            <Card
              key={r.pool.id}
              className={`border-border/50 bg-card/30 relative overflow-hidden ${
                isWinner ? "ring-1 ring-emerald-500/40" : ""
              }`}
            >
              {/* Color accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: POOL_COLORS[idx] }}
              />

              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: POOL_COLORS[idx] }}
                    />
                    {r.pool.protocol}
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    {isWinner && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"
                      >
                        Best
                      </Badge>
                    )}
                    <RiskBadge level={r.pool.riskLevel} />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {r.pool.symbol} -- TVL {formatNumber(r.pool.tvl)}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Final Amount */}
                <div className="rounded-md bg-muted/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Final Amount
                  </p>
                  <p className="text-lg font-bold font-mono">
                    {formatNumber(r.finalAmount)}
                  </p>
                </div>

                {/* Gain */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                      Gain ($)
                    </p>
                    <p
                      className={`text-sm font-mono font-semibold ${
                        gainPositive ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {gainPositive ? "+" : ""}
                      {formatNumber(r.totalGainUsd)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                      Gain (%)
                    </p>
                    <p
                      className={`text-sm font-mono font-semibold ${
                        gainPositive ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {gainPositive ? "+" : ""}
                      {r.totalGainPct.toFixed(3)}%
                    </p>
                  </div>
                </div>

                {/* Effective APY */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Effective Realized APY
                  </p>
                  <p className="text-sm font-mono font-semibold text-blue-400">
                    {r.effectiveApy.toFixed(2)}%
                  </p>
                </div>

                {/* Best / Worst Day */}
                <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                      Best Day
                    </p>
                    <p className="text-[11px] font-mono text-emerald-400">
                      +{formatNumber(r.bestDay.gain)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(r.bestDay.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                      Worst Day
                    </p>
                    <p className="text-[11px] font-mono text-amber-400">
                      {r.worstDay.gain >= 0 ? "+" : ""}
                      {formatNumber(r.worstDay.gain)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(r.worstDay.date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison summary for multiple pools */}
      {results.length > 1 && (
        <Card className="border-border/50 bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">Pool</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Final</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Gain</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Eff. APY</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, idx) => (
                    <tr
                      key={r.pool.id}
                      className="border-b border-border/20 last:border-b-0"
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                POOL_COLORS[results.findIndex((x) => x.pool.id === r.pool.id)],
                            }}
                          />
                          <span className="font-medium">
                            {r.pool.protocol} {r.pool.token}
                          </span>
                          {idx === 0 && (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1 py-0"
                            >
                              #1
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        {formatNumber(r.finalAmount)}
                      </td>
                      <td
                        className={`py-2 px-2 text-right font-mono ${
                          r.totalGainUsd >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {r.totalGainUsd >= 0 ? "+" : ""}
                        {formatNumber(r.totalGainUsd)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-blue-400">
                        {r.effectiveApy.toFixed(2)}%
                      </td>
                      <td className="py-2 px-2 text-right">
                        <RiskBadge level={r.pool.riskLevel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Opportunity cost note */}
            {sorted.length >= 2 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground">
                  Choosing{" "}
                  <span className="font-semibold text-foreground">
                    {sorted[0].pool.protocol} {sorted[0].pool.token}
                  </span>{" "}
                  over{" "}
                  <span className="font-semibold text-foreground">
                    {sorted[sorted.length - 1].pool.protocol}{" "}
                    {sorted[sorted.length - 1].pool.token}
                  </span>{" "}
                  would have earned an extra{" "}
                  <span className="font-mono font-semibold text-emerald-400">
                    {formatNumber(sorted[0].totalGainUsd - sorted[sorted.length - 1].totalGainUsd)}
                  </span>{" "}
                  over the 30-day period.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground/60 text-center">
        Past performance does not guarantee future results. This backtest uses historical APY data
        and assumes daily compounding with no withdrawal or deposit fees. Not financial advice.
      </p>
    </div>
  );
}
