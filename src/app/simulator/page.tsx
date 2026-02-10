import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchYields } from "@/lib/fetchers/defillama";
import { SimulatorShell } from "@/components/simulator/simulator-shell";

export const metadata: Metadata = {
  title: "Yield Simulator - StableRadar",
  description:
    "Simulate stablecoin yield projections across Solana DeFi protocols. Compare pool returns over time with interactive charts.",
};

export const revalidate = 300;

async function SimulatorData() {
  let yields = await fetchYields().catch(() => []);
  return <SimulatorShell yields={yields} />;
}

function SimulatorSkeleton() {
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

export default function SimulatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Suspense fallback={<SimulatorSkeleton />}>
        <SimulatorData />
      </Suspense>
    </div>
  );
}
