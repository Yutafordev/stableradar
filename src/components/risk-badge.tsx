import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "@/lib/types";

const riskConfig: Record<
  RiskLevel,
  { label: string; className: string }
> = {
  low: {
    label: "Low Risk",
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
  },
  medium: {
    label: "Medium",
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
  },
  high: {
    label: "High Risk",
    className:
      "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
  },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config = riskConfig[level];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
