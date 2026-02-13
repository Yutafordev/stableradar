import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Guide - StableRadar",
  description:
    "Learn how to use StableRadar: understand stablecoin yields, risk scoring, DeFi terminology, and our public API.",
};

const sections = [
  { id: "dashboard", label: "Reading the Dashboard" },
  { id: "apy", label: "Understanding APY" },
  { id: "risk", label: "Risk Scoring" },
  { id: "strategies", label: "Strategy Types" },
  { id: "glossary", label: "DeFi Glossary" },
  { id: "api", label: "API Reference" },
];

const glossaryTerms = [
  { term: "APY", definition: "Annual Percentage Yield — the effective annual rate of return accounting for compound interest." },
  { term: "APR", definition: "Annual Percentage Rate — the simple interest rate without compounding." },
  { term: "TVL", definition: "Total Value Locked — the total amount of assets deposited in a protocol or pool." },
  { term: "Impermanent Loss (IL)", definition: "Potential loss from providing liquidity to an AMM when asset prices diverge." },
  { term: "Liquidity Pool", definition: "A pool of tokens locked in a smart contract used for decentralized trading." },
  { term: "Lending", definition: "Depositing assets into a protocol to earn interest from borrowers." },
  { term: "Borrowing", definition: "Taking a loan by providing collateral — you pay interest to lenders." },
  { term: "LTV", definition: "Loan-to-Value ratio — the maximum amount you can borrow relative to your collateral." },
  { term: "Utilization Rate", definition: "The percentage of deposited assets currently being borrowed." },
  { term: "Stablecoin", definition: "A cryptocurrency pegged to a stable asset like USD, EUR, or CHF." },
  { term: "DEX", definition: "Decentralized Exchange — a platform for trading tokens without intermediaries." },
  { term: "AMM", definition: "Automated Market Maker — an algorithm that prices assets in a liquidity pool." },
  { term: "CLMM", definition: "Concentrated Liquidity Market Maker — an AMM where LPs provide liquidity in specific price ranges." },
  { term: "Smart Contract", definition: "Self-executing code on a blockchain that enforces rules without intermediaries." },
  { term: "Audit", definition: "A third-party security review of a protocol's smart contracts." },
  { term: "Protocol", definition: "A DeFi application or set of smart contracts (e.g., Kamino, Orca, Raydium)." },
  { term: "Yield Farming", definition: "Maximizing returns by moving assets between protocols to capture the best yields." },
  { term: "Peg", definition: "The target value a stablecoin aims to maintain (e.g., 1 USDC = $1 USD)." },
  { term: "Sigma", definition: "Statistical measure of return volatility — higher sigma means more variable yields." },
  { term: "Base APY", definition: "The organic yield from lending interest or LP fees, excluding token rewards." },
  { term: "Reward APY", definition: "Additional yield from token incentives (e.g., governance token emissions)." },
];

const apiEndpoints = [
  {
    method: "GET",
    path: "/api/yields",
    description: "Returns all stablecoin yield opportunities sorted by APY.",
    params: "token, protocol, minTvl, sortBy (apy|tvl|risk), limit",
    example: "curl https://stableradar.vercel.app/api/yields?token=USDC&limit=10",
  },
  {
    method: "GET",
    path: "/api/borrow",
    description: "Returns stablecoin borrowing rates from lending protocols.",
    params: "token, protocol, sortBy (borrowApy|supplyApy|tvl)",
    example: "curl https://stableradar.vercel.app/api/borrow?token=USDT",
  },
  {
    method: "GET",
    path: "/api/alerts",
    description: "Returns active risk alerts for monitored pools.",
    params: "None",
    example: "curl https://stableradar.vercel.app/api/alerts",
  },
  {
    method: "GET",
    path: "/api/strategies",
    description: "Returns AI-generated yield strategies based on current market conditions.",
    params: "None",
    example: "curl https://stableradar.vercel.app/api/strategies",
  },
  {
    method: "GET",
    path: "/api/snapshot",
    description: "Returns complete market overview in a single call.",
    params: "None",
    example: "curl https://stableradar.vercel.app/api/snapshot",
  },
  {
    method: "GET",
    path: "/api/agent/recommend",
    description: "Agent-optimized pool recommendations filtered by risk profile.",
    params: "risk (low|medium|high), token, amount, minTvl, excludeProtocols",
    example: "curl https://stableradar.vercel.app/api/agent/recommend?risk=low&token=USDC",
  },
  {
    method: "GET",
    path: "/api/health",
    description: "Returns protocol health grades (A-F) based on TVL, diversity, and stability.",
    params: "None",
    example: "curl https://stableradar.vercel.app/api/health",
  },
  {
    method: "GET",
    path: "/api/depeg",
    description: "Returns stablecoin peg data with stability scores and deviation alerts.",
    params: "None",
    example: "curl https://stableradar.vercel.app/api/depeg",
  },
  {
    method: "GET",
    path: "/api/correlation",
    description: "Returns yield correlation matrix showing pool similarity for diversification.",
    params: "None",
    example: "curl https://stableradar.vercel.app/api/correlation",
  },
  {
    method: "GET",
    path: "/api/market",
    description: "Returns Solana market overview with TVL, top protocols, and historical data.",
    params: "None",
    example: "curl https://stableradar.vercel.app/api/market",
  },
  {
    method: "GET",
    path: "/api/rebalance",
    description: "Returns portfolio optimization recommendations with move-by-move suggestions.",
    params: "None",
    example: "curl https://stableradar.vercel.app/api/rebalance",
  },
  {
    method: "GET",
    path: "/api/chart/:poolId",
    description: "Returns 30-day APY history for a specific pool.",
    params: "poolId (dynamic route parameter)",
    example: "curl https://stableradar.vercel.app/api/chart/POOL_ID",
  },
  {
    method: "GET",
    path: "/api/wallet",
    description: "Returns wallet analysis matching Solana holdings to yield opportunities.",
    params: "address (Solana wallet address)",
    example: "curl https://stableradar.vercel.app/api/wallet?address=YOUR_ADDRESS",
  },
];

const riskFactors = [
  {
    name: "TVL Depth",
    maxScore: 3,
    levels: [
      { range: ">$100M", score: "0", risk: "Minimal" },
      { range: "$50-100M", score: "0.5", risk: "Low" },
      { range: "$10-50M", score: "1", risk: "Moderate" },
      { range: "$1-10M", score: "2", risk: "Elevated" },
      { range: "<$1M", score: "3", risk: "High" },
    ],
  },
  {
    name: "Protocol Age",
    maxScore: 3,
    levels: [
      { range: "12+ months", score: "0", risk: "Battle-tested" },
      { range: "6-12 months", score: "1", risk: "Established" },
      { range: "3-6 months", score: "2", risk: "New" },
      { range: "<3 months", score: "3", risk: "Very new" },
    ],
  },
  {
    name: "Audit Status",
    maxScore: 2,
    levels: [
      { range: "Audited", score: "0", risk: "Verified" },
      { range: "Not audited", score: "2", risk: "Unverified" },
    ],
  },
  {
    name: "APY Level",
    maxScore: 3,
    levels: [
      { range: "<15%", score: "0", risk: "Normal" },
      { range: "15-25%", score: "1", risk: "Above average" },
      { range: "25-50%", score: "2", risk: "High" },
      { range: ">50%", score: "3", risk: "Extreme" },
    ],
  },
  {
    name: "Utilization Rate",
    maxScore: 3,
    levels: [
      { range: "<75%", score: "0", risk: "Healthy" },
      { range: "75-85%", score: "0.5", risk: "Moderate" },
      { range: "85-95%", score: "1.5", risk: "High" },
      { range: ">95%", score: "3", risk: "Withdrawal risk" },
    ],
  },
  {
    name: "IL Risk",
    maxScore: 1,
    levels: [
      { range: "Single asset", score: "0", risk: "No IL" },
      { range: "LP pool", score: "1", risk: "IL exposure" },
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          How to Use StableRadar
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Your guide to reading stablecoin yields, understanding risk scores,
          and making informed decisions across Solana DeFi protocols.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs px-3 py-1.5 rounded-md bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
        {/* Sticky sidebar TOC (desktop) */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              On this page
            </p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="space-y-8">
          {/* Section: Reading the Dashboard */}
          <section id="dashboard">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-xl">Reading the Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Market Conditions Banner</h3>
                  <p className="text-sm text-muted-foreground">
                    The top banner shows the current market state: <strong>Normal Market</strong>,{" "}
                    <strong>Strong Yields</strong> (avg APY &gt; 5%),{" "}
                    <strong>Low Yield</strong> (avg APY &lt; 2%), or{" "}
                    <strong>Elevated Risk</strong> (high yields + many risky pools). It also shows
                    total TVL, average APY, best safe yield, and active high alerts.
                  </p>
                </div>
                <Separator className="bg-border/30" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">Stats Cards</h3>
                  <p className="text-sm text-muted-foreground">
                    Six cards at the top summarize: <strong>Best APY</strong> (highest low-risk yield),{" "}
                    <strong>Average APY</strong> (across all pools), <strong>Total TVL</strong>,{" "}
                    <strong>Protocols</strong> (number tracked), <strong>Pools</strong> (total stablecoin pools),{" "}
                    and <strong>Alerts</strong> (active risk alerts).
                  </p>
                </div>
                <Separator className="bg-border/30" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">Token Filters & Sorting</h3>
                  <p className="text-sm text-muted-foreground">
                    In the Yield Finder, use the token buttons to filter by stablecoin (USDC, USDT, EURC, etc.).
                    Use the currency buttons (USD, EUR, CHF...) to filter by peg currency.
                    Sort by APY, TVL, or Risk using the sort buttons.
                    Click any row to expand it and see detailed risk breakdown, yield info, and protocol details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section: Understanding APY */}
          <section id="apy">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-xl">Understanding APY</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">What is APY?</h3>
                  <p className="text-sm text-muted-foreground">
                    APY (Annual Percentage Yield) is the effective annual rate of return
                    on your deposit, accounting for compound interest. A pool showing 5% APY
                    means $10,000 deposited would grow to ~$10,500 in one year, assuming the rate stays constant.
                  </p>
                </div>
                <Separator className="bg-border/30" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">Base APY vs Reward APY</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Base APY</strong> comes from organic sources — lending interest or LP trading fees.
                    This is generally more sustainable.{" "}
                    <strong>Reward APY</strong> comes from token incentives (e.g., governance token emissions).
                    These rewards often decrease over time as incentive programs end.
                  </p>
                </div>
                <Separator className="bg-border/30" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">7-Day & 30-Day Averages</h3>
                  <p className="text-sm text-muted-foreground">
                    Current APY can spike or drop due to temporary conditions. The <strong>30-day average</strong>{" "}
                    shows the mean APY over the past month — a more reliable indicator.
                    If current APY is{" "}
                    <span className="text-emerald-400">green</span> (above average), the pool is performing well.
                    If <span className="text-red-400">red</span> (below average), yields may be declining.
                  </p>
                </div>
                <Separator className="bg-border/30" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">Why Does APY Fluctuate?</h3>
                  <p className="text-sm text-muted-foreground">
                    Stablecoin yields change based on supply/demand dynamics. When more people deposit,
                    yields decrease (more supply). When borrowing demand increases, yields rise.
                    Market events, new incentive programs, and protocol changes also cause fluctuations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section: Risk Scoring */}
          <section id="risk">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-xl">Risk Scoring Explained</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Every pool is scored on a scale of 0 to 15 across 6 risk factors.
                  Lower scores mean lower risk.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Low (0-2.5)
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                    Medium (2.5-5)
                  </Badge>
                  <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                    High (5+)
                  </Badge>
                </div>

                <Separator className="bg-border/30" />

                {riskFactors.map((factor) => (
                  <div key={factor.name}>
                    <h3 className="text-sm font-semibold mb-2">
                      {factor.name}{" "}
                      <span className="text-muted-foreground font-normal">
                        (max {factor.maxScore} points)
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {factor.levels.map((level) => (
                        <div
                          key={level.range}
                          className="rounded-md border border-border/30 bg-muted/20 p-2"
                        >
                          <p className="text-xs font-mono">{level.range}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Score: {level.score} &mdash; {level.risk}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Separator className="bg-border/30 mt-3" />
                  </div>
                ))}

                <div className="rounded-md border border-border/30 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Example:</strong> A pool on Kamino (18 months old, audited) with $50M TVL,
                    8% APY, and no IL risk would score: TVL 0.5 + Age 0 + Audit 0 + APY 0 + IL 0 ={" "}
                    <strong>0.5</strong> (Low risk).
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section: Strategy Types */}
          <section id="strategies">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-xl">Strategy Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  StableRadar generates four strategy types based on live market data.
                  These are suggestions, not financial advice.
                </p>
                <Separator className="bg-border/30" />
                {[
                  {
                    name: "Safe Harbor",
                    risk: "Low",
                    desc: "The highest-yielding low-risk pool with strong TVL. Best for conservative users who want steady returns without worrying about protocol risk.",
                  },
                  {
                    name: "Diversified Yield",
                    risk: "Medium",
                    desc: "Splits across top pools in different tokens and protocols to reduce single-protocol risk. Balances yield with diversification.",
                  },
                  {
                    name: "Yield Arbitrage",
                    risk: "High",
                    desc: "Borrow stablecoins at a low rate, deposit at a higher rate on another protocol. The spread is your profit. Requires active management and carries liquidation risk.",
                  },
                  {
                    name: "Alpha Hunter",
                    risk: "High",
                    desc: "Targets the highest-yield pools with limited allocation (10% or less of portfolio). High risk, high reward. Monitor frequently and set exit conditions.",
                  },
                ].map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{s.name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          s.risk === "Low"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : s.risk === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }
                      >
                        {s.risk} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                    <Separator className="bg-border/30" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Section: DeFi Glossary */}
          <section id="glossary">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-xl">DeFi Glossary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {glossaryTerms.map((item) => (
                    <div
                      key={item.term}
                      className="rounded-md border border-border/30 bg-muted/20 p-3"
                    >
                      <p className="text-sm font-semibold">{item.term}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section: API Reference */}
          <section id="api">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-xl">API Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  All endpoints are public and require no authentication. Data refreshes every 5 minutes.
                </p>
                {apiEndpoints.map((ep) => (
                  <div key={ep.path}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                        {ep.method}
                      </Badge>
                      <code className="text-sm font-mono">{ep.path}</code>
                    </div>
                    <p className="text-xs text-muted-foreground">{ep.description}</p>
                    {ep.params !== "None" && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Params: <code>{ep.params}</code>
                      </p>
                    )}
                    <div className="mt-1 rounded bg-muted/30 px-3 py-1.5 overflow-x-auto">
                      <code className="text-[11px] text-muted-foreground">{ep.example}</code>
                    </div>
                    <Separator className="bg-border/30 mt-3" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
