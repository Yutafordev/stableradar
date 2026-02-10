"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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
import { formatUsd } from "@/lib/format";
import type { SolanaMarketData } from "@/lib/types";

const CATEGORY_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

function ChangeBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <Badge
      variant="outline"
      className={
        isPositive
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border-red-500/20"
      }
    >
      {isPositive ? "+" : ""}
      {value.toFixed(2)}%
    </Badge>
  );
}

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTooltipTvl(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${(value / 1_000).toFixed(0)}K`;
}

interface MarketDashboardProps {
  data: SolanaMarketData;
}

export function MarketDashboard({ data }: MarketDashboardProps) {
  const {
    totalTvl,
    tvlChange1d,
    tvlChange7d,
    topProtocols,
    tvlHistory,
    categoryBreakdown,
  } = data;

  // Prepare pie chart data (top 7 categories + "Other")
  const pieData = (() => {
    if (categoryBreakdown.length <= 8) return categoryBreakdown;
    const top7 = categoryBreakdown.slice(0, 7);
    const otherTvl = categoryBreakdown
      .slice(7)
      .reduce((sum, c) => sum + c.tvl, 0);
    const otherCount = categoryBreakdown
      .slice(7)
      .reduce((sum, c) => sum + c.count, 0);
    return [...top7, { category: "Other", tvl: otherTvl, count: otherCount }];
  })();

  // Custom tooltip for area chart
  const AreaTooltipContent = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-lg border border-border/50 bg-background/95 p-2.5 shadow-lg backdrop-blur-sm">
        <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold">{formatTooltipTvl(payload[0].value)}</p>
      </div>
    );
  };

  // Custom tooltip for pie chart
  const PieTooltipContent = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { count: number } }>;
  }) => {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0];
    return (
      <div className="rounded-lg border border-border/50 bg-background/95 p-2.5 shadow-lg backdrop-blur-sm">
        <p className="text-[11px] font-semibold">{entry.name}</p>
        <p className="text-sm font-mono">{formatTooltipTvl(entry.value)}</p>
        <p className="text-[10px] text-muted-foreground">
          {entry.payload.count} protocol{entry.payload.count !== 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Solana DeFi Market
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time overview of Total Value Locked, top protocols, and category
          breakdown across Solana DeFi.
        </p>
      </div>

      {/* TVL Hero Card */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Value Locked on Solana
              </p>
              <p className="text-4xl font-bold font-mono tracking-tight">
                {formatUsd(totalTvl)}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground mb-0.5">24h Change</p>
                <ChangeBadge value={tvlChange1d} />
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground mb-0.5">7d Change</p>
                <ChangeBadge value={tvlChange7d} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* TVL History Chart - takes 2/3 */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">
              TVL History (90 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {tvlHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={tvlHistory}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{ fill: "#999", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis
                    tickFormatter={(v: number) => formatUsd(v)}
                    tick={{ fill: "#999", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip content={<AreaTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="tvl"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#tvlGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground">
                No history data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart - takes 1/3 */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="tvl"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipContent />} />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    formatter={(value: string) => (
                      <span className="text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Protocol Ranking Table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">
            Top 15 Protocols by TVL
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-[11px] text-muted-foreground w-10">
                    #
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">
                    Protocol
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground">
                    Category
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground text-right">
                    TVL
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground text-right">
                    24h
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground text-right">
                    7d
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProtocols.map((protocol, index) => (
                  <TableRow
                    key={protocol.slug}
                    className="border-border/20 hover:bg-muted/10"
                  >
                    <TableCell className="text-[11px] text-muted-foreground font-mono">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {protocol.logo && (
                          <img
                            src={protocol.logo}
                            alt={protocol.name}
                            className="w-5 h-5 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                        <span className="text-sm font-medium">
                          {protocol.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-muted/30 text-muted-foreground border-border/30 text-[10px]"
                      >
                        {protocol.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {formatUsd(protocol.tvl)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-[11px] font-mono ${
                          protocol.change1d >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {protocol.change1d >= 0 ? "+" : ""}
                        {protocol.change1d.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-[11px] font-mono ${
                          protocol.change7d >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {protocol.change7d >= 0 ? "+" : ""}
                        {protocol.change7d.toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {topProtocols.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No protocol data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
