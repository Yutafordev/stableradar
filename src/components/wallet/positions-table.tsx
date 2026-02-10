import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WalletYieldMatch } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const tokenColors: Record<string, string> = {
  USDC: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  USDT: "bg-green-500/10 text-green-400 border-green-500/20",
  PYUSD: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  USDS: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  DAI: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  EURC: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

interface PositionsTableProps {
  yieldMatches: WalletYieldMatch[];
}

export function PositionsTable({ yieldMatches }: PositionsTableProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Stablecoin Positions
      </h3>
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Token
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                Balance
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                Value
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-center hidden sm:table-cell">
                Peg
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                Best APY
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right hidden md:table-cell">
                Potential Yield/yr
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {yieldMatches.map((m) => (
              <TableRow
                key={m.position.account}
                className="border-border/30"
              >
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      tokenColors[m.position.symbol] ||
                      "bg-muted text-muted-foreground"
                    }
                  >
                    {m.position.symbol}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {m.position.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(m.position.usdValue)}
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground hidden sm:table-cell">
                  {m.position.pegCurrency}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-400">
                  {m.bestPool ? `${m.bestPool.apy.toFixed(2)}%` : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-400/70 hidden md:table-cell">
                  {m.potentialAnnualYield > 0
                    ? formatNumber(m.potentialAnnualYield)
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
