# StableRadar

**Real-time Stablecoin Yield & Borrow Intelligence for Solana**

StableRadar aggregates real-time data from 15+ Solana DeFi protocols to help users and agents find the best stablecoin yields, compare borrowing rates, assess risk, and generate allocation strategies — all in one dashboard with a public API.

**Live Demo:** [stableradar.vercel.app](https://stableradar.vercel.app)

## Features

### Market Conditions Banner
- Real-time market assessment (Normal, Strong Yields, Low Yield, Elevated Risk)
- Quick-glance metrics: total TVL, avg APY, best safe yield, high alert count

### Yield Finder
- 110+ stablecoin pools across 15+ Solana protocols
- Supports USDC, USDT, PYUSD, USDS, USDe, USDY, DAI
- Filter by token, sort by APY/TVL/Risk/Smart Rank (Sharpe ratio)
- 30-day average APY trend indicator (green = above avg, red = below)
- Multi-factor risk scoring for each pool
- Expandable row with risk breakdown, yield details, and APY history chart
- Favorites/Watchlist — star pools to track them, filter by watchlist (persisted in localStorage)

### Top Movers
- Highlights pools with the biggest APY changes vs their 30-day average
- Shows absolute and percentage change with directional indicators
- Filters to high-TVL pools (>$500K) to avoid noise

### APY History Chart
- 30-day APY trend line for any pool (click to expand in Yield Finder)
- Powered by DeFi Llama chart data via `/api/chart/[poolId]`

### Borrow Optimizer
- Compares stablecoin borrowing rates across lending protocols
- Shows supply APY, estimated borrow APY, max LTV, and supply-borrow spread
- Identifies the cheapest borrowing options with risk context

### Yield Visualization
- **Top Yields Chart** — Bar chart of top 12 pools by APY with color-coded tokens
- **Risk vs. Yield Map** — Aggregated stats per risk level (low/medium/high) showing avg APY, TVL, and top pool

### Token Breakdown
- Per-stablecoin summary cards with gradient styling
- Best APY, total TVL, and pool count for each token

### Strategy Engine
AI-generated yield strategies based on live market data:
- **Safe Harbor** — Best low-risk yield with strong TVL
- **Diversified Yield** — Multi-token split across protocols
- **Yield Arbitrage** — Borrow cheap, deposit at higher rates
- **Alpha Hunter** — High-yield opportunities with position sizing guidance

### Protocol Overview
- Per-protocol summary cards with best APY, total TVL, pool count
- Category labels (Lending, DEX/LP, RWA, Yield Aggregator, Bridge)

### Risk Alerts
- Detects unusually high APYs (potential rug risk or temporary incentives)
- Low TVL warnings for pools with high yield but low liquidity
- Rate spike/drop detection vs 30-day moving average
- Severity levels: Low, Medium, High

### Risk Scoring Engine
Each pool is scored on 5 factors:
- **TVL** — Higher TVL = lower risk ($100M+ = safe, <$1M = elevated)
- **Protocol maturity** — Newer protocols score higher risk
- **Audit status** — Unaudited protocols get a risk penalty
- **APY level** — Stablecoin pools above 15-25% APY trigger warnings
- **IL risk** — Impermanent loss exposure from pool composition

## Architecture

```
stableradar/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Main dashboard (Server Component)
│   │   ├── layout.tsx                # Root layout (dark theme, SEO)
│   │   ├── opengraph-image/route.tsx # Dynamic OG social card
│   │   └── api/
│   │       ├── yields/route.ts       # GET /api/yields
│   │       ├── borrow/route.ts       # GET /api/borrow
│   │       ├── alerts/route.ts       # GET /api/alerts
│   │       ├── strategies/route.ts   # GET /api/strategies
│   │       ├── snapshot/route.ts     # GET /api/snapshot
│   │       ├── chart/[poolId]/route.ts # GET /api/chart/:poolId
│   │       └── agent/recommend/route.ts # GET|POST /api/agent/recommend
│   ├── components/
│   │   ├── market-banner.tsx         # Market conditions banner
│   │   ├── yield-table.tsx           # Sortable yield table with 30d avg + watchlist
│   │   ├── yield-chart.tsx           # Bar chart + Risk vs Yield map
│   │   ├── top-movers.tsx            # Top APY movers vs 30d average
│   │   ├── apy-history-chart.tsx     # 30-day APY trend sparkline
│   │   ├── borrow-table.tsx          # Borrow rate comparison with spread
│   │   ├── token-breakdown.tsx       # Per-token summary cards
│   │   ├── protocol-overview.tsx     # Per-protocol summary cards
│   │   ├── strategy-panel.tsx        # AI strategy suggestions
│   │   ├── risk-badge.tsx            # Risk level badges
│   │   ├── stats-cards.tsx           # Dashboard stats
│   │   ├── alerts-panel.tsx          # Risk alert feed
│   │   └── ui/                       # shadcn/ui components
│   └── lib/
│       ├── fetchers/
│       │   └── defillama.ts          # DeFi Llama pool aggregation + cache
│       ├── hooks/
│       │   └── use-favorites.ts      # Favorites/watchlist hook (localStorage)
│       ├── token-colors.ts           # Shared token color map
│       ├── risk-scorer.ts            # Multi-factor risk engine
│       └── types.ts                  # TypeScript interfaces + protocol registry
```

## API Endpoints

All endpoints are public — no authentication required.

### GET /api/yields
Returns stablecoin yield opportunities sorted by APY.

Query params: `token`, `protocol`, `minTvl`, `sortBy` (apy|tvl|risk), `limit`

### GET /api/borrow
Returns stablecoin borrowing rates from lending protocols.

Query params: `token`, `protocol`, `sortBy` (borrowApy|supplyApy|tvl)

### GET /api/alerts
Returns active risk alerts for monitored pools.

### GET /api/strategies
Returns AI-generated yield strategies (conservative, balanced, aggressive).

### GET /api/snapshot
Returns complete market overview in a single call: TVL, avg APY, best yields, cheapest borrow, risk distribution, and per-token breakdown.

### GET /api/chart/:poolId
Returns 30-day historical APY and TVL data for a specific pool from DeFi Llama.

### GET /api/agent/recommend
AI-powered pool recommendations scored by risk alignment, TVL depth, yield stability, and protocol maturity.

Query params: `risk` (low|medium|high), `token`, `amount`, `minTvl`, `excludeProtocols`

Also supports POST with JSON body for the same parameters.

## Data Sources

- **DeFi Llama** — Primary data source for pool yields, TVL, and protocol metadata
- Covers: Kamino Lend, Kamino Liquidity, Save (Solend), Loopscale, Orca DEX, Raydium AMM/CLMM, Meteora, Drift, Ondo Finance, Allbridge, Francium, Wasabi, Lulo, and more

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **UI:** shadcn/ui + Tailwind CSS v4
- **Language:** TypeScript
- **Data:** DeFi Llama REST API with 5-minute in-memory cache
- **Deployment:** Vercel

## Run Locally

```bash
git clone https://github.com/Yutafordev/stableradar.git
cd stableradar
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No API keys required.

## Solana Integration

StableRadar reads real-time stablecoin yield and lending data from 15+ Solana DeFi protocols via DeFi Llama's aggregated on-chain data:

- **Kamino Lend** — Supply APYs for USDC, USDT, PYUSD, USDS
- **Save (formerly Solend)** — Lending pool rates and TVL
- **Loopscale** — Lending rates across stablecoin reserves
- **Orca DEX** — Concentrated liquidity pool yields
- **Raydium AMM/CLMM** — LP pool yields for stable pairs
- **Kamino Liquidity** — Automated liquidity management vaults
- **Meteora** — DEX LP yields
- **Drift** — Perps/lending rates
- **Ondo Finance** — Real-world asset yields (USDY)
- **Allbridge** — Bridge liquidity pool yields
- **Francium, Wasabi, Lulo** — Additional lending/yield protocols

The risk scoring engine evaluates protocol-specific factors including smart contract audit status, protocol age on Solana, TVL depth, and historical rate stability (30-day average comparison).

## Built For

[Colosseum Agent Hackathon 2026](https://colosseum.com/agent-hackathon) — Built autonomously by an AI agent.

## License

MIT
