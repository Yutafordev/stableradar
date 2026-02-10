"use client";

import { useState, useMemo } from "react";
import { StablecoinPegData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tokenColors } from "@/lib/token-colors";
import { formatUsd, formatNumber } from "@/lib/format";

// ── Helpers ──

function deviationColor(pct: number): string {
  const abs = Math.abs(pct);
  if (abs < 0.1) return "text-emerald-400";
  if (abs < 0.5) return "text-amber-400";
  return "text-red-400";
}

function deviationBg(pct: number): string {
  const abs = Math.abs(pct);
  if (abs < 0.1) return "bg-emerald-500/10 border-emerald-500/20";
  if (abs < 0.5) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

function stabilityBadgeStyle(level: StablecoinPegData["stabilityLevel"]): string {
  switch (level) {
    case "excellent":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "good":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "fair":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "poor":
      return "bg-red-500/10 text-red-400 border-red-500/20";
  }
}

function mechanismBadgeStyle(mechanism: string): string {
  if (mechanism.includes("fiat")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (mechanism.includes("crypto")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (mechanism.includes("algo")) return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

function supplyChangeDisplay(value: number): string {
  if (value === 0) return "0%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function supplyChangeColor(value: number): string {
  if (Math.abs(value) < 0.5) return "text-muted-foreground";
  return value > 0 ? "text-emerald-400" : "text-red-400";
}

type SortKey =
  | "symbol"
  | "price"
  | "deviationPct"
  | "solanaCirculating"
  | "stabilityScore"
  | "supplyChange24h"
  | "supplyChange7d";

// ── Component ──

export function DepegDashboard({ data }: { data: StablecoinPegData[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("solanaCirculating");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      let va: number | string = a[sortKey];
      let vb: number | string = b[sortKey];
      if (sortKey === "deviationPct") {
        va = Math.abs(va as number);
        vb = Math.abs(vb as number);
      }
      if (typeof va === "string" && typeof vb === "string") {
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortAsc
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });
    return copy;
  }, [data, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const depegAlerts = data.filter((d) => Math.abs(d.deviationPct) > 0.5);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Unable to load stablecoin peg data. Please try again later.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Depeg Monitor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time peg tracking for {data.length} stablecoins on Solana.
          Monitor price deviations, supply flows, and stability scores.
        </p>
      </div>

      {/* Depeg Alerts */}
      {depegAlerts.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <h2 className="text-sm font-semibold text-red-400 mb-2 uppercase tracking-wider">
            Depeg Alerts
          </h2>
          <div className="space-y-1.5">
            {depegAlerts.map((alert) => (
              <div key={alert.symbol} className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider bg-red-500/20 text-red-400">
                  DEPEG
                </span>
                <span className="font-medium">{alert.symbol}</span>
                <span className="text-muted-foreground">
                  trading at {formatNumber(alert.price)} ({alert.deviationPct > 0 ? "+" : ""}
                  {alert.deviationPct.toFixed(4)}% from peg)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {depegAlerts.length === 0 && (
        <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-emerald-400 font-medium text-sm">All pegs stable</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            No stablecoins are deviating more than 0.5% from their peg value.
          </p>
        </div>
      )}

      {/* Stablecoin Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
        {data.map((coin) => {
          const tokenStyle =
            tokenColors[coin.symbol] ??
            "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

          return (
            <Card
              key={coin.symbol}
              className={`py-4 border ${deviationBg(coin.deviationPct)}`}
            >
              <CardHeader className="pb-0 pt-0 gap-1.5 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <Badge
                      variant="outline"
                      className={`${tokenStyle} text-sm font-semibold mr-2`}
                    >
                      {coin.symbol}
                    </Badge>
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={mechanismBadgeStyle(coin.pegMechanism)}
                  >
                    {coin.pegMechanism}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {coin.name}
                </p>
              </CardHeader>

              <CardContent className="pt-0 px-4 space-y-2">
                {/* Price + Deviation */}
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold tabular-nums">
                    {formatNumber(coin.price)}
                  </span>
                  <span
                    className={`text-sm font-medium tabular-nums ${deviationColor(coin.deviationPct)}`}
                  >
                    {coin.deviationPct > 0 ? "+" : ""}
                    {coin.deviationPct.toFixed(4)}%
                  </span>
                </div>

                {/* Peg type + Stability */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Peg: {coin.pegType}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${stabilityBadgeStyle(coin.stabilityLevel)}`}
                  >
                    {coin.stabilityScore}/100
                  </Badge>
                </div>

                {/* Solana Supply */}
                <div className="border-t border-border/30 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Solana Supply</span>
                    <span className="font-medium tabular-nums">
                      {formatUsd(coin.solanaCirculating)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px]">
                    <span className={supplyChangeColor(coin.supplyChange24h)}>
                      24h: {supplyChangeDisplay(coin.supplyChange24h)}
                    </span>
                    <span className={supplyChangeColor(coin.supplyChange7d)}>
                      7d: {supplyChangeDisplay(coin.supplyChange7d)}
                    </span>
                    <span className={supplyChangeColor(coin.supplyChange30d)}>
                      30d: {supplyChangeDisplay(coin.supplyChange30d)}
                    </span>
                  </div>
                </div>

                {/* Risk Factors */}
                {coin.riskFactors.length > 0 && (
                  <div className="border-t border-border/30 pt-2">
                    {coin.riskFactors.map((factor, i) => (
                      <p
                        key={i}
                        className="text-[11px] text-amber-400/80 leading-tight"
                      >
                        {factor}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Table */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-0 pt-0">
          <CardTitle className="text-lg">Detailed Comparison</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton
                      label="Token"
                      active={sortKey === "symbol"}
                      asc={sortAsc}
                      onClick={() => handleSort("symbol")}
                    />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton
                      label="Price"
                      active={sortKey === "price"}
                      asc={sortAsc}
                      onClick={() => handleSort("price")}
                    />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton
                      label="Deviation"
                      active={sortKey === "deviationPct"}
                      asc={sortAsc}
                      onClick={() => handleSort("deviationPct")}
                    />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton
                      label="Solana Supply"
                      active={sortKey === "solanaCirculating"}
                      asc={sortAsc}
                      onClick={() => handleSort("solanaCirculating")}
                    />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton
                      label="24h"
                      active={sortKey === "supplyChange24h"}
                      asc={sortAsc}
                      onClick={() => handleSort("supplyChange24h")}
                    />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton
                      label="7d"
                      active={sortKey === "supplyChange7d"}
                      asc={sortAsc}
                      onClick={() => handleSort("supplyChange7d")}
                    />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton
                      label="Stability"
                      active={sortKey === "stabilityScore"}
                      asc={sortAsc}
                      onClick={() => handleSort("stabilityScore")}
                    />
                  </TableHead>
                  <TableHead>Mechanism</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((coin) => {
                  const tokenStyle =
                    tokenColors[coin.symbol] ??
                    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

                  return (
                    <TableRow key={coin.symbol}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`${tokenStyle} text-xs`}
                          >
                            {coin.symbol}
                          </Badge>
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {coin.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(coin.price)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums font-medium ${deviationColor(coin.deviationPct)}`}
                      >
                        {coin.deviationPct > 0 ? "+" : ""}
                        {coin.deviationPct.toFixed(4)}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatUsd(coin.solanaCirculating)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${supplyChangeColor(coin.supplyChange24h)}`}
                      >
                        {supplyChangeDisplay(coin.supplyChange24h)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${supplyChangeColor(coin.supplyChange7d)}`}
                      >
                        {supplyChangeDisplay(coin.supplyChange7d)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${stabilityBadgeStyle(coin.stabilityLevel)}`}
                        >
                          {coin.stabilityScore}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${mechanismBadgeStyle(coin.pegMechanism)}`}
                        >
                          {coin.pegMechanism}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sort Button ──

function SortButton({
  label,
  active,
  asc,
  onClick,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs hover:text-foreground transition-colors ${
        active ? "text-foreground font-semibold" : "text-muted-foreground"
      }`}
    >
      {label}
      {active && <span className="text-[10px]">{asc ? "\u25B2" : "\u25BC"}</span>}
    </button>
  );
}
