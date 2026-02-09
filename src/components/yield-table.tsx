"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "./risk-badge";
import { YieldOpportunity, RiskFactor } from "@/lib/types";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatVolume(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

const tokenColors: Record<string, string> = {
  // USD-pegged
  USDC: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  USDT: "bg-green-500/10 text-green-400 border-green-500/20",
  PYUSD: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  USDS: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  USDe: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  USDY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  DAI: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  // EUR-pegged
  EURC: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  VEUR: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  // CHF-pegged
  VCHF: "bg-red-500/10 text-red-400 border-red-500/20",
  // GBP-pegged
  TGBP: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  // CAD-pegged
  QCAD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  // JPY-pegged
  GYEN: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

const pegCurrencyLabels: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  CHF: "Swiss Franc",
  GBP: "British Pound",
  CAD: "Canadian Dollar",
  JPY: "Japanese Yen",
};

function RiskFactorBar({ factor, label }: { factor: RiskFactor; label: string }) {
  const pct = factor.maxScore > 0 ? (factor.score / factor.maxScore) * 100 : 0;
  const barColor =
    pct === 0 ? "bg-emerald-500" : pct <= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">
          {factor.score}/{factor.maxScore}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground leading-tight">
        {factor.explanation}
      </p>
    </div>
  );
}

function ExpandedDetails({ y }: { y: YieldOpportunity }) {
  return (
    <div className="px-4 py-4 bg-muted/20 border-t border-border/30 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Risk Breakdown ({y.riskScore}/15)
          </h4>
          {y.riskBreakdown ? (
            <div className="space-y-2.5">
              <RiskFactorBar factor={y.riskBreakdown.tvl} label="TVL Depth" />
              <RiskFactorBar factor={y.riskBreakdown.protocolAge} label="Protocol Age" />
              <RiskFactorBar factor={y.riskBreakdown.audit} label="Audit Status" />
              <RiskFactorBar factor={y.riskBreakdown.apyLevel} label="APY Level" />
              <RiskFactorBar factor={y.riskBreakdown.ilRisk} label="IL Risk" />
              {y.riskBreakdown.utilization.score > 0 && (
                <RiskFactorBar factor={y.riskBreakdown.utilization} label="Utilization" />
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Risk breakdown not available</p>
          )}
        </div>

        {/* Yield Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Yield Details
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Base APY</span>
              <span className="font-mono">{y.apyBase.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Reward APY</span>
              <span className="font-mono">
                {y.apyReward > 0 ? `${y.apyReward.toFixed(2)}%` : "None"}
              </span>
            </div>
            {y.apyReward > 0 && (
              <p className="text-[10px] text-muted-foreground">
                Reward APY comes from token incentives and may decrease over time.
              </p>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">7d Base APY</span>
              <span className="font-mono">
                {y.apyBase7d !== null ? `${y.apyBase7d.toFixed(2)}%` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">30d Average</span>
              <span className="font-mono">
                {y.apyMean30d !== null ? `${y.apyMean30d.toFixed(2)}%` : "—"}
              </span>
            </div>
            {y.sigma !== null && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Volatility (sigma)</span>
                <span className="font-mono">{y.sigma.toFixed(2)}</span>
              </div>
            )}
            {y.mu !== null && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Mean Return (mu)</span>
                <span className="font-mono">{y.mu.toFixed(4)}</span>
              </div>
            )}
            <div className="border-t border-border/30 pt-2 mt-2">
              <p className="text-[10px] text-muted-foreground">
                {y.apyReward > 0
                  ? "Yield = base interest + token rewards. Rewards are typically distributed continuously."
                  : "Yield is organic from lending interest or LP fees. No additional token incentives."}
              </p>
            </div>
          </div>
        </div>

        {/* Pool & Protocol Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pool & Protocol
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Protocol</span>
              <span className="font-medium">{y.protocol}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Category</span>
              <span>{y.protocolCategory}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Audited</span>
              <span className={y.protocolAudited ? "text-emerald-400" : "text-red-400"}>
                {y.protocolAudited ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Protocol Age</span>
              <span>{y.protocolAgeMonths} months</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Exposure</span>
              <span className="capitalize">{y.exposure}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">IL Risk</span>
              <span className={y.ilRisk === "yes" ? "text-amber-400" : "text-emerald-400"}>
                {y.ilRisk === "yes" ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Peg Currency</span>
              <span>{pegCurrencyLabels[y.pegCurrency] || y.pegCurrency}</span>
            </div>
            {(y.volumeUsd1d !== null || y.volumeUsd7d !== null) && (
              <>
                <div className="border-t border-border/30 pt-2 mt-2" />
                {y.volumeUsd1d !== null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="font-mono">{formatVolume(y.volumeUsd1d)}</span>
                  </div>
                )}
                {y.volumeUsd7d !== null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">7d Volume</span>
                    <span className="font-mono">{formatVolume(y.volumeUsd7d)}</span>
                  </div>
                )}
              </>
            )}
            {y.underlyingTokens && y.underlyingTokens.length > 0 && (
              <div className="border-t border-border/30 pt-2 mt-2">
                <span className="text-[10px] text-muted-foreground block mb-1">
                  Underlying Tokens
                </span>
                <div className="flex flex-wrap gap-1">
                  {y.underlyingTokens.map((t, i) => (
                    <code
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground"
                    >
                      {t.slice(0, 8)}...
                    </code>
                  ))}
                </div>
              </div>
            )}
            {y.protocolUrl && (
              <div className="border-t border-border/30 pt-2 mt-2">
                <a
                  href={y.protocolUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Open {y.protocol} &rarr;
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function YieldTable({ yields }: { yields: YieldOpportunity[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [pegFilter, setPegFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"apy" | "tvl" | "risk">("apy");
  const [showAll, setShowAll] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const tokens = [...new Set(yields.map((y) => y.token))].sort();
  const pegCurrencies = [...new Set(yields.map((y) => y.pegCurrency))].sort();

  let filtered = yields;
  if (pegFilter !== "all") {
    filtered = filtered.filter((y) => y.pegCurrency === pegFilter);
  }
  if (filter !== "all") {
    filtered = filtered.filter((y) => y.token === filter);
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "apy") return b.apy - a.apy;
    if (sortBy === "tvl") return b.tvl - a.tvl;
    return a.riskScore - b.riskScore;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 25);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Peg currency filter */}
        {pegCurrencies.length > 1 && (
          <>
            <Button
              variant={pegFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => { setPegFilter("all"); setFilter("all"); }}
              className="text-xs"
            >
              All Currencies
            </Button>
            {pegCurrencies.map((peg) => (
              <Button
                key={peg}
                variant={pegFilter === peg ? "default" : "outline"}
                size="sm"
                onClick={() => { setPegFilter(peg); setFilter("all"); }}
                className="text-xs"
              >
                {peg}
              </Button>
            ))}
            <span className="w-px h-5 bg-border/50 mx-1" />
          </>
        )}

        {/* Token filter */}
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="text-xs"
        >
          All Tokens
        </Button>
        {tokens
          .filter((t) => pegFilter === "all" || (yields.find((y) => y.token === t)?.pegCurrency === pegFilter))
          .map((token) => (
            <Button
              key={token}
              variant={filter === token ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(token)}
              className="text-xs"
            >
              {token}
            </Button>
          ))}
        <div className="ml-auto flex gap-2">
          <Button
            variant={sortBy === "apy" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("apy")}
            className="text-xs"
          >
            Sort: APY
          </Button>
          <Button
            variant={sortBy === "tvl" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("tvl")}
            className="text-xs"
          >
            Sort: TVL
          </Button>
          <Button
            variant={sortBy === "risk" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("risk")}
            className="text-xs"
          >
            Sort: Risk
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-8">
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Protocol
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Token
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                APY
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right hidden sm:table-cell">
                Base APY
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right hidden md:table-cell">
                Reward APY
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right hidden lg:table-cell">
                30d Avg
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                TVL
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                Pool Type
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Risk
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayed.map((y, i) => (
              <>
                <TableRow
                  key={y.id}
                  className={`border-border/30 cursor-pointer transition-colors ${
                    i === 0 ? "bg-emerald-500/5" : ""
                  } ${expandedRow === y.id ? "bg-muted/30" : "hover:bg-muted/10"}`}
                  onClick={() =>
                    setExpandedRow(expandedRow === y.id ? null : y.id)
                  }
                >
                  <TableCell className="w-8 px-2">
                    <svg
                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                        expandedRow === y.id ? "rotate-90" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </TableCell>
                  <TableCell className="font-medium">
                    {y.protocol}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        tokenColors[y.token] ||
                        "bg-muted text-muted-foreground"
                      }
                    >
                      {y.symbol}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-400">
                    {y.apy.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground hidden sm:table-cell">
                    {y.apyBase.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground hidden md:table-cell">
                    {y.apyReward > 0 ? `${y.apyReward.toFixed(2)}%` : "\u2014"}
                  </TableCell>
                  <TableCell className="text-right font-mono hidden lg:table-cell">
                    {y.apyMean30d ? (
                      <span className={y.apy > y.apyMean30d ? "text-emerald-400" : "text-red-400"}>
                        {y.apyMean30d.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">\u2014</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatUsd(y.tvl)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground capitalize">
                      {y.exposure}
                    </span>
                  </TableCell>
                  <TableCell>
                    <RiskBadge level={y.riskLevel} />
                  </TableCell>
                </TableRow>
                {expandedRow === y.id && (
                  <TableRow key={`${y.id}-expanded`} className="border-border/30">
                    <TableCell colSpan={10} className="p-0">
                      <ExpandedDetails y={y} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 25 && !showAll && (
        <div className="mt-3 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(true)}
          >
            Show all {filtered.length} pools
          </Button>
        </div>
      )}
    </div>
  );
}
