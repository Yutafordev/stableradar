import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            SR
          </div>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            StableRadar
          </div>
        </div>
        <div
          style={{
            fontSize: "22px",
            color: "#a1a1aa",
            marginBottom: "40px",
          }}
        >
          Solana Stablecoin Yield & Borrow Intelligence
        </div>
        <div
          style={{
            display: "flex",
            gap: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 32px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: "14px", color: "#71717a", textTransform: "uppercase" }}>
              Protocols
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "white" }}>15+</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 32px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: "14px", color: "#71717a", textTransform: "uppercase" }}>
              Risk Scoring
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#10b981" }}>6-Factor</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 32px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: "14px", color: "#71717a", textTransform: "uppercase" }}>
              API Endpoints
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "white" }}>13</div>
          </div>
        </div>
        <div
          style={{
            marginTop: "32px",
            fontSize: "14px",
            color: "#52525b",
          }}
        >
          stableradar.vercel.app • Powered by DeFi Llama
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
