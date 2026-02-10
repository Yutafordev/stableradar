import { PortfolioSummary } from "@/lib/types";
import { formatNumber } from "@/lib/format";

interface PortfolioSummaryCardsProps {
  summary: PortfolioSummary;
}

export function PortfolioSummaryCards({ summary }: PortfolioSummaryCardsProps) {
  const optimizationPotential = summary.positionDetails.reduce(
    (sum, d) => sum + d.betterPoolGain,
    0
  );

  const cards = [
    {
      label: "Portfolio Value",
      value: formatNumber(summary.totalValue),
      sub: `${summary.positions.length} position${summary.positions.length !== 1 ? "s" : ""}`,
    },
    {
      label: "Weighted Avg APY",
      value: `${summary.weightedAvgApy.toFixed(2)}%`,
      valueColor: "text-emerald-400",
      sub: "across all positions",
    },
    {
      label: "Est. Annual Yield",
      value: formatNumber(summary.totalAnnualYield),
      valueColor: "text-emerald-400",
      sub: "at current rates",
    },
    {
      label: "Optimization Potential",
      value: optimizationPotential > 0 ? `+${formatNumber(optimizationPotential)}/yr` : "Optimal",
      valueColor: optimizationPotential > 0 ? "text-amber-400" : "text-emerald-400",
      sub: optimizationPotential > 0
        ? `${summary.positionDetails.filter((d) => d.betterPool).length} pool${summary.positionDetails.filter((d) => d.betterPool).length !== 1 ? "s" : ""} can be improved`
        : "no better pools found",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-border/50 bg-card/30 p-4"
        >
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {c.label}
          </p>
          <p
            className={`text-xl font-bold mt-1 ${"valueColor" in c ? c.valueColor : ""}`}
          >
            {c.value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
