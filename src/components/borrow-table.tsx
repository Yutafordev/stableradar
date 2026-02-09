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
import { BorrowRate } from "@/lib/types";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function BorrowTable({ rates }: { rates: BorrowRate[] }) {
  const [filter, setFilter] = useState<string>("all");

  const tokens = [...new Set(rates.map((r) => r.borrowToken))].sort();
  const filtered =
    filter === "all"
      ? rates
      : rates.filter((r) => r.borrowToken === filter);

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
      </div>

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Protocol
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Borrow
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                Borrow APY
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                Supply APY
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right hidden sm:table-cell">
                TVL
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right hidden md:table-cell">
                Max LTV
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right hidden lg:table-cell">
                Spread
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Risk
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, i) => (
              <TableRow
                key={r.id}
                className={`border-border/30 ${
                  i === 0 ? "bg-blue-500/5" : ""
                }`}
              >
                <TableCell className="font-medium">{r.protocol}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {r.borrowToken}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-blue-400">
                  {r.borrowApy.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-400">
                  {r.supplyApy.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right font-mono hidden sm:table-cell">
                  {formatUsd(r.tvl)}
                </TableCell>
                <TableCell className="text-right font-mono hidden md:table-cell">
                  {r.ltv ? `${(r.ltv * 100).toFixed(0)}%` : "—"}
                </TableCell>
                <TableCell className="text-right font-mono hidden lg:table-cell">
                  {(() => {
                    const spread = r.supplyApy - r.borrowApy;
                    return (
                      <span className={spread > 0 ? "text-emerald-400" : "text-red-400"}>
                        {spread > 0 ? "+" : ""}{spread.toFixed(2)}%
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <RiskBadge level={r.riskLevel} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
