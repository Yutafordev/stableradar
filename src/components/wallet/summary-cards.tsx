import { WalletAnalysis } from "@/lib/types";
import { formatNumber } from "@/lib/format";

interface SummaryCardsProps {
  analysis: WalletAnalysis;
}

export function SummaryCards({ analysis }: SummaryCardsProps) {
  const bestApy = Math.max(
    ...analysis.yieldMatches
      .map((m) => m.bestPool?.apy ?? 0)
      .filter((a) => a > 0),
    0
  );

  const riskLabel =
    analysis.avgRiskScore <= 4
      ? "Low"
      : analysis.avgRiskScore <= 8
        ? "Medium"
        : "High";

  const riskColor =
    analysis.avgRiskScore <= 4
      ? "text-emerald-400"
      : analysis.avgRiskScore <= 8
        ? "text-amber-400"
        : "text-red-400";

  const cards = [
    {
      label: "Total Stablecoin Value",
      value: formatNumber(analysis.totalUsdValue),
      sub: `${analysis.solBalance.toFixed(4)} SOL in wallet`,
    },
    {
      label: "Stablecoins Held",
      value: String(analysis.positions.length),
      sub: [...new Set(analysis.positions.map((p) => p.symbol))].join(", "),
    },
    {
      label: "Best APY Available",
      value: bestApy > 0 ? `${bestApy.toFixed(2)}%` : "—",
      sub: bestApy > 0 ? "across matching pools" : "no yield pools found",
    },
    {
      label: "Avg Risk Level",
      value: riskLabel,
      valueColor: riskColor,
      sub: `Score: ${analysis.avgRiskScore}/15`,
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
            className={`text-xl font-bold mt-1 ${
              "valueColor" in c ? c.valueColor : ""
            }`}
          >
            {c.value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
