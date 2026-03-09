import { Pool } from 'pg';
import { InnerTransaction } from '../types';

export async function storeInnerTransaction(
  db: Pool,
  data: Omit<InnerTransaction, 'id' | 'created_at'>,
): Promise<string | null> {
  const cols = `tx_base_info_id, detail_id, detail_chain, detail_from_address, detail_to_address, detail_memo, status, external_observed_height, observed_pub_key, external_confirmation_delay_height`;
  const query = `INSERT INTO thorchain.txs (${cols}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`;
  const response = await db.query<{ id: string }>(query, [
    data.tx_base_info_id,
    data.detail_id,
    data.detail_chain,
    data.detail_from_address,
    data.detail_to_address,
    data.detail_memo,
    data.status,
    data.external_observed_height,
    data.observed_pub_key,
    data.external_confirmation_delay_height,
  ]);
  return response.rows[0] ? response.rows[0].id : null;
}

export async function getInnerTransactions(
  db: Pool,
  tx_base_info_id: string,
): Promise<InnerTransaction[]> {
  const query = `SELECT * FROM thorchain.txs WHERE tx_base_info_id = $1`;
  const response = await db.query<InnerTransaction>(query, [tx_base_info_id]);
  return response.rows;
}

export async function updateInnerTransaction(
  db: Pool,
  id: string,
  tx_base_info_id: string,
  data: Pick<
    InnerTransaction,
    | 'status'
    | 'external_observed_height'
    | 'observed_pub_key'
    | 'external_confirmation_delay_height'
  >,
): Promise<boolean> {
  const query = `
    UPDATE thorchain.txs SET
      status = $2,
      external_observed_height = $3,
      observed_pub_key = $4,
      external_confirmation_delay_height = $5
    WHERE id = $1 AND tx_base_info_id = $6
  `;
  await db.query(query, [
    id,
    data.status,
    data.external_observed_height,
    data.observed_pub_key,
    data.external_confirmation_delay_height,
    tx_base_info_id,
  ]);
  return true;
}
