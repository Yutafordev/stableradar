import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchYields } from "@/lib/fetchers/defillama";
import { BacktestShell } from "@/components/backtest/backtest-shell";

export const metadata: Metadata = {
  title: "Backtester | StableRadar",
  description:
    "Backtest stablecoin yield strategies using 30-day historical APY data from Solana DeFi protocols. Compare up to 3 pools side by side.",
};

export const revalidate = 300;

async function BacktestData() {
  const yields = await fetchYields().catch(() => []);
  const top50 = yields
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 50);
  return <BacktestShell pools={top50} />;
}

function BacktestSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4">
        <Skeleton className="h-[500px] rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-[60px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function BacktestPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Suspense fallback={<BacktestSkeleton />}>
        <BacktestData />
      </Suspense>
    </div>
  );
}
