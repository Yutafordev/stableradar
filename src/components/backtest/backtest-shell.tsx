"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiskBadge } from "@/components/risk-badge";
import { YieldOpportunity } from "@/lib/types";
import { formatUsd } from "@/lib/format";
import { BacktestChart } from "./backtest-chart";
import { BacktestResults } from "./backtest-results";
import { Search, X, Play, Loader2 } from "lucide-react";

const MAX_POOLS = 3;

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
};

interface ChartPoint {
  timestamp: string;
  apy: number;
  tvlUsd: number;
}

interface BacktestDayData {
  date: string;
  [key: string]: number | string; // pool values keyed by pool id
}

interface PoolResult {
  pool: YieldOpportunity;
  finalAmount: number;
  totalGainUsd: number;
  totalGainPct: number;
  effectiveApy: number;
  bestDay: { date: string; gain: number };
  worstDay: { date: string; gain: number };
}

export function BacktestShell({ pools }: { pools: YieldOpportunity[] }) {
  const [selectedPools, setSelectedPools] = useState<YieldOpportunity[]>([]);
  const [initialAmount, setInitialAmount] = useState(10_000);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<BacktestDayData[] | null>(null);
  const [results, setResults] = useState<PoolResult[] | null>(null);

  const selectedIds = new Set(selectedPools.map((p) => p.id));

  const filtered = pools.filter((y) => {
    const q = search.toLowerCase();
    return (
      y.protocol.toLowerCase().includes(q) ||
      y.symbol.toLowerCase().includes(q) ||
      y.token.toLowerCase().includes(q)
    );
  });

  const handleTogglePool = (pool: YieldOpportunity) => {
    setSelectedPools((prev) => {
      const exists = prev.find((p) => p.id === pool.id);
      if (exists) return prev.filter((p) => p.id !== pool.id);
      if (prev.length >= MAX_POOLS) return prev;
      return [...prev, pool];
    });
    // Reset results when pool selection changes
    setChartData(null);
    setResults(null);
    setError(null);
  };

  const runBacktest = useCallback(async () => {
    if (selectedPools.length === 0) return;
    if (initialAmount <= 0) {
      setError("Initial amount must be greater than 0.");
      return;
    }

    setLoading(true);
    setError(null);
    setChartData(null);
    setResults(null);

    try {
      // Fetch chart data for all selected pools in parallel
      const fetches = selectedPools.map(async (pool) => {
        const res = await fetch(`/api/chart/${pool.id}`);
        if (!res.ok) throw new Error(`Failed to fetch data for ${pool.protocol} ${pool.symbol}`);
        const json = await res.json();
        return { pool, data: json.data as ChartPoint[] };
      });

      const poolDataResults = await Promise.all(fetches);

      // Find overlapping date range across all pools
      const allDatesPerPool = poolDataResults.map((pd) =>
        pd.data.map((d) => d.timestamp.split("T")[0])
      );

      // Use the intersection of dates
      let commonDates: string[];
      if (allDatesPerPool.length === 1) {
        commonDates = allDatesPerPool[0];
      } else {
        const dateSets = allDatesPerPool.map((dates) => new Set(dates));
        commonDates = allDatesPerPool[0].filter((date) =>
          dateSets.every((s) => s.has(date))
        );
      }

      if (commonDates.length < 2) {
        setError("Not enough overlapping historical data to run the backtest.");
        setLoading(false);
        return;
      }

      // Sort dates chronologically
      commonDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      // Build lookup maps: pool id -> date -> apy
      const apyMaps: Record<string, Record<string, number>> = {};
      for (const { pool, data } of poolDataResults) {
        const map: Record<string, number> = {};
        for (const point of data) {
          const dateKey = point.timestamp.split("T")[0];
          map[dateKey] = point.apy;
        }
        apyMaps[pool.id] = map;
      }

      // Simulate day-by-day compounding for each pool
      const balances: Record<string, number> = {};
      for (const pool of selectedPools) {
        balances[pool.id] = initialAmount;
      }

      const dailyGains: Record<string, { date: string; gain: number }[]> = {};
      for (const pool of selectedPools) {
        dailyGains[pool.id] = [];
      }

      const chartRows: BacktestDayData[] = [];

      // First day: starting balance
      const firstDay: BacktestDayData = { date: commonDates[0] };
      for (const pool of selectedPools) {
        firstDay[pool.id] = initialAmount;
      }
      chartRows.push(firstDay);

      // Compound from day 1 onward
      for (let i = 1; i < commonDates.length; i++) {
        const date = commonDates[i];
        const row: BacktestDayData = { date };

        for (const pool of selectedPools) {
          const apy = apyMaps[pool.id][date] ?? 0;
          const dailyRate = apy / 365 / 100;
          const prevBalance = balances[pool.id];
          const newBalance = prevBalance * (1 + dailyRate);
          const dayGain = newBalance - prevBalance;

          balances[pool.id] = newBalance;
          dailyGains[pool.id].push({ date, gain: dayGain });
          row[pool.id] = Math.round(newBalance * 100) / 100;
        }

        chartRows.push(row);
      }

      // Compute results per pool
      const poolResults: PoolResult[] = selectedPools.map((pool) => {
        const finalAmount = balances[pool.id];
        const totalGainUsd = finalAmount - initialAmount;
        const totalGainPct = (totalGainUsd / initialAmount) * 100;
        const days = commonDates.length;
        // Annualize: effective APY = ((final / initial) ^ (365 / days) - 1) * 100
        const effectiveApy =
          days > 1
            ? (Math.pow(finalAmount / initialAmount, 365 / days) - 1) * 100
            : 0;

        const gains = dailyGains[pool.id];
        const bestDay =
          gains.length > 0
            ? gains.reduce((best, g) => (g.gain > best.gain ? g : best))
            : { date: "-", gain: 0 };
        const worstDay =
          gains.length > 0
            ? gains.reduce((worst, g) => (g.gain < worst.gain ? g : worst))
            : { date: "-", gain: 0 };

        return {
          pool,
          finalAmount: Math.round(finalAmount * 100) / 100,
          totalGainUsd: Math.round(totalGainUsd * 100) / 100,
          totalGainPct: Math.round(totalGainPct * 1000) / 1000,
          effectiveApy: Math.round(effectiveApy * 100) / 100,
          bestDay,
          worstDay,
        };
      });

      setChartData(chartRows);
      setResults(poolResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backtest failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedPools, initialAmount]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Portfolio Backtester</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select up to {MAX_POOLS} pools, set your initial deposit, and backtest against 30 days of
          real APY history.
          {pools.length > 0 && ` ${pools.length} top pools available.`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4">
        {/* Left: Pool selector */}
        <div className="space-y-3">
          <div className="rounded-lg border border-border/50 bg-card/30 overflow-hidden">
            <div className="p-3 border-b border-border/30">
              <h3 className="text-sm font-semibold mb-2">
                Select Pools ({selectedPools.length}/{MAX_POOLS})
              </h3>

              {/* Selected chips */}
              {selectedPools.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedPools.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleTogglePool(p)}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-accent/50 text-accent-foreground hover:bg-accent transition-colors"
                    >
                      {p.protocol} {p.token}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search protocol or token..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm bg-muted/30 border-border/30"
                />
              </div>
            </div>

            <ScrollArea className="h-[340px]">
              <div className="divide-y divide-border/20">
                {filtered.map((y) => {
                  const isSelected = selectedIds.has(y.id);
                  const disabled = !isSelected && selectedPools.length >= MAX_POOLS;
                  return (
                    <button
                      key={y.id}
                      onClick={() => !disabled && handleTogglePool(y)}
                      disabled={disabled}
                      className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-3 ${
                        isSelected
                          ? "bg-accent/30"
                          : disabled
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${
                          isSelected
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-border/50"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium truncate">
                            {y.protocol}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1 py-0 ${
                              tokenColors[y.token] ||
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {y.token}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] font-mono text-emerald-400">
                            {y.apy.toFixed(2)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatUsd(y.tvl)}
                          </span>
                        </div>
                      </div>
                      <RiskBadge level={y.riskLevel} />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Amount input and Run button */}
          <div className="rounded-lg border border-border/50 bg-card/30 p-3 space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Initial Deposit ($)
              </label>
              <Input
                type="number"
                min={1}
                step={100}
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value) || 0)}
                className="h-8 text-sm bg-muted/30 border-border/30 font-mono"
              />
            </div>
            <Button
              onClick={runBacktest}
              disabled={selectedPools.length === 0 || loading}
              className="w-full h-9 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Backtest
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Chart + Results */}
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {!chartData && !loading && !error && (
            <div className="rounded-lg border border-border/50 bg-card/30 flex items-center justify-center h-[400px]">
              <div className="text-center text-muted-foreground">
                <p className="text-sm font-medium">No backtest yet</p>
                <p className="text-xs mt-1">
                  Select pools and click &quot;Run Backtest&quot; to simulate historical returns.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-lg border border-border/50 bg-card/30 flex items-center justify-center h-[400px]">
              <div className="text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Fetching historical data and running simulation...</p>
              </div>
            </div>
          )}

          {chartData && (
            <BacktestChart
              data={chartData}
              pools={selectedPools}
              initialAmount={initialAmount}
            />
          )}

          {results && (
            <BacktestResults results={results} initialAmount={initialAmount} />
          )}
        </div>
      </div>
    </div>
  );
}
