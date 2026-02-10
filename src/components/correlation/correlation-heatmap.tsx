"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PoolInfo {
  id: string;
  label: string;
  protocol: string;
  token: string;
  apy: number;
  tvl: number;
}

interface MatrixEntry {
  poolA: string;
  poolB: string;
  similarity: number;
}

function simColor(value: number): string {
  if (value >= 0.9) return "bg-red-500";
  if (value >= 0.8) return "bg-red-500/80";
  if (value >= 0.7) return "bg-orange-500/70";
  if (value >= 0.6) return "bg-yellow-500/60";
  if (value >= 0.5) return "bg-yellow-500/40";
  if (value >= 0.4) return "bg-blue-500/30";
  if (value >= 0.3) return "bg-blue-500/50";
  if (value >= 0.2) return "bg-blue-500/70";
  return "bg-blue-600/80";
}

function shortLabel(label: string): string {
  const parts = label.split(" ");
  if (parts.length >= 2) {
    const proto = parts[0].substring(0, 6);
    const token = parts[parts.length - 1].substring(0, 5);
    return `${proto} ${token}`;
  }
  return label.substring(0, 10);
}

export function CorrelationHeatmap({ pools, matrix }: { pools: PoolInfo[]; matrix: MatrixEntry[] }) {
  const [hovered, setHovered] = useState<{ a: string; b: string; sim: number } | null>(null);

  // Build lookup
  const simLookup = new Map<string, number>();
  for (const entry of matrix) {
    simLookup.set(`${entry.poolA}:${entry.poolB}`, entry.similarity);
    simLookup.set(`${entry.poolB}:${entry.poolA}`, entry.similarity);
  }

  const getSim = (a: string, b: string) => simLookup.get(`${a}:${b}`) ?? 0;

  const size = pools.length;

  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Yield Correlation Matrix — Top {size} Pools by TVL
        </CardTitle>
        {hovered && (
          <p className="text-xs text-muted-foreground mt-1">
            {pools.find((p) => p.id === hovered.a)?.label} vs{" "}
            {pools.find((p) => p.id === hovered.b)?.label}:{" "}
            <span className="font-mono font-medium text-foreground">
              {(hovered.sim * 100).toFixed(0)}% similar
            </span>
          </p>
        )}
      </CardHeader>
      <CardContent className="overflow-x-auto pb-4">
        <div className="inline-block">
          {/* Header row */}
          <div className="flex">
            <div className="w-20 shrink-0" />
            {pools.map((p) => (
              <div
                key={p.id}
                className="w-9 h-20 flex items-end justify-center pb-1"
              >
                <span
                  className="text-[9px] text-muted-foreground whitespace-nowrap origin-bottom-left -rotate-45 block"
                  style={{ width: "70px" }}
                >
                  {shortLabel(p.label)}
                </span>
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {pools.map((rowPool) => (
            <div key={rowPool.id} className="flex items-center">
              <div className="w-20 shrink-0 text-[9px] text-muted-foreground truncate pr-1 text-right">
                {shortLabel(rowPool.label)}
              </div>
              {pools.map((colPool) => {
                const sim = getSim(rowPool.id, colPool.id);
                return (
                  <div
                    key={colPool.id}
                    className={`w-9 h-9 border border-background/50 rounded-sm cursor-pointer transition-transform hover:scale-110 hover:z-10 ${simColor(sim)}`}
                    onMouseEnter={() => setHovered({ a: rowPool.id, b: colPool.id, sim })}
                    onMouseLeave={() => setHovered(null)}
                    title={`${shortLabel(rowPool.label)} vs ${shortLabel(colPool.label)}: ${(sim * 100).toFixed(0)}%`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/20">
          <span className="text-[10px] text-muted-foreground">Uncorrelated</span>
          <div className="flex gap-0.5">
            {[
              "bg-blue-600/80",
              "bg-blue-500/70",
              "bg-blue-500/50",
              "bg-blue-500/30",
              "bg-yellow-500/40",
              "bg-yellow-500/60",
              "bg-orange-500/70",
              "bg-red-500/80",
              "bg-red-500",
            ].map((c, i) => (
              <div key={i} className={`w-6 h-3 rounded-sm ${c}`} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">Correlated</span>
        </div>
      </CardContent>
    </Card>
  );
}
