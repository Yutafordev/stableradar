import { Card, CardContent } from "@/components/ui/card";
import { ProtocolHealth } from "@/lib/types";

function gradeColor(grade: string): string {
  switch (grade) {
    case "A": return "from-emerald-500 to-emerald-600";
    case "B": return "from-blue-500 to-blue-600";
    case "C": return "from-yellow-500 to-yellow-600";
    case "D": return "from-orange-500 to-orange-600";
    case "F": return "from-red-500 to-red-600";
    default: return "from-gray-500 to-gray-600";
  }
}

function gradeBg(grade: string): string {
  switch (grade) {
    case "A": return "border-emerald-500/30 bg-emerald-500/5";
    case "B": return "border-blue-500/30 bg-blue-500/5";
    case "C": return "border-yellow-500/30 bg-yellow-500/5";
    case "D": return "border-orange-500/30 bg-orange-500/5";
    case "F": return "border-red-500/30 bg-red-500/5";
    default: return "border-border/50 bg-card/30";
  }
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500/70 to-emerald-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-muted-foreground w-8 text-right">
        {value}/{max}
      </span>
    </div>
  );
}

function formatTvl(tvl: number): string {
  if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`;
  if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`;
  return `$${(tvl / 1e3).toFixed(0)}K`;
}

export function ProtocolHealthGrid({ health }: { health: ProtocolHealth[] }) {
  if (health.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No protocol health data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {health.map((h) => (
        <Card key={h.slug} className={`border ${gradeBg(h.grade)} transition-colors hover:border-border`}>
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">{h.protocol}</h3>
                <span className="text-[11px] text-muted-foreground">{h.category}</span>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradeColor(h.grade)} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{h.grade}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 mb-3 text-xs">
              <div>
                <span className="text-muted-foreground">TVL</span>
                <p className="font-medium">{formatTvl(h.totalTvl)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Pools</span>
                <p className="font-medium">{h.poolCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Avg APY</span>
                <p className="font-medium">{h.avgApy.toFixed(1)}%</p>
              </div>
              <div className="ml-auto">
                <span className="text-muted-foreground">Score</span>
                <p className="font-bold text-base">{h.score}</p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="space-y-1.5">
              <ScoreBar label="TVL Depth" value={h.tvlDepth} max={25} />
              <ScoreBar label="Diversity" value={h.poolDiversity} max={15} />
              <ScoreBar label="Stability" value={h.apyStability} max={20} />
              <ScoreBar label="Audit" value={h.auditScore} max={15} />
              <ScoreBar label="Maturity" value={h.maturityScore} max={15} />
              <ScoreBar label="Yield" value={h.yieldCompetitiveness} max={10} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
