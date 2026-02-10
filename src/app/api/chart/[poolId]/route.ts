import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;

    if (!poolId || poolId.length < 5) {
      return NextResponse.json(
        { error: "Invalid pool ID" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://yields.llama.fi/chart/${poolId}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `DeFi Llama returned ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    const raw = json.data as Array<{
      timestamp: string;
      apy: number | null;
      tvlUsd: number | null;
    }>;

    // Filter to last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const data = raw
      .filter((d) => new Date(d.timestamp).getTime() >= thirtyDaysAgo)
      .map((d) => ({
        timestamp: d.timestamp,
        apy: d.apy ?? 0,
        tvlUsd: d.tvlUsd ?? 0,
      }));

    return NextResponse.json({ data, poolId });
  } catch (error) {
    console.error("Chart API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
