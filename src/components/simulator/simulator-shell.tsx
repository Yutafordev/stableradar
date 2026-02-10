"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { YieldOpportunity } from "@/lib/types";
import { PoolSelector } from "./pool-selector";
import { ConfigPanel } from "./config-panel";
import { ProjectionChart } from "./projection-chart";
import { ResultsSummary } from "./results-summary";

const MAX_POOLS = 5;

export function SimulatorShell({ yields }: { yields: YieldOpportunity[] }) {
  const [selectedPools, setSelectedPools] = useState<YieldOpportunity[]>([]);
  const [amount, setAmount] = useState(10_000);
  const [months, setMonths] = useState(12);
  const [portfolioMode, setPortfolioMode] = useState(false);
  const [weights, setWeights] = useState<Record<string, number>>({});

  const handleTogglePool = (pool: YieldOpportunity) => {
    setSelectedPools((prev) => {
      const exists = prev.find((p) => p.id === pool.id);
      if (exists) {
        const next = prev.filter((p) => p.id !== pool.id);
        // Clean up weights
        setWeights((w) => {
          const copy = { ...w };
          delete copy[pool.id];
          return copy;
        });
        return next;
      }
      if (prev.length >= MAX_POOLS) return prev;
      // Set equal weight for new pool
      const next = [...prev, pool];
      const equalWeight = Math.floor(100 / next.length);
      const newWeights: Record<string, number> = {};
      next.forEach((p, i) => {
        newWeights[p.id] = i === next.length - 1 ? 100 - equalWeight * (next.length - 1) : equalWeight;
      });
      setWeights(newWeights);
      return next;
    });
  };

  const handleWeightChange = (poolId: string, value: number) => {
    setWeights((prev) => ({ ...prev, [poolId]: Math.max(0, Math.min(100, value)) }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Yield Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select up to {MAX_POOLS} pools and project your stablecoin returns over time.
          {yields.length > 0 && ` ${yields.length} pools available.`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4">
        {/* Left: Pool Selector */}
        <div className="space-y-3">
          <PoolSelector
            yields={yields}
            selected={selectedPools}
            onToggle={handleTogglePool}
            maxPools={MAX_POOLS}
          />

          {/* Portfolio mode toggle */}
          {selectedPools.length >= 2 && (
            <div className="rounded-lg border border-border/50 bg-card/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Portfolio Mode</span>
                <Button
                  variant={portfolioMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPortfolioMode(!portfolioMode)}
                  className="text-[10px] h-6"
                >
                  {portfolioMode ? "On" : "Off"}
                </Button>
              </div>
              {portfolioMode && (
                <div className="space-y-2">
                  {selectedPools.map((pool) => (
                    <div key={pool.id} className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground truncate flex-1">
                        {pool.protocol} {pool.token}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={weights[pool.id] || 0}
                        onChange={(e) => handleWeightChange(pool.id, Number(e.target.value))}
                        className="w-14 h-6 text-[11px] text-center font-mono bg-muted/30 border border-border/30 rounded"
                      />
                      <span className="text-[10px] text-muted-foreground">%</span>
                    </div>
                  ))}
                  <p className={`text-[10px] ${totalWeight === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                    Total: {totalWeight}% {totalWeight !== 100 && "(should be 100%)"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Config + Chart + Results */}
        <div className="space-y-4">
          <ConfigPanel
            amount={amount}
            months={months}
            onAmountChange={setAmount}
            onMonthsChange={setMonths}
          />
          <ProjectionChart
            pools={selectedPools}
            amount={amount}
            months={months}
            portfolioWeights={portfolioMode ? weights : undefined}
          />
          <ResultsSummary
            pools={selectedPools}
            amount={amount}
            months={months}
            portfolioWeights={portfolioMode ? weights : undefined}
          />
        </div>
      </div>
    </div>
  );
}
