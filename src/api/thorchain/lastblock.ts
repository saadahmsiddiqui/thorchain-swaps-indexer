import { THORCHAIN_NODE_URL } from '@/config/constants';

export type LastBlocks = LastBlock[];

export interface LastBlock {
  chain: string;
  last_observed_in: number;
  last_signed_out: number;
  thorchain: number;
}

export async function get(): Promise<LastBlocks> {
  const baseUrl = THORCHAIN_NODE_URL;
  const url = `${baseUrl}/thorchain/lastblock`;
  const response = await fetch(url);
  const json = await response.json();
  return json as LastBlocks;
}
