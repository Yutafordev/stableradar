import { NextResponse } from "next/server";
import { fetchYields } from "@/lib/fetchers/defillama";

export const dynamic = "force-dynamic";

interface PoolSummary {
  id: string;
  label: string;
  protocol: string;
  token: string;
  apy: number;
  apyMean30d: number | null;
  sigma: number | null;
  tvl: number;
  riskLevel: string;
}

interface CorrelationEntry {
  poolA: string;
  poolB: string;
  similarity: number;
}

function computeSimilarity(a: PoolSummary, b: PoolSummary): number {
  // APY-mean deviation similarity (50%)
  const apyDiff = Math.abs(a.apy - b.apy);
  const maxApy = Math.max(a.apy, b.apy, 1);
  const apySim = Math.max(0, 1 - apyDiff / maxApy);

  // Volatility similarity via sigma (30%)
  let sigmaSim = 0.5; // neutral default
  if (a.sigma !== null && b.sigma !== null) {
    const sigmaDiff = Math.abs(a.sigma - b.sigma);
    const maxSigma = Math.max(a.sigma, b.sigma, 0.1);
    sigmaSim = Math.max(0, 1 - sigmaDiff / maxSigma);
  }

  // Structural factors (20%): same token +0.5, same protocol category +0.5
  let structural = 0;
  if (a.token === b.token) structural += 0.5;
  if (a.riskLevel === b.riskLevel) structural += 0.5;

  return Math.round((apySim * 0.5 + sigmaSim * 0.3 + structural * 0.2) * 100) / 100;
}

export async function GET() {
  try {
    const yields = await fetchYields();

    // Take top 20 pools by TVL
    const top = yields
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 20)
      .map((y) => ({
        id: y.id,
        label: `${y.protocol} ${y.token}`,
        protocol: y.protocol,
        token: y.token,
        apy: y.apy,
        apyMean30d: y.apyMean30d,
        sigma: y.sigma,
        tvl: y.tvl,
        riskLevel: y.riskLevel,
      }));

    // Compute pairwise similarity
    const matrix: CorrelationEntry[] = [];
    for (let i = 0; i < top.length; i++) {
      for (let j = i; j < top.length; j++) {
        const sim = i === j ? 1 : computeSimilarity(top[i], top[j]);
        matrix.push({
          poolA: top[i].id,
          poolB: top[j].id,
          similarity: sim,
        });
      }
    }

    return NextResponse.json({
      pools: top,
      matrix,
      meta: {
        poolCount: top.length,
        pairCount: matrix.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Correlation API error:", error);
    return NextResponse.json(
      { error: "Failed to compute correlation matrix" },
      { status: 500 }
    );
  }
}
