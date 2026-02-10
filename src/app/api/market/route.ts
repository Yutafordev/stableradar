import { NextResponse } from "next/server";
import { fetchSolanaMarket } from "@/lib/fetchers/market";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchSolanaMarket();

    return NextResponse.json({
      data,
      meta: {
        lastUpdated: new Date().toISOString(),
        source: "DeFi Llama",
      },
    });
  } catch (error) {
    console.error("Error fetching market data:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
