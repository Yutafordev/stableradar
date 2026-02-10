"use client";

import { useState } from "react";
import { YieldOpportunity } from "@/lib/types";
import { PoolPicker } from "./pool-picker";
import { ComparisonTable } from "./comparison-table";
import { ComparisonRadar } from "./comparison-radar";

const MAX_POOLS = 4;

export function CompareShell({ yields }: { yields: YieldOpportunity[] }) {
  const [selected, setSelected] = useState<YieldOpportunity[]>([]);

  const handleAdd = (pool: YieldOpportunity) => {
    if (selected.length >= MAX_POOLS) return;
    if (selected.find((p) => p.id === pool.id)) return;
    setSelected([...selected, pool]);
  };

  const handleRemove = (poolId: string) => {
    setSelected(selected.filter((p) => p.id !== poolId));
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Compare Pools</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select 2-{MAX_POOLS} pools to compare their yields, risk scores, and protocol details side by side.
        </p>
      </div>

      <div className="space-y-4">
        <PoolPicker
          yields={yields}
          selected={selected}
          onAdd={handleAdd}
          onRemove={handleRemove}
          maxPools={MAX_POOLS}
        />

        {selected.length >= 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
            <ComparisonTable pools={selected} />
            <ComparisonRadar pools={selected} />
          </div>
        )}

        {selected.length === 1 && (
          <div className="rounded-lg border border-border/50 bg-card/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Add at least one more pool to see the comparison
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
