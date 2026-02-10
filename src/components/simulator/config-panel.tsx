"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const amountPresets = [1_000, 5_000, 10_000, 50_000, 100_000];
const periodOptions = [
  { value: 1, label: "1 Month" },
  { value: 3, label: "3 Months" },
  { value: 6, label: "6 Months" },
  { value: 12, label: "1 Year" },
];

interface ConfigPanelProps {
  amount: number;
  months: number;
  onAmountChange: (amount: number) => void;
  onMonthsChange: (months: number) => void;
}

export function ConfigPanel({ amount, months, onAmountChange, onMonthsChange }: ConfigPanelProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Investment Amount */}
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
            Investment Amount
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(Math.max(0, Number(e.target.value)))}
              className="h-8 text-sm font-mono bg-muted/30 border-border/30 w-32"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {amountPresets.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onAmountChange(preset)}
                className="text-[10px] h-6 px-2"
              >
                ${preset >= 1000 ? `${preset / 1000}K` : preset}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Period */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
            Time Period
          </label>
          <div className="flex gap-1.5">
            {periodOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={months === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => onMonthsChange(opt.value)}
                className="text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
