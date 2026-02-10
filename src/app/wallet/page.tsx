import type { Metadata } from "next";
import { WalletShell } from "@/components/wallet/wallet-shell";

export const metadata: Metadata = {
  title: "Wallet Watcher - StableRadar",
  description:
    "Paste a Solana wallet address to see all stablecoin holdings with yield opportunities and risk analysis.",
};

export default function WalletPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <WalletShell />
    </div>
  );
}
