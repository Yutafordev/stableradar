import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchYields, fetchBorrowRates, generateAlerts } from "@/lib/fetchers/defillama";
import { StatsCards } from "@/components/stats-cards";
import { YieldTable } from "@/components/yield-table";
import { BorrowTable } from "@/components/borrow-table";
import { AlertsPanel } from "@/components/alerts-panel";
import { ProtocolOverview } from "@/components/protocol-overview";
import { TokenBreakdown } from "@/components/token-breakdown";
import { YieldChart, RiskVsYieldMap } from "@/components/yield-chart";
import { StrategyPanel } from "@/components/strategy-panel";
import { MarketBanner } from "@/components/market-banner";
import { ProtocolHeatmap } from "@/components/protocol-heatmap";
import { TopMovers } from "@/components/top-movers";
import { ProtocolHealthGrid } from "@/components/protocol-health";
import { DashboardStats, YieldOpportunity, BorrowRate, RiskAlert, ProtocolHealth } from "@/lib/types";

export const revalidate = 300;

function computeStats(
  yields: YieldOpportunity[],
  alerts: RiskAlert[]
): DashboardStats {
  const protocols = new Set(yields.map((y) => y.protocol));
  const totalApy = yields.reduce((sum, y) => sum + y.apy, 0);
  const totalTvl = yields.reduce((sum, y) => sum + y.tvl, 0);

  const lowRiskYields = yields.filter((y) => y.riskLevel === "low");
  const bestYield =
    lowRiskYields.length > 0
      ? lowRiskYields.reduce((best, y) => (y.apy > best.apy ? y : best))
      : yields.length > 0
      ? yields.reduce((best, y) => (y.apy > best.apy ? y : best))
      : null;

  return {
    bestYield,
    averageApy: yields.length > 0 ? totalApy / yields.length : 0,
    totalTvl,
    protocolCount: protocols.size,
    alertCount: alerts.length,
    poolCount: yields.length,
  };
}

async function DashboardContent() {
  let yields: YieldOpportunity[] = [];
  let borrowRates: BorrowRate[] = [];
  let alerts: RiskAlert[] = [];

  try {
    [yields, borrowRates, alerts] = await Promise.all([
      fetchYields(),
      fetchBorrowRates(),
      generateAlerts(),
    ]);
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  const stats = computeStats(yields, alerts);

  // Compute health scores from yields
  const healthMap = new Map<string, typeof yields>();
  for (const y of yields) {
    const existing = healthMap.get(y.protocolSlug) || [];
    existing.push(y);
    healthMap.set(y.protocolSlug, existing);
  }

  const healthScores: ProtocolHealth[] = [];
  for (const [slug, pools] of healthMap) {
    const totalTvl = pools.reduce((s, p) => s + p.tvl, 0);
    const avgApy = pools.length > 0 ? pools.reduce((s, p) => s + p.apy, 0) / pools.length : 0;
    const sigmas = pools.map((p) => p.sigma).filter((s): s is number => s !== null);
    const avgSigma = sigmas.length > 0 ? sigmas.reduce((s, v) => s + v, 0) / sigmas.length : 2;

    const info = { audited: pools[0]?.protocolAudited ?? false, ageMonths: pools[0]?.protocolAgeMonths ?? 6, category: pools[0]?.protocolCategory ?? "DeFi" };

    const tvlDepth = totalTvl > 500e6 ? 25 : totalTvl > 100e6 ? 22 : totalTvl > 50e6 ? 18 : totalTvl > 10e6 ? 14 : totalTvl > 1e6 ? 8 : 3;
    const poolDiversity = pools.length >= 10 ? 15 : pools.length >= 6 ? 12 : pools.length >= 3 ? 8 : 4;
    const apyStability = sigmas.length === 0 ? 10 : avgSigma < 0.5 ? 20 : avgSigma < 1 ? 16 : avgSigma < 2 ? 12 : avgSigma < 5 ? 6 : 2;
    const auditScore = info.audited ? 15 : 3;
    const maturityScore = info.ageMonths >= 36 ? 15 : info.ageMonths >= 24 ? 12 : info.ageMonths >= 12 ? 9 : info.ageMonths >= 6 ? 5 : 2;
    const yieldCompetitiveness = avgApy >= 10 ? 10 : avgApy >= 7 ? 8 : avgApy >= 5 ? 6 : avgApy >= 3 ? 4 : 2;
    const score = tvlDepth + poolDiversity + apyStability + auditScore + maturityScore + yieldCompetitiveness;
    const grade = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "D" : "F";

    healthScores.push({
      protocol: pools[0]?.protocol || slug,
      slug,
      grade: grade as ProtocolHealth["grade"],
      score, tvlDepth, poolDiversity, apyStability, auditScore, maturityScore, yieldCompetitiveness,
      poolCount: pools.length, totalTvl, avgApy: Math.round(avgApy * 100) / 100, category: info.category,
    });
  }
  healthScores.sort((a, b) => b.score - a.score);

  return (
    <>
      <MarketBanner yields={yields} alerts={alerts} />
      {yields.length > 0 && <TopMovers yields={yields} />}
      <StatsCards stats={stats} />

      {yields.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Token Overview
          </h2>
          <TokenBreakdown yields={yields} />
        </div>
      )}

      {yields.length > 0 && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <YieldChart yields={yields} />
          <RiskVsYieldMap yields={yields} />
        </div>
      )}

      {yields.length > 0 && <ProtocolHeatmap yields={yields} />}

      <Tabs defaultValue="yields" className="mt-6">
        <TabsList className="bg-muted/50 border border-border/50">
          <TabsTrigger value="yields" className="text-xs">
            Yield Finder ({yields.length})
          </TabsTrigger>
          <TabsTrigger value="borrow" className="text-xs">
            Borrow Optimizer ({borrowRates.length})
          </TabsTrigger>
          <TabsTrigger value="protocols" className="text-xs">
            Protocols
          </TabsTrigger>
          <TabsTrigger value="strategies" className="text-xs">
            Strategies
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">
            Risk Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="health" className="text-xs">
            Health ({healthScores.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yields" className="mt-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Stablecoin Yield Opportunities</h2>
            <p className="text-sm text-muted-foreground">
              Best APY rates for stablecoin deposits across Solana DeFi protocols.
              Each pool is risk-scored based on TVL, protocol maturity, and rate volatility.
            </p>
          </div>
          {yields.length > 0 ? (
            <YieldTable yields={yields} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Unable to load yield data. Please try again later.
            </div>
          )}
        </TabsContent>

        <TabsContent value="borrow" className="mt-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Borrow Rate Comparison</h2>
            <p className="text-sm text-muted-foreground">
              Compare stablecoin borrowing rates across Solana lending protocols.
              Find the cheapest rates with the best collateral terms.
            </p>
          </div>
          {borrowRates.length > 0 ? (
            <BorrowTable rates={borrowRates} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Unable to load borrow rate data. Please try again later.
            </div>
          )}
        </TabsContent>

        <TabsContent value="protocols" className="mt-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Protocol Overview</h2>
            <p className="text-sm text-muted-foreground">
              Comparison of all tracked Solana DeFi protocols with stablecoin pools.
              Sorted by total TVL.
            </p>
          </div>
          <ProtocolOverview yields={yields} />
        </TabsContent>

        <TabsContent value="strategies" className="mt-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Yield Strategies</h2>
            <p className="text-sm text-muted-foreground">
              AI-generated strategy suggestions based on current market conditions.
              Not financial advice — always do your own research.
            </p>
          </div>
          <StrategyPanel yields={yields} borrowRates={borrowRates} />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Risk Alerts</h2>
            <p className="text-sm text-muted-foreground">
              Anomaly detection for stablecoin pools: rate spikes, low TVL warnings,
              and unusually high yields that may indicate elevated risk.
            </p>
          </div>
          <AlertsPanel alerts={alerts} />
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Protocol Health Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Aggregated health grades for each protocol based on TVL depth, pool diversity,
              APY stability, audit status, maturity, and yield competitiveness.
            </p>
          </div>
          <ProtocolHealthGrid health={healthScores} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[90px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[40px] w-[400px] rounded-lg" />
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
