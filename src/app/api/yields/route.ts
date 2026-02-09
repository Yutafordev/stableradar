import { NextResponse } from "next/server";
import { fetchYields } from "@/lib/fetchers/defillama";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const protocol = searchParams.get("protocol");
    const minTvl = searchParams.get("minTvl");
    const sortBy = searchParams.get("sortBy") || "apy";
    const limit = parseInt(searchParams.get("limit") || "100");

    let yields = await fetchYields();

    if (token) {
      yields = yields.filter(
        (y) => y.token.toUpperCase() === token.toUpperCase()
      );
    }

    if (protocol) {
      yields = yields.filter(
        (y) =>
          y.protocol.toLowerCase().includes(protocol.toLowerCase()) ||
          y.protocolSlug.toLowerCase().includes(protocol.toLowerCase())
      );
    }

    if (minTvl) {
      yields = yields.filter((y) => y.tvl >= parseFloat(minTvl));
    }

    if (sortBy === "tvl") {
      yields.sort((a, b) => b.tvl - a.tvl);
    } else if (sortBy === "risk") {
      yields.sort((a, b) => a.riskScore - b.riskScore);
    }

    yields = yields.slice(0, limit);

    return NextResponse.json({
      data: yields,
      meta: {
        count: yields.length,
        lastUpdated: new Date().toISOString(),
        source: "DeFi Llama + Protocol APIs",
      },
    });
  } catch (error) {
    console.error("Error fetching yields:", error);
    return NextResponse.json(
      { error: "Failed to fetch yield data" },
      { status: 500 }
    );
  }
}
