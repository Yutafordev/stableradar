import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StableRadar — Solana Stablecoin Yield & Borrow Intelligence",
  description:
    "Real-time stablecoin yield opportunities and borrowing rates across 15+ Solana DeFi protocols. Risk-scored pools, strategy engine, and public API.",
  keywords: [
    "Solana",
    "DeFi",
    "stablecoin",
    "yield",
    "APY",
    "USDC",
    "USDT",
    "lending",
    "borrowing",
    "Kamino",
    "Marginfi",
    "Orca",
    "Raydium",
  ],
  openGraph: {
    title: "StableRadar — Solana Stablecoin Intelligence",
    description:
      "Real-time yield & borrow rates across 15+ Solana DeFi protocols. Risk scoring, strategy engine, and public API.",
    url: "https://stableradar.vercel.app",
    siteName: "StableRadar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StableRadar — Solana Stablecoin Intelligence",
    description:
      "Real-time yield & borrow rates across 15+ Solana DeFi protocols.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
