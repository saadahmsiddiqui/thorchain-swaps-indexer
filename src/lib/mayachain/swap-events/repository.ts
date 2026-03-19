import { getClient } from '@/database';
import { SwapEvent } from './swap-event';

export async function get(txId: string): Promise<SwapEvent[]> {
    const db = getClient();
    const query = `SELECT height, id, chain, coin, emit_asset, from_address, to_address, memo, pool, liquidity_fee, liquidity_fee_in_native_currency, swap_slip, swap_target, streaming_swap_count, streaming_swap_quantity, created_at FROM mayachain.swap_end_block_events WHERE id = $1;`;
    const result = await db.query(query, [txId]);
    return result.rows;
}

export async function store(
    event: Omit<SwapEvent, 'swap_event_id' | 'created_at'>,
): Promise<boolean> {
    const db = getClient('rw');
    const cols = `height, id, chain, coin, emit_asset, from_address, to_address, memo, pool, liquidity_fee, liquidity_fee_in_native_currency, swap_slip, swap_target, streaming_swap_count, streaming_swap_quantity`;
    const placeholders = `$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15`;
    const query = `INSERT INTO mayachain.swap_end_block_events (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
    await db.query(query, [
        event.height,
        event.id,
        event.chain,
        event.coin,
        event.emit_asset,
        event.from_address,
        event.to_address,
        event.memo,
        event.pool,
        event.liquidity_fee,
        event.liquidity_fee_in_native_currency,
        event.swap_slip,
        event.swap_target,
        event.streaming_swap_count,
        event.streaming_swap_quantity,
    ]);
    return true;
}
