import { Pool } from 'pg';
import { TransactionOutHash } from '../types';

export async function storeTransactionOutHash(
    db: Pool,
    data: Omit<TransactionOutHash, 'id'>,
): Promise<boolean> {
    const cols = `tx_id, out_hash`;
    const query = `INSERT INTO thorchain.tx_out_hashes (${cols}) VALUES ($1,$2)`;
    await db.query(query, [data.tx_id, data.out_hash]);
    return true;
}

export async function getTransactionOutHashes(
    db: Pool,
    tx_id: string,
): Promise<TransactionOutHash[]> {
    const query = `SELECT * FROM thorchain.tx_out_hashes WHERE tx_id = $1`;
    const response = await db.query<TransactionOutHash>(query, [tx_id]);
    return response.rows;
}

export async function updateTransactionOutHash(
    db: Pool,
    tx_id: string,
    data: Omit<TransactionOutHash, 'tx_id'>,
): Promise<boolean> {
    const query = `UPDATE thorchain.tx_out_hashes SET out_hash = $2 WHERE id = $1 AND tx_id = $3`;
    await db.query(query, [data.id, data.out_hash, tx_id]);
    return true;
}
