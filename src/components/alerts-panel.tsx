"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RiskAlert } from "@/lib/types";

const alertIcons: Record<string, string> = {
  high_apy: "APY",
  low_tvl: "TVL",
  rate_spike: "RATE",
  high_utilization: "UTIL",
  tvl_drop: "DROP",
};

const severityStyles: Record<string, string> = {
  high: "border-red-500/30 bg-red-500/5",
  medium: "border-amber-500/30 bg-amber-500/5",
  low: "border-blue-500/30 bg-blue-500/5",
};

export function AlertsPanel({ alerts }: { alerts: RiskAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <p className="text-emerald-400 font-medium">All clear</p>
        <p className="text-sm text-muted-foreground mt-1">
          No risk alerts detected across monitored pools
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          className={severityStyles[alert.severity]}
        >
          <div className="flex items-start gap-3">
            <span
              className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${
                alert.severity === "high"
                  ? "bg-red-500/20 text-red-400"
                  : alert.severity === "medium"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {alertIcons[alert.type] || "ALERT"}
            </span>
            <div className="flex-1 min-w-0">
              <AlertTitle className="text-sm font-medium leading-tight">
                {alert.protocol} — {alert.symbol}
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground mt-1">
                {alert.message}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
