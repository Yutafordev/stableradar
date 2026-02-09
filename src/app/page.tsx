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
import { DashboardStats, YieldOpportunity, BorrowRate, RiskAlert } from "@/lib/types";

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

  return (
    <>
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
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SR</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">StableRadar</h1>
              <p className="text-[11px] text-muted-foreground -mt-0.5">
                Solana Stablecoin Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live data</span>
            </div>
            <span className="text-xs text-muted-foreground hidden md:block">
              Powered by DeFi Llama
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>

      <footer className="border-t border-border/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                StableRadar aggregates data from DeFi Llama and Solana DeFi protocols.
                Not financial advice. Data refreshes every 5 minutes.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Built for Colosseum Agent Hackathon 2026
              </p>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Public API
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">/api/yields</code>
                <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">/api/borrow</code>
                <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">/api/alerts</code>
                <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">/api/strategies</code>
                <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">/api/snapshot</code>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
