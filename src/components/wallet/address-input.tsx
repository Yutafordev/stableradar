"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidSolanaAddress } from "@/lib/solana/wallet-fetcher";

const EXAMPLE_WALLET = "FqGLTmVDRg8yS2dHPQMBgVEkKZCwmvqyPFovJPU7J1u1";

interface AddressInputProps {
  onAnalyze: (address: string) => void;
  loading: boolean;
}

export function AddressInput({ onAnalyze, loading }: AddressInputProps) {
  const [address, setAddress] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) {
      setValidationError("Please enter a Solana wallet address");
      return;
    }
    if (!isValidSolanaAddress(trimmed)) {
      setValidationError("Invalid Solana address format");
      return;
    }
    setValidationError(null);
    onAnalyze(trimmed);
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text.trim());
      setValidationError(null);
    } catch {
      // clipboard not available
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Enter Solana wallet address..."
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setValidationError(null);
            }}
            className="pr-16 font-mono text-sm"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handlePaste}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
          >
            Paste
          </button>
        </div>
        <Button type="submit" disabled={loading} className="shrink-0">
          {loading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>

      {validationError && (
        <p className="text-xs text-red-400">{validationError}</p>
      )}

      <button
        type="button"
        onClick={() => {
          setAddress(EXAMPLE_WALLET);
          setValidationError(null);
          onAnalyze(EXAMPLE_WALLET);
        }}
        disabled={loading}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
      >
        Try example wallet
      </button>
    </form>
  );
}
