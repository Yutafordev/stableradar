import {
  SolanaMarketData,
  ProtocolSummary,
  TvlDataPoint,
  CategoryBreakdown,
} from "../types";

const CHAINS_URL = "https://api.llama.fi/v2/chains";
const PROTOCOLS_URL = "https://api.llama.fi/protocols";
const TVL_HISTORY_URL = "https://api.llama.fi/v2/historicalChainTvl/Solana";

let cachedData: SolanaMarketData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface LlamaChain {
  name: string;
  tvl: number;
  tokenSymbol?: string;
  gecko_id?: string;
}

interface LlamaProtocol {
  name: string;
  slug: string;
  tvl: number;
  category: string;
  change_1d: number | null;
  change_7d: number | null;
  chains: string[];
  chainTvls?: Record<string, number>;
  logo: string;
}

interface LlamaTvlPoint {
  date: number;
  tvl: number;
}

export async function fetchSolanaMarket(): Promise<SolanaMarketData> {
  const now = Date.now();
  if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
    return cachedData;
  }

  // Fetch all 3 APIs in parallel
  const [chainsRes, protocolsRes, historyRes] = await Promise.all([
    fetch(CHAINS_URL, { cache: "no-store" }),
    fetch(PROTOCOLS_URL, { cache: "no-store" }),
    fetch(TVL_HISTORY_URL, { cache: "no-store" }),
  ]);

  if (!chainsRes.ok) throw new Error(`Chains API error: ${chainsRes.status}`);
  if (!protocolsRes.ok) throw new Error(`Protocols API error: ${protocolsRes.status}`);
  if (!historyRes.ok) throw new Error(`TVL History API error: ${historyRes.status}`);

  const [chains, protocols, history]: [LlamaChain[], LlamaProtocol[], LlamaTvlPoint[]] =
    await Promise.all([
      chainsRes.json(),
      protocolsRes.json(),
      historyRes.json(),
    ]);

  // 1. Total TVL from chains endpoint
  const solanaChain = chains.find(
    (c) => c.name.toLowerCase() === "solana"
  );
  const totalTvl = solanaChain?.tvl ?? 0;

  // 2. Filter protocols on Solana and sort by TVL
  const solanaProtocols = protocols
    .filter((p) => {
      if (!p.chains || !Array.isArray(p.chains)) return false;
      return p.chains.includes("Solana");
    })
    .map((p) => {
      // Use Solana-specific TVL if available, otherwise total TVL
      const solanaTvl = p.chainTvls?.["Solana"] ?? p.tvl ?? 0;
      return {
        name: p.name,
        slug: p.slug,
        tvl: solanaTvl,
        category: p.category || "Other",
        change1d: typeof p.change_1d === "number" ? Math.round(p.change_1d * 100) / 100 : 0,
        change7d: typeof p.change_7d === "number" ? Math.round(p.change_7d * 100) / 100 : 0,
        logo: p.logo || "",
      } satisfies ProtocolSummary;
    })
    .filter((p) => p.tvl > 0)
    .sort((a, b) => b.tvl - a.tvl);

  const topProtocols = solanaProtocols.slice(0, 15);

  // 3. TVL history - last 90 days
  const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
  const tvlHistory: TvlDataPoint[] = (Array.isArray(history) ? history : [])
    .filter((point) => point.date >= ninetyDaysAgo)
    .map((point) => ({
      date: new Date(point.date * 1000).toISOString().split("T")[0],
      tvl: point.tvl,
    }));

  // 4. Compute TVL changes from history
  let tvlChange1d = 0;
  let tvlChange7d = 0;
  if (tvlHistory.length >= 2) {
    const current = tvlHistory[tvlHistory.length - 1].tvl;
    const yesterday = tvlHistory.length >= 2 ? tvlHistory[tvlHistory.length - 2].tvl : current;
    const weekAgo = tvlHistory.length >= 8 ? tvlHistory[tvlHistory.length - 8].tvl : current;

    if (yesterday > 0) {
      tvlChange1d = Math.round(((current - yesterday) / yesterday) * 10000) / 100;
    }
    if (weekAgo > 0) {
      tvlChange7d = Math.round(((current - weekAgo) / weekAgo) * 10000) / 100;
    }
  }

  // 5. Category breakdown from all Solana protocols
  const categoryMap = new Map<string, { tvl: number; count: number }>();
  for (const p of solanaProtocols) {
    const cat = p.category;
    const existing = categoryMap.get(cat);
    if (existing) {
      existing.tvl += p.tvl;
      existing.count += 1;
    } else {
      categoryMap.set(cat, { tvl: p.tvl, count: 1 });
    }
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      tvl: data.tvl,
      count: data.count,
    }))
    .sort((a, b) => b.tvl - a.tvl);

  const result: SolanaMarketData = {
    totalTvl,
    tvlChange1d,
    tvlChange7d,
    topProtocols,
    tvlHistory,
    categoryBreakdown,
  };

  cachedData = result;
  cacheTimestamp = now;
  return result;
}
