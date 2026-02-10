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
} from "recharts";
import { YieldOpportunity } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const CHART_COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
];

interface ProjectionChartProps {
  pools: YieldOpportunity[];
  amount: number;
  months: number;
  portfolioWeights?: Record<string, number>;
}

function generateProjectionData(
  pools: YieldOpportunity[],
  amount: number,
  months: number,
  weights?: Record<string, number>
) {
  const dataPoints = [];
  const steps = Math.max(months, 12);

  for (let month = 0; month <= months; month++) {
    const point: Record<string, number | string> = { month };

    for (const pool of pools) {
      const poolAmount = weights
        ? amount * ((weights[pool.id] || 0) / 100)
        : amount;
      const monthlyRate = pool.apy / 100 / 12;
      point[pool.id] = Math.round(poolAmount * Math.pow(1 + monthlyRate, month) * 100) / 100;
    }

    // Blended portfolio line
    if (weights && pools.length > 1) {
      let portfolioValue = 0;
      for (const pool of pools) {
        const poolAmount = amount * ((weights[pool.id] || 0) / 100);
        const monthlyRate = pool.apy / 100 / 12;
        portfolioValue += poolAmount * Math.pow(1 + monthlyRate, month);
      }
      point["portfolio"] = Math.round(portfolioValue * 100) / 100;
    }

    dataPoints.push(point);
  }

  return dataPoints;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1.5">
        Month {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground truncate max-w-[120px]">
            {entry.name}
          </span>
          <span className="font-mono font-medium ml-auto">
            {formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProjectionChart({ pools, amount, months, portfolioWeights }: ProjectionChartProps) {
  if (pools.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-card/30 h-[400px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Select pools from the left panel to see yield projections
        </p>
      </div>
    );
  }

  const data = generateProjectionData(pools, amount, months, portfolioWeights);

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-4">
      <h3 className="text-sm font-semibold mb-3">Projected Returns</h3>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="month"
            stroke="#666"
            tick={{ fill: "#999", fontSize: 11 }}
            label={{ value: "Months", position: "insideBottom", offset: -2, fill: "#666", fontSize: 11 }}
          />
          <YAxis
            stroke="#666"
            tick={{ fill: "#999", fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
          />

          {pools.map((pool, i) => (
            <Line
              key={pool.id}
              type="monotone"
              dataKey={pool.id}
              name={`${pool.protocol} ${pool.token}`}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}

          {portfolioWeights && pools.length > 1 && (
            <Line
              type="monotone"
              dataKey="portfolio"
              name="Blended Portfolio"
              stroke="#ffffff"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
