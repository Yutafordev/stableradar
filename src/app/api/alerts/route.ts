import { NextResponse } from "next/server";
import { generateAlerts } from "@/lib/fetchers/defillama";

export const revalidate = 300;

export async function GET() {
  try {
    const alerts = await generateAlerts();

    return NextResponse.json({
      data: alerts,
      meta: {
        count: alerts.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating alerts:", error);
    return NextResponse.json(
      { error: "Failed to generate risk alerts" },
      { status: 500 }
    );
  }
}
