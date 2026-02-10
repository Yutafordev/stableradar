"use client";

import { useState, useEffect } from "react";

interface ChartPoint {
  timestamp: string;
  apy: number;
  tvlUsd: number;
}

export function ApyHistoryChart({ poolId }: { poolId: string }) {
  const [data, setData] = useState<ChartPoint[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/chart/${poolId}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [poolId]);

  if (error) {
    return (
      <p className="text-[10px] text-muted-foreground">
        Chart data unavailable
      </p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-1 animate-pulse">
        <div className="h-2 w-16 bg-muted/50 rounded" />
        <div className="h-[64px] w-full bg-muted/30 rounded" />
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <p className="text-[10px] text-muted-foreground">
        Not enough history data
      </p>
    );
  }

  const apys = data.map((d) => d.apy);
  const minApy = Math.min(...apys);
  const maxApy = Math.max(...apys);
  const currentApy = apys[apys.length - 1];
  const firstApy = apys[0];
  const trendUp = currentApy >= firstApy;

  const W = 280;
  const H = 64;
  const PAD = 2;

  const range = maxApy - minApy || 1;
  const points = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((d.apy - minApy) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });

  const lineColor = trendUp ? "#34d399" : "#f87171";
  const fillColor = trendUp
    ? "rgba(52,211,153,0.15)"
    : "rgba(248,113,113,0.15)";

  const areaPoints = [
    `${PAD},${H}`,
    ...points,
    `${W - PAD},${H}`,
  ].join(" ");

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">30d APY Trend</span>
        <div className="flex gap-2 text-[10px] font-mono">
          <span className="text-muted-foreground">
            Min {minApy.toFixed(2)}%
          </span>
          <span className="text-muted-foreground">
            Max {maxApy.toFixed(2)}%
          </span>
          <span className={trendUp ? "text-emerald-400" : "text-red-400"}>
            Now {currentApy.toFixed(2)}%
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[64px]"
        preserveAspectRatio="none"
      >
        <polygon points={areaPoints} fill={fillColor} />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
