"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RebalanceResult } from "@/lib/types";
import { ArrowRight, TrendingUp, Shield, ArrowUpRight } from "lucide-react";

function MetricCard({ label, current, optimized, unit, better }: { label: string; current: number; optimized: number; unit: string; better: "higher" | "lower" }) {
  const improved = better === "higher" ? optimized > current : optimized < current;
  return (
    <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground line-through">{current.toFixed(2)}{unit}</span>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <span className={`text-lg font-bold ${improved ? "text-emerald-400" : "text-foreground"}`}>
          {optimized.toFixed(2)}{unit}
        </span>
      </div>
    </div>
  );
}

export function OptimizationResults({ result }: { result: RebalanceResult }) {
  return (
    <div className="space-y-4">
      {/* Improvement banner */}
      {result.improvement.apyGain > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-emerald-400">
                +{result.improvement.apyGain.toFixed(2)}% APY improvement
              </p>
              <p className="text-xs text-muted-foreground">
                {result.improvement.apyGainPct.toFixed(1)}% relative improvement | Est. extra annual yield: ${((result.currentMetrics.totalValue * result.improvement.apyGain) / 100).toFixed(0)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics comparison */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Weighted APY"
          current={result.currentMetrics.weightedApy}
          optimized={result.optimizedMetrics.weightedApy}
          unit="%"
          better="higher"
        />
        <MetricCard
          label="Avg Risk Score"
          current={result.currentMetrics.avgRiskScore}
          optimized={result.optimizedMetrics.avgRiskScore}
          unit=""
          better="lower"
        />
      </div>

      {/* Moves */}
      {result.moves.length > 0 ? (
        <Card className="border-border/50 bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Recommended Moves ({result.moves.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {result.moves.map((move, i) => (
              <div key={i} className="rounded-lg border border-border/30 p-3 bg-muted/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-muted/30 px-2 py-0.5 rounded">#{i + 1}</span>
                  <span className="text-sm font-medium">{move.from.protocol}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-emerald-400">{move.to.protocol}</span>
                  {move.apyGain > 0 && (
                    <span className="ml-auto text-xs font-medium text-emerald-400 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      +{move.apyGain.toFixed(2)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Move ${move.from.amount.toLocaleString()} {move.from.token}: {move.reason}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                    {move.to.token}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    {move.to.apy.toFixed(2)}% APY
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    move.to.riskLevel === "low" ? "bg-emerald-500/10 text-emerald-400" :
                    move.to.riskLevel === "medium" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>
                    <Shield className="w-2.5 h-2.5 inline mr-0.5" />{move.to.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-6 text-center text-muted-foreground">
            Your current allocation is already optimal! No moves recommended.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
