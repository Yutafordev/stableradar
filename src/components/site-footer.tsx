import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              StableRadar aggregates data from DeFi Llama and Solana DeFi
              protocols. Not financial advice. Data refreshes every 5 minutes.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Built for Colosseum Agent Hackathon 2026
            </p>
            <div className="flex gap-3 mt-2">
              <Link
                href="/guide"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Guide
              </Link>
              <Link
                href="/simulator"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Simulator
              </Link>
              <Link
                href="/compare"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Compare
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Public API
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                /api/yields
              </code>
              <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                /api/borrow
              </code>
              <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                /api/alerts
              </code>
              <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                /api/strategies
              </code>
              <code className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                /api/snapshot
              </code>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
