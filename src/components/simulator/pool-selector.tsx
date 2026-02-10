"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiskBadge } from "@/components/risk-badge";
import { YieldOpportunity } from "@/lib/types";
import { formatUsd } from "@/lib/format";
import { Search, X } from "lucide-react";

const tokenColors: Record<string, string> = {
  USDC: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  USDT: "bg-green-500/10 text-green-400 border-green-500/20",
  PYUSD: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  USDS: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  USDe: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  USDY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  DAI: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  EURC: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  VEUR: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  VCHF: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface PoolSelectorProps {
  yields: YieldOpportunity[];
  selected: YieldOpportunity[];
  onToggle: (pool: YieldOpportunity) => void;
  maxPools: number;
}

export function PoolSelector({ yields, selected, onToggle, maxPools }: PoolSelectorProps) {
  const [search, setSearch] = useState("");

  const selectedIds = new Set(selected.map((p) => p.id));

  const filtered = yields.filter((y) => {
    const q = search.toLowerCase();
    return (
      y.protocol.toLowerCase().includes(q) ||
      y.symbol.toLowerCase().includes(q) ||
      y.token.toLowerCase().includes(q)
    );
  });

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 overflow-hidden">
      <div className="p-3 border-b border-border/30">
        <h3 className="text-sm font-semibold mb-2">
          Select Pools ({selected.length}/{maxPools})
        </h3>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selected.map((p) => (
              <button
                key={p.id}
                onClick={() => onToggle(p)}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-accent/50 text-accent-foreground hover:bg-accent transition-colors"
              >
                {p.protocol} {p.token}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search protocol or token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/30 border-border/30"
          />
        </div>
      </div>

      <ScrollArea className="h-[380px]">
        <div className="divide-y divide-border/20">
          {filtered.slice(0, 50).map((y) => {
            const isSelected = selectedIds.has(y.id);
            const disabled = !isSelected && selected.length >= maxPools;
            return (
              <button
                key={y.id}
                onClick={() => !disabled && onToggle(y)}
                disabled={disabled}
                className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-3 ${
                  isSelected
                    ? "bg-accent/30"
                    : disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-muted/30"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${
                    isSelected
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-border/50"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium truncate">{y.protocol}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1 py-0 ${tokenColors[y.token] || "bg-muted text-muted-foreground"}`}
                    >
                      {y.token}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] font-mono text-emerald-400">
                      {y.apy.toFixed(2)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatUsd(y.tvl)}
                    </span>
                  </div>
                </div>
                <RiskBadge level={y.riskLevel} />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
