import { Pool } from '@/api/mayachain/pools';
import { getClient } from '@/database';

export async function store({ height, pool }: { height: number; pool: Pool }) {
    const db = getClient('rw');
    const cols = `height, asset, lp_units, pool_units, status, synth_units, synth_supply, pending_inbound_asset, pending_inbound_native_currency, balance_asset, balance_native_currency, bondable, decimals`;
    const placeholders = `$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13`;
    const query = `INSERT INTO mayachain.pools(${cols}) VALUES (${placeholders})`;
    await db.query(query, [
        height,
        pool.asset,
        pool.LP_units,
        pool.pool_units,
        pool.status,
        pool.synth_units,
        pool.synth_supply,
        pool.pending_inbound_asset,
        pool.pending_inbound_cacao,
        pool.balance_asset,
        pool.balance_cacao,
        pool.bondable,
        pool.decimals,
    ]);
}
