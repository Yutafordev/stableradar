import { NextResponse } from "next/server";
import { fetchYields, fetchBorrowRates, generateAlerts } from "@/lib/fetchers/defillama";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [yields, borrowRates, alerts] = await Promise.all([
      fetchYields(),
      fetchBorrowRates(),
      generateAlerts(),
    ]);

    const protocols = new Set(yields.map((y) => y.protocol));
    const tokens = new Set(yields.map((y) => y.token));
    const totalTvl = yields.reduce((sum, y) => sum + y.tvl, 0);
    const avgApy = yields.length > 0
      ? yields.reduce((sum, y) => sum + y.apy, 0) / yields.length
      : 0;

    const lowRiskYields = yields.filter((y) => y.riskLevel === "low");
    const bestSafe = lowRiskYields.length > 0
      ? lowRiskYields.reduce((best, y) => (y.apy > best.apy ? y : best))
      : null;
    const bestOverall = yields.length > 0
      ? yields.reduce((best, y) => (y.apy > best.apy ? y : best))
      : null;

    const cheapestBorrow = borrowRates.length > 0 ? borrowRates[0] : null;

    const riskDistribution = {
      low: yields.filter((y) => y.riskLevel === "low").length,
      medium: yields.filter((y) => y.riskLevel === "medium").length,
      high: yields.filter((y) => y.riskLevel === "high").length,
    };

    const tokenBreakdown = [...tokens].map((token) => {
      const tokenYields = yields.filter((y) => y.token === token);
      const bestApy = Math.max(...tokenYields.map((y) => y.apy));
      const tvl = tokenYields.reduce((sum, y) => sum + y.tvl, 0);
      return { token, poolCount: tokenYields.length, bestApy: Math.round(bestApy * 100) / 100, tvl };
    }).sort((a, b) => b.tvl - a.tvl);

    return NextResponse.json({
      snapshot: {
        timestamp: new Date().toISOString(),
        market: {
          totalTvl,
          averageApy: Math.round(avgApy * 100) / 100,
          protocolCount: protocols.size,
          poolCount: yields.length,
          tokenCount: tokens.size,
          alertCount: alerts.length,
        },
        bestYield: bestOverall ? {
          protocol: bestOverall.protocol,
          token: bestOverall.token,
          apy: bestOverall.apy,
          tvl: bestOverall.tvl,
          riskLevel: bestOverall.riskLevel,
        } : null,
        bestSafeYield: bestSafe ? {
          protocol: bestSafe.protocol,
          token: bestSafe.token,
          apy: bestSafe.apy,
          tvl: bestSafe.tvl,
        } : null,
        cheapestBorrow: cheapestBorrow ? {
          protocol: cheapestBorrow.protocol,
          token: cheapestBorrow.borrowToken,
          borrowApy: cheapestBorrow.borrowApy,
          supplyApy: cheapestBorrow.supplyApy,
        } : null,
        riskDistribution,
        tokenBreakdown,
      },
      meta: {
        source: "StableRadar",
        refreshInterval: "5 minutes",
        endpoints: {
          yields: "/api/yields",
          borrow: "/api/borrow",
          alerts: "/api/alerts",
          strategies: "/api/strategies",
          snapshot: "/api/snapshot",
        },
      },
    });
  } catch (error) {
    console.error("Error generating snapshot:", error);
    return NextResponse.json(
      { error: "Failed to generate market snapshot" },
      { status: 500 }
    );
  }
}
