import { Pool } from 'pg';
import { TransactionSigner } from '../types';

export async function storeTransactionSigner(
    db: Pool,
    data: Omit<TransactionSigner, 'id'>,
): Promise<boolean> {
    const cols = `tx_id, signer`;
    const query = `INSERT INTO mayachain.tx_signers (${cols}) VALUES ($1,$2)`;
    await db.query(query, [data.tx_id, data.signer]);
    return true;
}

export async function getTransactionSigners(db: Pool, tx_id: string): Promise<TransactionSigner[]> {
    const query = `SELECT * FROM mayachain.tx_signers WHERE tx_id = $1`;
    const response = await db.query<TransactionSigner>(query, [tx_id]);
    return response.rows;
}

export async function updateTransactionSigner(
    db: Pool,
    id: string,
    tx_id: string,
    data: Omit<TransactionSigner, 'id' | 'tx_id'>,
): Promise<boolean> {
    const query = `UPDATE mayachain.tx_signers SET signer = $2 WHERE id = $1 AND tx_id = $3`;
    await db.query(query, [id, data.signer, tx_id]);
    return true;
}
