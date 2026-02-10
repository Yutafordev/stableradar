import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSolanaMarket } from "@/lib/fetchers/market";
import { MarketDashboard } from "@/components/market/market-dashboard";

export const metadata: Metadata = {
  title: "Market Overview | StableRadar",
  description:
    "Solana DeFi market overview: total TVL, top protocols by value locked, TVL history chart, and category breakdown across the Solana ecosystem.",
};

export const revalidate = 300;

async function MarketData() {
  const data = await fetchSolanaMarket().catch(() => ({
    totalTvl: 0,
    tvlChange1d: 0,
    tvlChange7d: 0,
    topProtocols: [],
    tvlHistory: [],
    categoryBreakdown: [],
  }));
  return <MarketDashboard data={data} />;
}

function MarketSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-5 w-96 rounded-lg" />
      </div>
      <Skeleton className="h-[100px] rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-[380px] rounded-lg" />
        <Skeleton className="h-[380px] rounded-lg" />
      </div>
      <Skeleton className="h-[500px] rounded-lg" />
    </div>
  );
}

export default function MarketPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Suspense fallback={<MarketSkeleton />}>
        <MarketData />
      </Suspense>
    </div>
  );
}
