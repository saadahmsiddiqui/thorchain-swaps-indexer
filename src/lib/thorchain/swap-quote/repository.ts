import { getClient } from '@/database';
import { SwapQuote } from '@/api/thorchain/swap-quote';

export async function storeSwapQuote(hash: string, quote: SwapQuote) {
    const db = getClient('rw');
    const cols = `hash, outbound_delay_blocks, outbound_delay_seconds, fees_asset, fees_affiliate, fees_outbound, fees_liquidity, fees_total, fees_slippage_bps, fees_total_bps, expiry, recommended_min_amount_in, expected_amount_out, max_streaming_quantity, streaming_swap_blocks, total_swap_seconds`;
    const placeholders = `$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16`;
    const query = `INSERT INTO thorchain.swap_quotes (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
    await db.query(query, [
        hash,
        quote.outbound_delay_blocks,
        quote.outbound_delay_seconds,
        quote.fees.asset,
        quote.fees.affiliate,
        quote.fees.outbound,
        quote.fees.liquidity,
        quote.fees.total,
        quote.fees.slippage_bps,
        quote.fees.total_bps,
        quote.expiry,
        quote.recommended_min_amount_in,
        quote.expected_amount_out,
        quote.max_streaming_quantity,
        quote.streaming_swap_blocks,
        quote.total_swap_seconds,
    ]);
    return true;
}
