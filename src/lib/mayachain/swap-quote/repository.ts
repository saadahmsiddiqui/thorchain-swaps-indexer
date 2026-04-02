import { getClient } from '@/database';
import { SwapQuote } from '@/api/mayachain/swap-quote';

export async function storeSwapQuote(hash: string, quote: SwapQuote) {
    const db = getClient('rw');
    const cols = `hash,outbound_delay_blocks,outbound_delay_seconds,fees_asset,fees_affiliate,fees_outbound,fees_liquidity,fees_total,fees_slippage_bps,fees_total_bps,expiry,dust_threshold,recommended_min_amount_in,recommended_gas_rate,gas_rate_units,expected_amount_out,max_streaming_quantity,streaming_swap_blocks`;
    const placeholders = `$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18`;
    const query = `INSERT INTO mayachain.swap_quotes (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
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
        quote.dust_threshold,
        quote.recommended_min_amount_in,
        quote.recommended_gas_rate,
        quote.gas_rate_units,
        quote.expected_amount_out,
        quote.max_streaming_quantity,
        quote.streaming_swap_blocks,
    ]);
    return true;
}
