"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { RiskBadge } from "@/components/risk-badge";
import { PortfolioSummaryCards } from "./portfolio-summary";
import {
  PortfolioPosition,
  YieldOpportunity,
  PROTOCOLS,
  STABLECOIN_SYMBOLS,
} from "@/lib/types";
import {
  loadPositions,
  addPosition,
  removePosition,
  clearAllPositions,
  computePortfolioSummary,
} from "@/lib/portfolio";
import { formatNumber } from "@/lib/format";

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
  TGBP: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  QCAD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  GYEN: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

const protocolEntries = Object.entries(PROTOCOLS);

interface PortfolioTrackerProps {
  yields: YieldOpportunity[];
}

export function PortfolioTracker({ yields }: PortfolioTrackerProps) {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState(protocolEntries[0]?.[0] ?? "");
  const [selectedToken, setSelectedToken] = useState(STABLECOIN_SYMBOLS[0]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    setPositions(loadPositions());
  }, []);

  const summary = useMemo(
    () => computePortfolioSummary(positions, yields),
    [positions, yields]
  );

  function handleAdd() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    const proto = PROTOCOLS[selectedProtocol];
    if (!proto) return;

    const updated = addPosition(positions, {
      protocol: proto.name,
      protocolSlug: selectedProtocol,
      token: selectedToken,
      amount: numAmount,
    });
    setPositions(updated);
    setAmount("");
  }

  function handleRemove(id: string) {
    setPositions(removePosition(positions, id));
  }

  function handleClear() {
    setPositions(clearAllPositions());
  }

  return (
    <div className="space-y-6">
      {positions.length > 0 && <PortfolioSummaryCards summary={summary} />}

      {/* Add Position Form */}
      <div className="rounded-lg border border-border/50 bg-card/30 p-4">
        <h3 className="text-sm font-semibold mb-3">Add Position</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Protocol
            </label>
            <select
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value)}
              className="flex h-9 w-full min-w-[160px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {protocolEntries.map(([slug, info]) => (
                <option key={slug} value={slug}>
                  {info.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Token
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="flex h-9 w-full min-w-[100px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {STABLECOIN_SYMBOLS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Amount ($)
            </label>
            <Input
              type="number"
              placeholder="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="w-[120px] h-9"
              min="0"
              step="any"
            />
          </div>

          <Button size="sm" onClick={handleAdd} disabled={!amount || parseFloat(amount) <= 0}>
            Add
          </Button>
        </div>
      </div>

      {/* Positions Table */}
      {positions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Your Positions</h3>
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-muted-foreground">
              Clear All
            </Button>
          </div>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Protocol</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Token</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Amount</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Live APY</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right hidden sm:table-cell">Annual Yield</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Risk</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.positionDetails.map((d) => (
                  <TableRow key={d.position.id} className="border-border/30">
                    <TableCell className="font-medium">{d.position.protocol}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={tokenColors[d.position.token] || "bg-muted text-muted-foreground"}
                      >
                        {d.position.token}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(d.position.amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {d.currentApy !== null ? (
                        <span className="text-emerald-400">{d.currentApy.toFixed(2)}%</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono hidden sm:table-cell">
                      {d.annualYield > 0 ? (
                        <span className="text-emerald-400">{formatNumber(d.annualYield)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {d.riskLevel ? <RiskBadge level={d.riskLevel} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(d.position.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Optimization Suggestions */}
          {summary.positionDetails.some((d) => d.betterPool) && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold">Optimization Suggestions</h3>
              {summary.positionDetails
                .filter((d) => d.betterPool)
                .map((d) => (
                  <div
                    key={d.position.id}
                    className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm"
                  >
                    <span className="text-amber-400 font-medium">
                      {d.position.token} on {d.position.protocol}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      ({d.currentApy?.toFixed(2)}%) &rarr; Switch to{" "}
                    </span>
                    <span className="font-medium text-emerald-400">
                      {d.betterPool!.protocol}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      for {d.betterPool!.apy.toFixed(2)}%
                    </span>{" "}
                    <span className="text-emerald-400 font-mono">
                      (+{formatNumber(d.betterPoolGain)}/yr)
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {positions.length === 0 && (
        <div className="rounded-lg border border-border/50 bg-card/30 px-6 py-10 text-center">
          <p className="text-muted-foreground">No positions added yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your DeFi positions above to track live APY and find optimizations.
          </p>
        </div>
      )}
    </div>
  );
}
