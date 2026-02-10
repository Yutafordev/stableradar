import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { YieldOpportunity } from "@/lib/types";

function formatApy(value: number): string {
  return value >= 10 ? `${value.toFixed(0)}%` : `${value.toFixed(1)}%`;
}

function apyColor(apy: number): string {
  if (apy >= 15) return "bg-emerald-500 text-white";
  if (apy >= 10) return "bg-emerald-500/80 text-white";
  if (apy >= 7) return "bg-emerald-500/60 text-white";
  if (apy >= 5) return "bg-emerald-500/40 text-emerald-100";
  if (apy >= 3) return "bg-emerald-500/25 text-emerald-200";
  if (apy > 0) return "bg-emerald-500/15 text-emerald-300";
  return "bg-muted/30 text-muted-foreground";
}

export function ProtocolHeatmap({ yields }: { yields: YieldOpportunity[] }) {
  // Build matrix: protocol → token → best APY
  const protocolMap = new Map<string, Map<string, number>>();
  const tokenSet = new Set<string>();

  yields.forEach((y) => {
    tokenSet.add(y.token);
    if (!protocolMap.has(y.protocol)) {
      protocolMap.set(y.protocol, new Map());
    }
    const existing = protocolMap.get(y.protocol)!.get(y.token) ?? 0;
    if (y.apy > existing) {
      protocolMap.get(y.protocol)!.set(y.token, y.apy);
    }
  });

  // Sort protocols by total TVL (approximate via number of pools)
  const protocols = [...protocolMap.keys()].sort((a, b) => {
    const aTvl = yields
      .filter((y) => y.protocol === a)
      .reduce((s, y) => s + y.tvl, 0);
    const bTvl = yields
      .filter((y) => y.protocol === b)
      .reduce((s, y) => s + y.tvl, 0);
    return bTvl - aTvl;
  });

  // Only keep tokens that appear in at least 2 protocols
  const tokens = [...tokenSet]
    .filter((t) => {
      let count = 0;
      protocolMap.forEach((tm) => { if (tm.has(t)) count++; });
      return count >= 2;
    })
    .sort();

  if (protocols.length === 0 || tokens.length === 0) return null;

  return (
    <Card className="mt-4 border-border/50 bg-card/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Protocol APY Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left font-medium text-muted-foreground py-1.5 pr-3 min-w-[120px]">
                Protocol
              </th>
              {tokens.map((t) => (
                <th
                  key={t}
                  className="text-center font-medium text-muted-foreground py-1.5 px-1.5 min-w-[64px]"
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {protocols.map((proto) => (
              <tr key={proto} className="border-t border-border/20">
                <td className="py-1.5 pr-3 font-medium truncate max-w-[140px]">
                  {proto}
                </td>
                {tokens.map((token) => {
                  const apy = protocolMap.get(proto)?.get(token);
                  return (
                    <td key={token} className="py-1.5 px-1">
                      {apy !== undefined ? (
                        <div
                          className={`rounded px-2 py-1 text-center font-mono text-[11px] ${apyColor(apy)}`}
                        >
                          {formatApy(apy)}
                        </div>
                      ) : (
                        <div className="rounded px-2 py-1 text-center text-[11px] bg-muted/10 text-muted-foreground/40">
                          —
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
          <span className="text-[10px] text-muted-foreground">Low APY</span>
          <div className="flex gap-0.5">
            {[
              "bg-emerald-500/15",
              "bg-emerald-500/25",
              "bg-emerald-500/40",
              "bg-emerald-500/60",
              "bg-emerald-500/80",
              "bg-emerald-500",
            ].map((c, i) => (
              <div key={i} className={`w-6 h-3 rounded-sm ${c}`} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">High APY</span>
        </div>
      </CardContent>
    </Card>
  );
}
