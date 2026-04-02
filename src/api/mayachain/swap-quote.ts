import { MAYACHAIN_NODE_URL } from '@/config/constants';

export interface SwapQuote {
    outbound_delay_blocks: number;
    outbound_delay_seconds: number;
    fees: {
        asset: string;
        affiliate: string;
        outbound: string;
        liquidity: string;
        total: string;
        slippage_bps: number;
        total_bps: number;
    };
    expiry: number;
    warning: string;
    notes: string;
    dust_threshold: string | null;
    recommended_min_amount_in: string;
    recommended_gas_rate: string;
    gas_rate_units: string;
    memo: string;
    expected_amount_out: string;
    max_streaming_quantity: number;
    streaming_swap_blocks: number;
}

interface SwapQuoteParams {
    height: string;
    from_asset: string;
    to_asset: string;
    amount: string;
    destination: string;
    affiliate?: string;
    affiliate_bps?: string;
}

export async function getSwapQuote(params: SwapQuoteParams): Promise<SwapQuote> {
    const baseUrl = MAYACHAIN_NODE_URL;
    const url = new URL(`mayachain/quote/swap`, baseUrl);
    url.searchParams.append('height', params.height);
    url.searchParams.append('from_asset', params.from_asset);
    url.searchParams.append('to_asset', params.to_asset);
    url.searchParams.append('amount', params.amount);
    url.searchParams.append('destination', params.destination);
    url.searchParams.append('tolerance_bps', '10000');

    if (params.affiliate) {
        url.searchParams.append('affiliate', params.affiliate);
    }

    if (params.affiliate_bps) {
        url.searchParams.append('affiliate_bps', params.affiliate_bps);
    }

    const response = await fetch(url, { signal: AbortSignal.timeout(25_000) });
    const json = await response.json();
    return json as SwapQuote;
}
