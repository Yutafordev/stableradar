"use client";

import { useState } from "react";
import { PositionInput, PositionEntry } from "./position-input";
import { OptimizationResults } from "./optimization-results";
import { RebalanceResult } from "@/lib/types";

export function RebalanceShell() {
  const [result, setResult] = useState<RebalanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (positions: PositionEntry[], riskTolerance: string, optimizeFor: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positions: positions.map((p) => ({
            protocol: p.protocol,
            token: p.token,
            amount: p.amount,
          })),
          riskTolerance,
          optimizeFor,
        }),
      });

      if (!res.ok) throw new Error("Failed to optimize");
      const data = await res.json();
      setResult(data.result);
    } catch {
      setError("Failed to compute optimization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Your Positions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your current stablecoin positions to get optimization recommendations.
        </p>
        <PositionInput onSubmit={handleSubmit} loading={loading} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Optimization Results</h2>
        <p className="text-sm text-muted-foreground mb-4">
          AI-powered recommendations to improve your yield, reduce risk, or optimize risk-adjusted returns.
        </p>
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
        {result && <OptimizationResults result={result} />}
        {!result && !error && !loading && (
          <div className="rounded-lg border border-border/30 bg-muted/10 p-12 text-center text-muted-foreground text-sm">
            Enter your positions and click &quot;Optimize Portfolio&quot; to see recommendations.
          </div>
        )}
        {loading && (
          <div className="rounded-lg border border-border/30 bg-muted/10 p-12 text-center text-muted-foreground text-sm animate-pulse">
            Analyzing positions across all Solana pools...
          </div>
        )}
      </div>
    </div>
  );
}
