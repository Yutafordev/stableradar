import {
  PortfolioPosition,
  PortfolioSummary,
  PortfolioPositionDetail,
  YieldOpportunity,
} from "./types";

const STORAGE_KEY = "stableradar_portfolio";

// ── localStorage helpers (SSR-safe) ──

export function loadPositions(): PortfolioPosition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PortfolioPosition[]) : [];
  } catch {
    return [];
  }
}

export function savePositions(positions: PortfolioPosition[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

export function addPosition(
  positions: PortfolioPosition[],
  pos: Omit<PortfolioPosition, "id" | "addedAt">
): PortfolioPosition[] {
  const newPos: PortfolioPosition = {
    ...pos,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
  };
  const updated = [...positions, newPos];
  savePositions(updated);
  return updated;
}

export function removePosition(
  positions: PortfolioPosition[],
  id: string
): PortfolioPosition[] {
  const updated = positions.filter((p) => p.id !== id);
  savePositions(updated);
  return updated;
}

export function clearAllPositions(): PortfolioPosition[] {
  savePositions([]);
  return [];
}

// ── Portfolio computation ──

function findMatchingPool(
  pos: PortfolioPosition,
  yields: YieldOpportunity[]
): YieldOpportunity | null {
  // Match by protocolSlug + token
  const match = yields.find(
    (y) =>
      y.protocolSlug === pos.protocolSlug &&
      y.token.toLowerCase() === pos.token.toLowerCase()
  );
  return match ?? null;
}

function findBetterPool(
  pos: PortfolioPosition,
  currentApy: number,
  yields: YieldOpportunity[]
): YieldOpportunity | null {
  // Find a better pool for the same token with low/medium risk
  const candidates = yields
    .filter(
      (y) =>
        y.token.toLowerCase() === pos.token.toLowerCase() &&
        y.protocolSlug !== pos.protocolSlug &&
        y.riskLevel !== "high" &&
        y.apy > currentApy
    )
    .sort((a, b) => b.apy - a.apy);

  return candidates[0] ?? null;
}

export function computePortfolioSummary(
  positions: PortfolioPosition[],
  yields: YieldOpportunity[]
): PortfolioSummary {
  let totalValue = 0;
  let weightedApySum = 0;
  let totalAnnualYield = 0;

  const positionDetails: PortfolioPositionDetail[] = positions.map((pos) => {
    const pool = findMatchingPool(pos, yields);
    const currentApy = pool?.apy ?? null;
    const annualYield = currentApy !== null ? (pos.amount * currentApy) / 100 : 0;
    const riskLevel = pool?.riskLevel ?? null;

    const betterPool =
      currentApy !== null ? findBetterPool(pos, currentApy, yields) : null;
    const betterPoolGain = betterPool
      ? (pos.amount * (betterPool.apy - (currentApy ?? 0))) / 100
      : 0;

    totalValue += pos.amount;
    if (currentApy !== null) {
      weightedApySum += pos.amount * currentApy;
    }
    totalAnnualYield += annualYield;

    return {
      position: pos,
      currentApy,
      annualYield,
      riskLevel,
      betterPool,
      betterPoolGain,
    };
  });

  const weightedAvgApy = totalValue > 0 ? weightedApySum / totalValue : 0;

  return {
    positions,
    totalValue,
    weightedAvgApy,
    totalAnnualYield,
    positionDetails,
  };
}
