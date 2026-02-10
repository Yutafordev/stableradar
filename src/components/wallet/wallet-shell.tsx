"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletAnalysis, YieldOpportunity } from "@/lib/types";
import { AddressInput } from "./address-input";
import { SummaryCards } from "./summary-cards";
import { PositionsTable } from "./positions-table";
import { YieldSuggestions } from "./yield-suggestions";
import { PortfolioTracker } from "./portfolio-tracker";
import { Skeleton } from "@/components/ui/skeleton";

export function WalletShell() {
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yields, setYields] = useState<YieldOpportunity[]>([]);

  useEffect(() => {
    fetch("/api/yields")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setYields(data);
      })
      .catch(() => {});
  }, []);

  async function handleAnalyze(address: string) {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch(`/api/wallet?address=${encodeURIComponent(address)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch wallet data");
        return;
      }

      setAnalysis(data as WalletAnalysis);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Wallet & Portfolio</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Scan a wallet for idle stablecoins or track your DeFi positions manually.
        </p>
      </div>

      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="bg-muted/50 border border-border/50">
          <TabsTrigger value="scan" className="text-xs">
            Wallet Scan
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs">
            My Positions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-4">
          <div className="space-y-6">
            <AddressInput onAnalyze={handleAnalyze} loading={loading} />

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
                <Skeleton className="h-48 rounded-lg" />
              </div>
            )}

            {analysis && !loading && (
              <>
                {analysis.positions.length === 0 ? (
                  <div className="rounded-lg border border-border/50 bg-card/30 px-6 py-10 text-center">
                    <p className="text-muted-foreground">
                      No stablecoins found in this wallet.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      SOL balance: {analysis.solBalance.toFixed(4)} SOL
                    </p>
                  </div>
                ) : (
                  <>
                    <SummaryCards analysis={analysis} />
                    <PositionsTable yieldMatches={analysis.yieldMatches} />
                    <YieldSuggestions yieldMatches={analysis.yieldMatches} />
                  </>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-4">
          <PortfolioTracker yields={yields} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
