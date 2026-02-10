import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchYields } from "@/lib/fetchers/defillama";
import { CompareShell } from "@/components/compare/compare-shell";

export const metadata: Metadata = {
  title: "Compare Pools - StableRadar",
  description:
    "Compare stablecoin yield pools side by side. Analyze APY, TVL, risk scores, and protocol details with radar charts.",
};

export const revalidate = 300;

async function CompareData() {
  const yields = await fetchYields().catch(() => []);
  return <CompareShell yields={yields} />;
}

function CompareSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-[60px] rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-[400px] rounded-lg" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Suspense fallback={<CompareSkeleton />}>
        <CompareData />
      </Suspense>
    </div>
  );
}
