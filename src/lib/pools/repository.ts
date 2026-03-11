import { Pool } from '@/api/thorchain/pools';
import { getClient } from '@/database';

export async function store({ height, pool }: { height: number; pool: Pool }) {
    const db = getClient('rw');
    const cols = `asset, height, short_code, status, pending_inbound_asset, pending_inbound_native_currency, balance_asset, balance_native_currency, asset_tor_price, pool_units, lp_units, synth_units, synth_supply, savers_depth, savers_units, savers_fill_bps, savers_capacity_remaining, synth_mint_paused, synth_supply_remaining, derived_depth_bps, trading_halted, volume_native_currency, volume_asset, decimals`;
    const placeholders = `$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24`;
    const query = `INSERT INTO thorchain.pools(${cols}) VALUES (${placeholders})`;
    await db.query(query, [
        pool.asset,
        height,
        pool.short_code ?? null,
        pool.status,
        pool.pending_inbound_asset,
        pool.pending_inbound_rune,
        pool.balance_asset,
        pool.balance_rune,
        pool.asset_tor_price,
        pool.pool_units,
        pool.LP_units,
        pool.synth_units,
        pool.synth_supply,
        pool.savers_depth,
        pool.savers_units,
        pool.savers_fill_bps,
        pool.savers_capacity_remaining,
        pool.synth_mint_paused,
        pool.synth_supply_remaining,
        pool.derived_depth_bps,
        pool.trading_halted,
        pool.volume_rune,
        pool.volume_asset,
        pool.decimals ?? null,
    ]);
}
