"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YieldOpportunity } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const POOL_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

interface BacktestDayData {
  date: string;
  [key: string]: number | string;
}

interface BacktestChartProps {
  data: BacktestDayData[];
  pools: YieldOpportunity[];
  initialAmount: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  initialAmount,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  initialAmount: number;
}) {
  if (!active || !payload || !label) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        {formatDate(label)}
      </p>
      {payload.map((entry) => {
        const value = entry.value;
        const gain = value - initialAmount;
        const gainPct = (gain / initialAmount) * 100;
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1.5 last:mb-0">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium">{entry.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono">{formatNumber(value)}</span>
                <span
                  className={`text-[10px] font-mono ${
                    gain >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {gain >= 0 ? "+" : ""}
                  {formatNumber(gain)} ({gainPct.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BacktestChart({ data, pools, initialAmount }: BacktestChartProps) {
  if (data.length < 2) return null;

  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Portfolio Value Over 30 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              stroke="hsl(var(--border))"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              stroke="hsl(var(--border))"
              tickFormatter={(v: number) => `$${v.toLocaleString()}`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={<CustomTooltip initialAmount={initialAmount} />}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              iconType="circle"
              iconSize={8}
            />
            <ReferenceLine
              y={initialAmount}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="6 4"
              strokeOpacity={0.5}
              label={{
                value: "Hold",
                position: "insideTopRight",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
            />
            {pools.map((pool, idx) => (
              <Line
                key={pool.id}
                type="monotone"
                dataKey={pool.id}
                name={`${pool.protocol} ${pool.symbol}`}
                stroke={POOL_COLORS[idx]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
