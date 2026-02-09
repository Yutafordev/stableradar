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
import { YieldOpportunity } from "@/lib/types";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

const tokenColors: Record<string, string> = {
  USDC: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  USDT: "bg-green-500/10 text-green-400 border-green-500/20",
  PYUSD: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  USDS: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  USDe: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  USDY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  DAI: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export function YieldTable({ yields }: { yields: YieldOpportunity[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"apy" | "tvl" | "risk">("apy");
  const [showAll, setShowAll] = useState(false);

  const tokens = [...new Set(yields.map((y) => y.token))].sort();

  let filtered = filter === "all" ? yields : yields.filter((y) => y.token === filter);

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "apy") return b.apy - a.apy;
    if (sortBy === "tvl") return b.tvl - a.tvl;
    return a.riskScore - b.riskScore;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 25);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="text-xs"
        >
          All Tokens
        </Button>
        {tokens.map((token) => (
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
              <TableRow
                key={y.id}
                className={`border-border/30 ${
                  i === 0 ? "bg-emerald-500/5" : ""
                }`}
              >
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
                  {y.apyReward > 0 ? `${y.apyReward.toFixed(2)}%` : "—"}
                </TableCell>
                <TableCell className="text-right font-mono hidden lg:table-cell">
                  {y.apyMean30d ? (
                    <span className={y.apy > y.apyMean30d ? "text-emerald-400" : "text-red-400"}>
                      {y.apyMean30d.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
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
