import { PegCurrency } from "../types";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
    : "https://api.mainnet-beta.solana.com";

export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export interface StablecoinMint {
  symbol: string;
  decimals: number;
  pegCurrency: PegCurrency;
}

export const STABLECOIN_MINTS: Record<string, StablecoinMint> = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    symbol: "USDC",
    decimals: 6,
    pegCurrency: "USD",
  },
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
    symbol: "USDT",
    decimals: 6,
    pegCurrency: "USD",
  },
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo": {
    symbol: "PYUSD",
    decimals: 6,
    pegCurrency: "USD",
  },
  USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA: {
    symbol: "USDS",
    decimals: 6,
    pegCurrency: "USD",
  },
  EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o: {
    symbol: "DAI",
    decimals: 8,
    pegCurrency: "USD",
  },
  HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr: {
    symbol: "EURC",
    decimals: 6,
    pegCurrency: "EUR",
  },
};
