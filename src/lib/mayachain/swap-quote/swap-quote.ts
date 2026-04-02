export interface SwapQuote {
    hash: string;
    outbound_delay_blocks: number;
    outbound_delay_seconds: number;
    fees_asset: string;
    fees_affiliate: string;
    fees_outbound: string;
    fees_liquidity: string;
    fees_total: string;
    fees_slippage_bps: number;
    fees_total_bps: number;
    expiry: string;
    dust_threshold: string | null;
    recommended_min_amount_in: string;
    recommended_gas_rate: string;
    gas_rate_units: string;
    expected_amount_out: string;
    max_streaming_quantity: number;
    streaming_swap_blocks: number;
}
