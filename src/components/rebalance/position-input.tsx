"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export interface PositionEntry {
  id: string;
  protocol: string;
  token: string;
  amount: number;
}

const PROTOCOL_OPTIONS = [
  "Kamino", "Marginfi", "Save (Solend)", "Drift", "Meteora",
  "Raydium", "Jupiter", "Lulo (Flexlend)", "Loopscale", "Orca DEX",
];

const TOKEN_OPTIONS = ["USDC", "USDT", "PYUSD", "USDS", "USDe", "USDY", "DAI"];

export function PositionInput({
  onSubmit,
  loading,
}: {
  onSubmit: (positions: PositionEntry[], riskTolerance: string, optimizeFor: string) => void;
  loading: boolean;
}) {
  const [positions, setPositions] = useState<PositionEntry[]>([
    { id: "1", protocol: "Kamino", token: "USDC", amount: 10000 },
  ]);
  const [riskTolerance, setRiskTolerance] = useState("medium");
  const [optimizeFor, setOptimizeFor] = useState("apy");

  const addPosition = () => {
    setPositions([
      ...positions,
      { id: Date.now().toString(), protocol: "Kamino", token: "USDC", amount: 1000 },
    ]);
  };

  const removePosition = (id: string) => {
    if (positions.length <= 1) return;
    setPositions(positions.filter((p) => p.id !== id));
  };

  const updatePosition = (id: string, field: keyof PositionEntry, value: string | number) => {
    setPositions(positions.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  return (
    <Card className="border-border/50 bg-card/30">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          {positions.map((pos) => (
            <div key={pos.id} className="flex items-center gap-2">
              <select
                value={pos.protocol}
                onChange={(e) => updatePosition(pos.id, "protocol", e.target.value)}
                className="flex-1 bg-background border border-border/50 rounded-md px-2 py-1.5 text-sm"
              >
                {PROTOCOL_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={pos.token}
                onChange={(e) => updatePosition(pos.id, "token", e.target.value)}
                className="w-24 bg-background border border-border/50 rounded-md px-2 py-1.5 text-sm"
              >
                {TOKEN_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <Input
                type="number"
                value={pos.amount}
                onChange={(e) => updatePosition(pos.id, "amount", parseFloat(e.target.value) || 0)}
                className="w-28 text-sm"
                placeholder="Amount"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePosition(pos.id)}
                disabled={positions.length <= 1}
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addPosition} className="w-full">
          <Plus className="w-4 h-4 mr-1" />
          Add Position
        </Button>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Risk Tolerance</label>
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="low">Conservative</option>
              <option value="medium">Moderate</option>
              <option value="high">Aggressive</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Optimize For</label>
            <select
              value={optimizeFor}
              onChange={(e) => setOptimizeFor(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="apy">Max APY</option>
              <option value="risk">Min Risk</option>
              <option value="sharpe">Best Sharpe</option>
            </select>
          </div>
        </div>

        <Button
          onClick={() => onSubmit(positions, riskTolerance, optimizeFor)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white"
        >
          {loading ? "Analyzing..." : "Optimize Portfolio"}
        </Button>
      </CardContent>
    </Card>
  );
}
