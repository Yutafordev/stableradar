"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YieldOpportunity } from "@/lib/types";

interface ProtocolSummary {
  name: string;
  slug: string;
  poolCount: number;
  totalTvl: number;
  bestApy: number;
  bestPool: string;
  avgApy: number;
  category: string;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

const categoryColors: Record<string, string> = {
  Lending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "DEX/LP": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DEX: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  RWA: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Yield Aggregator": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Perps/Lending": "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export function ProtocolOverview({ yields }: { yields: YieldOpportunity[] }) {
  const protocolMap = new Map<string, ProtocolSummary>();

  for (const y of yields) {
    const existing = protocolMap.get(y.protocol);
    if (existing) {
      existing.poolCount++;
      existing.totalTvl += y.tvl;
      existing.avgApy =
        (existing.avgApy * (existing.poolCount - 1) + y.apy) /
        existing.poolCount;
      if (y.apy > existing.bestApy) {
        existing.bestApy = y.apy;
        existing.bestPool = y.symbol;
      }
    } else {
      const category = getCategoryForProtocol(y.protocolSlug);
      protocolMap.set(y.protocol, {
        name: y.protocol,
        slug: y.protocolSlug,
        poolCount: 1,
        totalTvl: y.tvl,
        bestApy: y.apy,
        bestPool: y.symbol,
        avgApy: y.apy,
        category,
      });
    }
  }

  const protocols = [...protocolMap.values()].sort(
    (a, b) => b.totalTvl - a.totalTvl
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {protocols.map((p) => (
        <Card
          key={p.slug}
          className="bg-card/50 border-border/50 hover:border-border transition-colors"
        >
          <CardHeader className="p-3 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{p.name}</CardTitle>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  categoryColors[p.category] ||
                  "bg-muted text-muted-foreground"
                }`}
              >
                {p.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Best APY
                </p>
                <p className="text-lg font-bold text-emerald-400">
                  {p.bestApy.toFixed(2)}%
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {p.bestPool}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  TVL
                </p>
                <p className="text-lg font-bold">{formatUsd(p.totalTvl)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {p.poolCount} pool{p.poolCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getCategoryForProtocol(slug: string): string {
  const categories: Record<string, string> = {
    "kamino-lend": "Lending",
    "kamino-liquidity": "DEX/LP",
    "marginfi": "Lending",
    "save": "Lending",
    "solend": "Lending",
    "drift-protocol": "Perps/Lending",
    "orca-dex": "DEX/LP",
    "raydium-amm": "DEX/LP",
    "raydium": "DEX/LP",
    "raydium-clmm": "DEX/LP",
    "meteora": "DEX/LP",
    "jupiter": "DEX",
    "ondo-yield-assets": "RWA",
    "lulo": "Yield Aggregator",
    "loopscale": "Lending",
    "francium": "Lending",
    "wasabi": "Lending",
    "unitas": "RWA",
    "carrot-liquidity": "DEX/LP",
    "superstate-uscc": "RWA",
    "project-0": "Lending",
    "credix": "RWA",
    "allbridge-classic": "Bridge",
  };
  return categories[slug] || "Other";
}
