import { RebalanceShell } from "@/components/rebalance/rebalance-shell";

export const metadata = {
  title: "Auto-Rebalance Advisor | StableRadar",
  description: "Get AI-powered recommendations to optimize your stablecoin portfolio allocation across Solana DeFi protocols.",
};

export default function RebalancePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Auto-Rebalance Advisor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Input your current allocation and get optimized move recommendations.
          Not financial advice — always do your own research.
        </p>
      </div>
      <RebalanceShell />
    </div>
  );
}
