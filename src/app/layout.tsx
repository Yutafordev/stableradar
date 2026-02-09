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
    "Real-time stablecoin yield opportunities and borrowing rates across all major Solana DeFi protocols. Find the best APY, compare borrow rates, and monitor risk.",
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
  ],
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
