export type SwapEvent = {
    swap_event_id: string;
    height: string;
    id: string;
    chain: string;
    coin: string;
    emit_asset: string;
    from_address: string;
    to_address: string;
    memo: string;
    mode: string;
    pool: string;
    liquidity_fee: string;
    liquidity_fee_in_native_currency: string;
    pool_slip: number;
    swap_slip: number;
    swap_target: number;
    streaming_swap_count: number;
    streaming_swap_quantity: number;
    created_at: string;
};

export function buildSwapEvent(
    height: string,
    event: any,
): Omit<SwapEvent, 'swap_event_id' | 'created_at'> {
    const {
        coin,
        id,
        emit_asset,
        liquidity_fee,
        liquidity_fee_in_rune,
        swap_target,
        swap_slip,
        pool_slip,
        chain,
        from,
        to,
        memo,
        mode,
        pool,
        streaming_swap_count,
        streaming_swap_quantity,
    } = event;

    return {
        height,
        id,
        chain,
        coin,
        emit_asset,
        from_address: from,
        to_address: to,
        memo,
        mode,
        pool,
        liquidity_fee,
        liquidity_fee_in_native_currency: liquidity_fee_in_rune,
        pool_slip,
        swap_slip,
        swap_target,
        streaming_swap_count,
        streaming_swap_quantity,
    };
}
