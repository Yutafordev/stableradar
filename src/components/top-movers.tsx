"use client";

import { Badge } from "@/components/ui/badge";
import { YieldOpportunity } from "@/lib/types";

interface Mover {
  pool: YieldOpportunity;
  changeAbs: number;
  changePct: number;
}

const tokenColors: Record<string, string> = {
  USDC: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  USDT: "bg-green-500/10 text-green-400 border-green-500/20",
  PYUSD: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  USDS: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  USDe: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  USDY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  DAI: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  EURC: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export function TopMovers({ yields }: { yields: YieldOpportunity[] }) {
  const movers: Mover[] = yields
    .filter((y) => y.apyMean30d !== null && y.tvl > 500_000)
    .map((y) => {
      const changeAbs = y.apy - y.apyMean30d!;
      const changePct = (changeAbs / y.apyMean30d!) * 100;
      return { pool: y, changeAbs, changePct };
    })
    .filter((m) => isFinite(m.changePct) && Math.abs(m.changePct) > 5)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 8);

  if (movers.length === 0) return null;

  return (
    <div className="mb-4">
      <h2 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
        Top Movers (vs 30d avg)
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {movers.map((m) => {
          const isUp = m.changePct > 0;
          return (
            <div
              key={m.pool.id}
              className={`flex-none w-[200px] rounded-lg border p-3 transition-colors ${
                isUp
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium truncate">
                  {m.pool.protocol}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${
                    tokenColors[m.pool.token] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {m.pool.token}
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold font-mono">
                  {m.pool.apy.toFixed(2)}%
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${
                    isUp ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isUp ? "+" : ""}
                  {m.changePct.toFixed(0)}%
                </span>
              </div>

              <div className="flex items-center gap-1 mt-1">
                <svg
                  className={`w-3 h-3 ${isUp ? "text-emerald-400" : "text-red-400 rotate-180"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                <span className="text-[10px] text-muted-foreground">
                  from {m.pool.apyMean30d!.toFixed(2)}%
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {isUp ? "+" : ""}
                  {m.changeAbs.toFixed(2)}pp
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
