import { NextRequest, NextResponse } from "next/server";
import {
  fetchWalletPositions,
  isValidSolanaAddress,
} from "@/lib/solana/wallet-fetcher";
import { fetchYields } from "@/lib/fetchers/defillama";
import { WalletAnalysis, WalletYieldMatch } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address || !isValidSolanaAddress(address)) {
    return NextResponse.json(
      { error: "Invalid or missing Solana address" },
      { status: 400 }
    );
  }

  try {
    const [wallet, yields] = await Promise.all([
      fetchWalletPositions(address),
      fetchYields(),
    ]);

    const yieldMatches: WalletYieldMatch[] = wallet.positions.map((pos) => {
      // Find yield pools whose symbol contains this token
      const matching = yields
        .filter((y) => {
          const sym = y.symbol.toUpperCase();
          return sym.includes(pos.symbol.toUpperCase());
        })
        .sort((a, b) => b.apy - a.apy);

      const topPools = matching.slice(0, 3);
      const bestPool = topPools[0] ?? null;
      const potentialAnnualYield = bestPool
        ? (pos.usdValue * bestPool.apy) / 100
        : 0;

      return { position: pos, bestPool, topPools, potentialAnnualYield };
    });

    const riskScores = yieldMatches
      .map((m) => m.bestPool?.riskScore)
      .filter((s): s is number => s !== undefined);

    const avgRiskScore =
      riskScores.length > 0
        ? Math.round(
            (riskScores.reduce((a, b) => a + b, 0) / riskScores.length) * 10
          ) / 10
        : 0;

    const analysis: WalletAnalysis = {
      address,
      solBalance: wallet.solBalance,
      positions: wallet.positions,
      totalUsdValue: wallet.positions.reduce((s, p) => s + p.usdValue, 0),
      yieldMatches,
      avgRiskScore,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
