import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchStablecoinPegData } from "@/lib/fetchers/stablecoins";
import { DepegDashboard } from "@/components/depeg/depeg-dashboard";

export const metadata: Metadata = {
  title: "Depeg Monitor - StableRadar",
  description:
    "Real-time stablecoin depeg monitoring on Solana. Track price deviations, supply changes, and stability scores for all major stablecoins.",
};

export const revalidate = 300;

async function DepegData() {
  const data = await fetchStablecoinPegData().catch(() => []);
  return <DepegDashboard data={data} />;
}

function DepegSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64 rounded-lg" />
      <Skeleton className="h-5 w-96 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[180px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  );
}

export default function DepegPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Suspense fallback={<DepegSkeleton />}>
        <DepegData />
      </Suspense>
    </div>
  );
}
