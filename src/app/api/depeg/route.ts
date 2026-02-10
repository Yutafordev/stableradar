import { NextResponse } from "next/server";
import { fetchStablecoinPegData } from "@/lib/fetchers/stablecoins";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchStablecoinPegData();

    return NextResponse.json({
      data,
      meta: {
        count: data.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching depeg data:", error);
    return NextResponse.json(
      { error: "Failed to fetch stablecoin peg data" },
      { status: 500 }
    );
  }
}
