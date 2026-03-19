import { MAYACHAIN_NODE_URL } from '@/config/constants';

export type Pool = {
    balance_cacao: string;
    balance_asset: string;
    asset: string;
    LP_units: string;
    pool_units: string;
    status: string;
    synth_units: string;
    synth_supply: string;
    pending_inbound_cacao: string;
    pending_inbound_asset: string;
    synth_mint_paused: boolean;
    bondable: boolean;
    decimals?: number;
};

export async function getPoolsAtHeight(height?: number): Promise<Array<Pool>> {
    const url = new URL('mayachain/pools', MAYACHAIN_NODE_URL);
    if (height) {
        url.searchParams.set('height', height.toString());
    }

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(25_000) });
        const data = (await response.json()) as Array<Pool>;
        return data;
    } catch (error) {
        console.error('MAYA (getPoolsAtHeight) Error Fetching Pool: ', error);
        return Promise.reject(error);
    }
}
