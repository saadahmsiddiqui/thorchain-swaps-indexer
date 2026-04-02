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
    recommended_min_amount_in: string;
    expected_amount_out: string;
    max_streaming_quantity: number;
    streaming_swap_blocks: number;
    total_swap_seconds: number | null;
    created_at: string;
}
