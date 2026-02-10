import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import { WalletYieldMatch } from "@/lib/types";
import { formatUsd, formatNumber } from "@/lib/format";

const tokenColors: Record<string, string> = {
  USDC: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  USDT: "bg-green-500/10 text-green-400 border-green-500/20",
  PYUSD: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  USDS: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  DAI: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  EURC: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

interface YieldSuggestionsProps {
  yieldMatches: WalletYieldMatch[];
}

export function YieldSuggestions({ yieldMatches }: YieldSuggestionsProps) {
  const withPools = yieldMatches.filter((m) => m.topPools.length > 0);

  if (withPools.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-card/30 px-6 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          No yield opportunities found for your stablecoins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Yield Opportunities
      </h3>

      {withPools.map((m) => (
        <div
          key={m.position.account}
          className="rounded-lg border border-border/50 bg-card/30 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  tokenColors[m.position.symbol] ||
                  "bg-muted text-muted-foreground"
                }
              >
                {m.position.symbol}
              </Badge>
              <span className="text-sm font-medium">
                {formatNumber(m.position.balance)} held
              </span>
            </div>
            {m.potentialAnnualYield > 0 && (
              <span className="text-xs text-emerald-400">
                Up to {formatNumber(m.potentialAnnualYield)}/year
              </span>
            )}
          </div>

          {/* Pool list */}
          <div className="divide-y divide-border/30">
            {m.topPools.map((pool, i) => {
              const annualYield =
                (m.position.usdValue * pool.apy) / 100;
              return (
                <div
                  key={pool.id}
                  className={`px-4 py-3 flex items-center justify-between gap-4 ${
                    i === 0 ? "bg-emerald-500/5" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {pool.protocol}
                      {i === 0 && (
                        <span className="ml-2 text-[10px] text-emerald-400 uppercase font-semibold">
                          Best
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pool.symbol} &middot; TVL {formatUsd(pool.tvl)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <RiskBadge level={pool.riskLevel} />
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-emerald-400">
                        {pool.apy.toFixed(2)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        ~{formatNumber(annualYield)}/yr
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
