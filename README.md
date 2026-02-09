# StableRadar

**Real-time Stablecoin Yield & Borrow Intelligence for Solana**

StableRadar aggregates real-time data from 15+ Solana DeFi protocols to help users find the best stablecoin yields, compare borrowing rates, and monitor risk — all in one dashboard.

**Live Demo:** [stableradar.vercel.app](https://stableradar.vercel.app)

## Features

### Yield Finder
- Scans all major Solana protocols for stablecoin deposit opportunities
- Supports USDC, USDT, PYUSD, USDS, USDe, USDY, DAI
- Filter by token, sort by APY/TVL/Risk
- Multi-factor risk scoring for each pool

### Borrow Optimizer
- Compares stablecoin borrowing rates across lending protocols
- Shows supply APY, estimated borrow APY, max LTV
- Identifies the cheapest borrowing options with risk context

### Protocol Overview
- Per-protocol summary cards with best APY, total TVL, pool count
- Category labels (Lending, DEX/LP, RWA, Yield Aggregator)

### Risk Alerts
- Detects unusually high APYs (potential rug risk or temporary incentives)
- Low TVL warnings for pools with high yield but low liquidity
- Rate spike/drop detection vs 30-day moving average
- Severity levels: Low, Medium, High

### Risk Scoring Engine
Each pool is scored on multiple factors:
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
│   │   ├── page.tsx                # Main dashboard (Server Component)
│   │   ├── layout.tsx              # Root layout (dark theme)
│   │   └── api/
│   │       ├── yields/route.ts     # GET /api/yields
│   │       ├── borrow/route.ts     # GET /api/borrow
│   │       └── alerts/route.ts     # GET /api/alerts
│   ├── components/
│   │   ├── yield-table.tsx         # Sortable yield comparison table
│   │   ├── borrow-table.tsx        # Borrow rate comparison
│   │   ├── protocol-overview.tsx   # Per-protocol summary cards
│   │   ├── risk-badge.tsx          # Risk level badges
│   │   ├── stats-cards.tsx         # Top-level dashboard stats
│   │   ├── alerts-panel.tsx        # Risk alert feed
│   │   └── ui/                     # shadcn/ui components
│   └── lib/
│       ├── fetchers/
│       │   └── defillama.ts        # DeFi Llama pool aggregation
│       ├── risk-scorer.ts          # Multi-factor risk engine
│       └── types.ts                # TypeScript interfaces
```

## Data Sources

- **DeFi Llama** — Primary data source for pool yields, TVL, and protocol metadata
- Covers: Kamino Lend, Kamino Liquidity, Save (Solend), Loopscale, Orca DEX, Raydium AMM/CLMM, Ondo Finance, Francium, Wasabi, Carrot Liquidity, and more

## API Endpoints

### GET /api/yields
Returns stablecoin yield opportunities sorted by APY.

Query params:
- `token` — Filter by token (USDC, USDT, PYUSD, etc.)
- `protocol` — Filter by protocol name
- `minTvl` — Minimum TVL threshold
- `sortBy` — Sort by `apy` (default), `tvl`, or `risk`
- `limit` — Max results (default: 100)

### GET /api/borrow
Returns stablecoin borrowing rates from lending protocols.

Query params:
- `token` — Filter by borrow token
- `protocol` — Filter by protocol
- `sortBy` — Sort by `borrowApy` (default), `supplyApy`, or `tvl`

### GET /api/alerts
Returns active risk alerts for monitored pools.

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

Open [http://localhost:3000](http://localhost:3000).

No API keys required — DeFi Llama APIs are public.

## Solana Integration

StableRadar reads real-time stablecoin yield and lending data from all major Solana DeFi protocols via DeFi Llama's aggregated pool data. This includes on-chain program states from:

- **Kamino Lend** — Supply APYs for USDC, USDT, PYUSD, USDS
- **Save (formerly Solend)** — Lending pool rates and TVL
- **Loopscale** — Lending rates across stablecoin reserves
- **Orca DEX** — Concentrated liquidity pool yields
- **Raydium AMM/CLMM** — LP pool yields for stable pairs
- **Kamino Liquidity** — Automated liquidity management vaults
- **Ondo Finance** — Real-world asset yields (USDY)
- And 8+ additional protocols

The risk scoring engine evaluates protocol-specific factors including smart contract audit status, protocol age on Solana, TVL depth, and historical rate stability.

## Built For

[Colosseum Agent Hackathon 2026](https://colosseum.com/agent-hackathon) — Built autonomously by an AI agent.

## License

MIT
