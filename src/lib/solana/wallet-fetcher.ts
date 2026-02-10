import { SOLANA_RPC_URL, TOKEN_PROGRAM_ID, STABLECOIN_MINTS } from "./constants";
import { WalletPosition } from "../types";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidSolanaAddress(address: string): boolean {
  return BASE58_RE.test(address);
}

interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result: T;
  error?: { code: number; message: string };
}

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Solana RPC error: ${res.status}`);
  const data: RpcResponse<T> = await res.json();
  if (data.error) throw new Error(`Solana RPC: ${data.error.message}`);
  return data.result;
}

export async function fetchWalletPositions(
  address: string
): Promise<{ solBalance: number; positions: WalletPosition[] }> {
  // Fetch SOL balance and token accounts in parallel
  const [balanceResult, tokenResult] = await Promise.all([
    rpcCall<{ value: number }>("getBalance", [address]),
    rpcCall<{
      value: Array<{
        pubkey: string;
        account: {
          data: {
            parsed: {
              info: {
                mint: string;
                tokenAmount: {
                  uiAmount: number;
                  decimals: number;
                };
              };
            };
          };
        };
      }>;
    }>("getTokenAccountsByOwner", [
      address,
      { programId: TOKEN_PROGRAM_ID },
      { encoding: "jsonParsed" },
    ]),
  ]);

  const solBalance = balanceResult.value / 1e9;

  const positions: WalletPosition[] = [];

  for (const ta of tokenResult.value) {
    const info = ta.account.data.parsed.info;
    const mintInfo = STABLECOIN_MINTS[info.mint];
    if (!mintInfo) continue;

    const balance = info.tokenAmount.uiAmount;
    if (balance <= 0) continue;

    // Stablecoins pegged 1:1, so usdValue ≈ balance for USD pegs
    // For non-USD pegs we still show balance as-is (no FX conversion)
    positions.push({
      mint: info.mint,
      symbol: mintInfo.symbol,
      balance,
      usdValue: balance, // 1:1 peg assumption
      pegCurrency: mintInfo.pegCurrency,
      account: ta.pubkey,
    });
  }

  // Sort by value descending
  positions.sort((a, b) => b.usdValue - a.usdValue);

  return { solBalance, positions };
}
