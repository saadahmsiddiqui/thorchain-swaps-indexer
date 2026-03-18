import { Pool } from 'pg';
import { TransactionAction } from '@/lib/mayachain/transactions/types';

export async function storeTransactionAction(
    db: Pool,
    data: Omit<TransactionAction, 'id' | 'created_at'>,
): Promise<string | null> {
    const cols = `tx_base_info_id, chain, to_address, coin_asset, coin_amount, memo, original_memo, gas_rate, in_hash, clout_spent, vault_pub_key, vault_pub_key_eddsa`;
    const query = `INSERT INTO mayachain.actions (${cols}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`;
    const response = await db.query<{ id: string }>(query, [
        data.tx_base_info_id,
        data.chain,
        data.to_address,
        data.coin_asset,
        data.coin_amount,
        data.memo,
        data.original_memo,
        data.gas_rate,
        data.in_hash,
        data.clout_spent,
        data.vault_pub_key,
        data.vault_pub_key_eddsa,
    ]);
    return response.rows[0] ? response.rows[0].id : null;
}

export async function getTransactionActions(
    db: Pool,
    tx_base_info_id: string,
): Promise<TransactionAction[]> {
    const query = `SELECT * FROM mayachain.actions WHERE tx_base_info_id = $1`;
    const response = await db.query<TransactionAction>(query, [tx_base_info_id]);
    return response.rows;
}

export async function updateTransactionAction(
    db: Pool,
    id: string,
    tx_base_info_id: string,
    data: Omit<TransactionAction, 'id' | 'tx_base_info_id' | 'created_at'>,
): Promise<boolean> {
    const query = `
    UPDATE mayachain.actions SET
      chain = $2,
      to_address = $3,
      coin_asset = $4,
      coin_amount = $5,
      memo = $6,
      original_memo = $7,
      gas_rate = $8,
      in_hash = $9,
      clout_spent = $10,
      vault_pub_key = $11,
      vault_pub_key_eddsa = $12
    WHERE id = $1 AND tx_base_info_id = $13
  `;
    await db.query(query, [
        id,
        data.chain,
        data.to_address,
        data.coin_asset,
        data.coin_amount,
        data.memo,
        data.original_memo,
        data.gas_rate,
        data.in_hash,
        data.clout_spent,
        data.vault_pub_key,
        data.vault_pub_key_eddsa,
        tx_base_info_id,
    ]);
    return true;
}
