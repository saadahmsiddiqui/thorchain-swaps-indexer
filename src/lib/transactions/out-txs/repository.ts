import { Pool } from 'pg';
import { TransactionOutTx } from '../types';

export async function storeTransactionOutTx(
  db: Pool,
  data: Omit<TransactionOutTx, 'id' | 'created_at'>,
): Promise<string | null> {
  const cols = `tx_base_info_id, out_tx_id, chain, from_address, to_address, memo`;
  const query = `INSERT INTO thorchain.out_txs (${cols}) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;
  const response = await db.query(query, [
    data.tx_base_info_id,
    data.out_tx_id,
    data.chain,
    data.from_address,
    data.to_address,
    data.memo,
  ]);
  return response.rows[0] ? response.rows[0].id : null;
}

export async function getTransactionOutTxs(
  db: Pool,
  tx_base_info_id: string,
): Promise<TransactionOutTx[]> {
  const query = `SELECT * FROM thorchain.out_txs WHERE tx_base_info_id = $1`;
  const response = await db.query<TransactionOutTx>(query, [tx_base_info_id]);
  return response.rows;
}

export async function updateTransactionOutTx(
  db: Pool,
  id: string,
  tx_base_info_id: string,
  data: Pick<TransactionOutTx, 'chain' | 'from_address' | 'to_address' | 'memo'>,
): Promise<boolean> {
  const query = `
    UPDATE thorchain.out_txs SET
      chain = $2,
      from_address = $3,
      to_address = $4,
      memo = $5
    WHERE id = $1 AND tx_base_info_id $6
  `;
  await db.query(query, [
    id,
    data.chain,
    data.from_address,
    data.to_address,
    data.memo,
    tx_base_info_id,
  ]);
  return true;
}
