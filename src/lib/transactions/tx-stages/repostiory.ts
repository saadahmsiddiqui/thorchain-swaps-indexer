import { Pool } from 'pg';
import { TransactionStage } from '@/lib/transactions/types';

export async function storeTransactionStage(
  data: Omit<TransactionStage, 'created_at' | 'updated_at'>,
  db: Pool,
): Promise<boolean> {
  const cols = `protocol, hash, inbound_observed_final_count, inbound_observed_completed, inbound_confirmation_counted_remaining_seconds, inbound_confirmation_counted_completed, inbound_finalised_completed, swap_status_pending, swap_finalised_completed`;
  const query = `INSERT INTO thorchain.transaction_stages (${cols}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING;`;
  await db.query(query, [
    data.protocol,
    data.hash,
    data.inbound_observed_final_count,
    data.inbound_observed_completed,
    data.inbound_confirmation_counted_remaining_seconds,
    data.inbound_confirmation_counted_completed,
    data.inbound_finalised_completed,
    data.swap_status_pending,
    data.swap_finalised_completed,
  ]);
  return true;
}

export async function getTransactionStage(
  hash: string,
  db: Pool,
): Promise<TransactionStage | null> {
  const query = `SELECT * FROM thorchain.transaction_stages WHERE hash = $1`;
  const response = await db.query<TransactionStage>(query, [hash]);
  return response.rows[0] ? response.rows[0] : null;
}

export async function updateTransactionStage(
  data: Omit<TransactionStage, 'protocol' | 'created_at' | 'updated_at'>,
  db: Pool,
): Promise<boolean> {
  const query = `
    UPDATE thorchain.transaction_stages SET
      inbound_observed_final_count = $2,
      inbound_observed_completed = $3,
      inbound_confirmation_counted_remaining_seconds = $4,
      inbound_confirmation_counted_completed = $5,
      inbound_finalised_completed = $6,
      swap_status_pending = $7,
      swap_finalised_completed = $8
    WHERE hash = $1
  `;
  await db.query(query, [
    data.hash,
    data.inbound_observed_final_count,
    data.inbound_observed_completed,
    data.inbound_confirmation_counted_remaining_seconds,
    data.inbound_confirmation_counted_completed,
    data.inbound_finalised_completed,
    data.swap_status_pending,
    data.swap_finalised_completed,
  ]);
  return true;
}
