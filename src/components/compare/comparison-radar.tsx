"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { YieldOpportunity } from "@/lib/types";

const CHART_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
];

interface ComparisonRadarProps {
  pools: YieldOpportunity[];
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.round(((value - min) / (max - min)) * 100);
}

export function ComparisonRadar({ pools }: ComparisonRadarProps) {
  if (pools.length < 2) {
    return null;
  }

  // Compute normalized scores for radar axes
  const allApys = pools.map((p) => p.apy);
  const allTvls = pools.map((p) => Math.log10(Math.max(p.tvl, 1)));
  const allAges = pools.map((p) => p.protocolAgeMonths);
  const allRisks = pools.map((p) => p.riskScore);

  const axes = [
    { axis: "APY" },
    { axis: "TVL Depth" },
    { axis: "Protocol Age" },
    { axis: "Safety" },
    { axis: "Audit" },
  ];

  const data = axes.map((a) => {
    const point: Record<string, string | number> = { axis: a.axis };
    pools.forEach((pool, i) => {
      const key = `pool_${i}`;
      switch (a.axis) {
        case "APY":
          point[key] = normalize(pool.apy, Math.min(...allApys) * 0.8, Math.max(...allApys) * 1.2);
          break;
        case "TVL Depth":
          point[key] = normalize(
            Math.log10(Math.max(pool.tvl, 1)),
            Math.min(...allTvls) * 0.9,
            Math.max(...allTvls) * 1.1
          );
          break;
        case "Protocol Age":
          point[key] = normalize(pool.protocolAgeMonths, 0, Math.max(...allAges, 36));
          break;
        case "Safety":
          // Invert risk score — lower risk = higher safety
          point[key] = normalize(15 - pool.riskScore, 15 - Math.max(...allRisks), 15 - Math.min(...allRisks) + 1);
          break;
        case "Audit":
          point[key] = pool.protocolAudited ? 100 : 20;
          break;
      }
    });
    return point;
  });

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-4">
      <h3 className="text-sm font-semibold mb-3">Radar Comparison</h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#999", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          {pools.map((pool, i) => (
            <Radar
              key={pool.id}
              name={`${pool.protocol} ${pool.token}`}
              dataKey={`pool_${i}`}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(20,20,20,0.95)",
              border: "1px solid #333",
              borderRadius: "8px",
              fontSize: "11px",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
