import { THORCHAIN_NODE_URL } from '@/config/constants';

export type Pool = {
    asset: string;
    short_code?: string;
    status: string;
    pending_inbound_asset: string;
    pending_inbound_rune: string;
    balance_asset: string;
    balance_rune: string;
    asset_tor_price: string;
    pool_units: string;
    LP_units: string;
    synth_units: string;
    synth_supply: string;
    savers_depth: string;
    savers_units: string;
    savers_fill_bps: string;
    savers_capacity_remaining: string;
    synth_mint_paused: boolean;
    synth_supply_remaining: string;
    derived_depth_bps: string;
    trading_halted: boolean;
    volume_rune: string;
    volume_asset: string;
    decimals?: number;
};

export async function getPoolsAtHeight(height?: number): Promise<Array<Pool>> {
    const url = new URL('thorchain/pools', THORCHAIN_NODE_URL);
    if (height) {
        url.searchParams.set('height', height.toString());
    }

    try {
        const response = await fetch(url);
        const data = (await response.json()) as Array<Pool>;
        return data;
    } catch (error) {
        console.error('THOR (getPoolsAtHeight) Error Fetching Pool: ', error);
        return Promise.reject(error);
    }
}
