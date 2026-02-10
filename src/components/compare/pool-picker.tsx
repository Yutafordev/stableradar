"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { YieldOpportunity } from "@/lib/types";
import { formatUsd } from "@/lib/format";
import { Search, X, Plus } from "lucide-react";

interface PoolPickerProps {
  yields: YieldOpportunity[];
  selected: YieldOpportunity[];
  onAdd: (pool: YieldOpportunity) => void;
  onRemove: (poolId: string) => void;
  maxPools: number;
}

export function PoolPicker({ yields, selected, onAdd, onRemove, maxPools }: PoolPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selectedIds = new Set(selected.map((p) => p.id));

  const filtered = yields
    .filter((y) => !selectedIds.has(y.id))
    .filter((y) => {
      const q = search.toLowerCase();
      return (
        y.protocol.toLowerCase().includes(q) ||
        y.symbol.toLowerCase().includes(q) ||
        y.token.toLowerCase().includes(q)
      );
    })
    .slice(0, 20);

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">
          Pools to Compare ({selected.length}/{maxPools})
        </h3>
      </div>

      {/* Selected chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selected.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-accent/50 text-accent-foreground"
          >
            <span>{p.protocol} {p.token}</span>
            <span className="text-emerald-400 font-mono">{p.apy.toFixed(1)}%</span>
            <button
              onClick={() => onRemove(p.id)}
              className="ml-0.5 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {selected.length < maxPools && (
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add pool
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && selected.length < maxPools && (
        <div className="border border-border/50 rounded-md bg-card/50 overflow-hidden">
          <div className="p-2 border-b border-border/30">
            <div className="relative">
              <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search protocol or token..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-7 text-xs bg-muted/30 border-border/30"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto divide-y divide-border/20">
            {filtered.map((y) => (
              <button
                key={y.id}
                onClick={() => {
                  onAdd(y);
                  setSearch("");
                  if (selected.length + 1 >= maxPools) setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-muted/30 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-medium">{y.protocol}</span>{" "}
                  <span className="text-[10px] text-muted-foreground">{y.token}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400">
                    {y.apy.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatUsd(y.tvl)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
