"use client";

import { useEffect, useState } from "react";
import { CorrelationHeatmap } from "./correlation-heatmap";

interface PoolInfo {
  id: string;
  label: string;
  protocol: string;
  token: string;
  apy: number;
  tvl: number;
}

interface MatrixEntry {
  poolA: string;
  poolB: string;
  similarity: number;
}

export function CorrelationShell() {
  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [matrix, setMatrix] = useState<MatrixEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/correlation");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setPools(data.pools);
        setMatrix(data.matrix);
      } catch {
        setError("Failed to load correlation data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-border/30 bg-muted/10 p-16 text-center text-muted-foreground animate-pulse">
        Computing yield correlations across top pools...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-8 text-center text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return <CorrelationHeatmap pools={pools} matrix={matrix} />;
}
