import { CorrelationShell } from "@/components/correlation/correlation-shell";

export const metadata = {
  title: "Yield Correlation Matrix | StableRadar",
  description: "Interactive heatmap showing yield correlation between Solana stablecoin pools.",
};

export default function CorrelationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Yield Correlation Matrix</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize how pool yields move together. Red indicates correlated yields, blue indicates uncorrelated.
          Diversify across uncorrelated pools for better risk-adjusted returns.
        </p>
      </div>
      <CorrelationShell />
    </div>
  );
}
