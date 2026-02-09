import { NextResponse } from "next/server";
import { fetchBorrowRates } from "@/lib/fetchers/defillama";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const protocol = searchParams.get("protocol");
    const sortBy = searchParams.get("sortBy") || "borrowApy";

    let rates = await fetchBorrowRates();

    if (token) {
      rates = rates.filter(
        (r) => r.borrowToken.toUpperCase() === token.toUpperCase()
      );
    }

    if (protocol) {
      rates = rates.filter(
        (r) =>
          r.protocol.toLowerCase().includes(protocol.toLowerCase()) ||
          r.protocolSlug.toLowerCase().includes(protocol.toLowerCase())
      );
    }

    if (sortBy === "supplyApy") {
      rates.sort((a, b) => b.supplyApy - a.supplyApy);
    } else if (sortBy === "tvl") {
      rates.sort((a, b) => b.tvl - a.tvl);
    }

    return NextResponse.json({
      data: rates,
      meta: {
        count: rates.length,
        lastUpdated: new Date().toISOString(),
        source: "DeFi Llama + Protocol APIs",
      },
    });
  } catch (error) {
    console.error("Error fetching borrow rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch borrow rate data" },
      { status: 500 }
    );
  }
}
