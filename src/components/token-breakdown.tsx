"use client";

import { Card, CardContent } from "@/components/ui/card";
import { YieldOpportunity, PegCurrency } from "@/lib/types";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

interface TokenSummary {
  token: string;
  poolCount: number;
  totalTvl: number;
  bestApy: number;
  bestProtocol: string;
  avgApy: number;
}

const tokenGradients: Record<string, string> = {
  // USD-pegged
  USDC: "from-blue-500/20 to-blue-600/5",
  USDT: "from-green-500/20 to-green-600/5",
  PYUSD: "from-purple-500/20 to-purple-600/5",
  USDS: "from-sky-500/20 to-sky-600/5",
  USDe: "from-pink-500/20 to-pink-600/5",
  USDY: "from-orange-500/20 to-orange-600/5",
  DAI: "from-yellow-500/20 to-yellow-600/5",
  // EUR-pegged
  EURC: "from-indigo-500/20 to-indigo-600/5",
  VEUR: "from-violet-500/20 to-violet-600/5",
  // CHF-pegged
  VCHF: "from-red-500/20 to-red-600/5",
  // GBP-pegged
  TGBP: "from-rose-500/20 to-rose-600/5",
  // CAD-pegged
  QCAD: "from-amber-500/20 to-amber-600/5",
  // JPY-pegged
  GYEN: "from-teal-500/20 to-teal-600/5",
};

const tokenTextColors: Record<string, string> = {
  // USD-pegged
  USDC: "text-blue-400",
  USDT: "text-green-400",
  PYUSD: "text-purple-400",
  USDS: "text-sky-400",
  USDe: "text-pink-400",
  USDY: "text-orange-400",
  DAI: "text-yellow-400",
  // EUR-pegged
  EURC: "text-indigo-400",
  VEUR: "text-violet-400",
  // CHF-pegged
  VCHF: "text-red-400",
  // GBP-pegged
  TGBP: "text-rose-400",
  // CAD-pegged
  QCAD: "text-amber-400",
  // JPY-pegged
  GYEN: "text-teal-400",
};

const pegCurrencyLabels: Record<string, string> = {
  USD: "USD-Pegged",
  EUR: "EUR-Pegged",
  CHF: "CHF-Pegged",
  GBP: "GBP-Pegged",
  CAD: "CAD-Pegged",
  JPY: "JPY-Pegged",
};

export function TokenBreakdown({ yields }: { yields: YieldOpportunity[] }) {
  const tokenMap = new Map<string, TokenSummary & { pegCurrency: PegCurrency }>();

  for (const y of yields) {
    const existing = tokenMap.get(y.token);
    if (existing) {
      existing.poolCount++;
      existing.totalTvl += y.tvl;
      existing.avgApy =
        (existing.avgApy * (existing.poolCount - 1) + y.apy) /
        existing.poolCount;
      if (y.apy > existing.bestApy) {
        existing.bestApy = y.apy;
        existing.bestProtocol = y.protocol;
      }
    } else {
      tokenMap.set(y.token, {
        token: y.token,
        poolCount: 1,
        totalTvl: y.tvl,
        bestApy: y.apy,
        bestProtocol: y.protocol,
        avgApy: y.apy,
        pegCurrency: y.pegCurrency,
      });
    }
  }

  const tokens = [...tokenMap.values()].sort((a, b) => b.totalTvl - a.totalTvl);
  const pegGroups = new Map<string, typeof tokens>();
  for (const t of tokens) {
    const group = pegGroups.get(t.pegCurrency) || [];
    group.push(t);
    pegGroups.set(t.pegCurrency, group);
  }

  const hasMultiplePegs = pegGroups.size > 1;
  const sortedPegs = [...pegGroups.entries()].sort((a, b) => {
    const tvlA = a[1].reduce((s, t) => s + t.totalTvl, 0);
    const tvlB = b[1].reduce((s, t) => s + t.totalTvl, 0);
    return tvlB - tvlA;
  });

  return (
    <div className="space-y-3">
      {sortedPegs.map(([peg, pegTokens]) => (
        <div key={peg}>
          {hasMultiplePegs && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">
              {pegCurrencyLabels[peg] || peg}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {pegTokens.map((t) => (
              <Card
                key={t.token}
                className={`bg-gradient-to-br ${
                  tokenGradients[t.token] || "from-muted/20 to-muted/5"
                } border-border/30 hover:border-border/60 transition-colors`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-bold ${
                        tokenTextColors[t.token] || "text-foreground"
                      }`}
                    >
                      {t.token}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t.poolCount} pools
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Best APY</p>
                      <p className="text-sm font-bold text-emerald-400">
                        {t.bestApy.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">TVL</p>
                      <p className="text-sm font-medium">{formatUsd(t.totalTvl)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
