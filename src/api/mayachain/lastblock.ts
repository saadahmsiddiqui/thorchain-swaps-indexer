import { MAYACHAIN_NODE_URL } from '@/config/constants';

export type LastBlocks = LastBlock[];

export interface LastBlock {
    chain: string;
    last_observed_in: number;
    last_signed_out: number;
    mayachain: number;
}

export async function get(): Promise<LastBlocks> {
    const baseUrl = MAYACHAIN_NODE_URL;
    const url = `${baseUrl}/mayachain/lastblock`;
    const response = await fetch(url);
    const json = await response.json();
    return json as LastBlocks;
}
