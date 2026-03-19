import { Pool } from 'pg';
import { TransactionCoins } from '../types';

export async function storeTransactionCoins(
    db: Pool,
    data: Omit<TransactionCoins, 'id'>,
): Promise<boolean> {
    const cols = `tx_id, coin_type, asset, amount`;
    const query = `INSERT INTO mayachain.tx_detail_coins (${cols}) VALUES ($1,$2,$3,$4)`;
    await db.query(query, [data.tx_id, data.coin_type, data.asset, data.amount]);
    return true;
}

export async function getTransactionCoins(
    db: Pool,
    tx_id: string,
    coint_type: 'gas' | 'coin',
): Promise<TransactionCoins[]> {
    const query = `SELECT * FROM mayachain.tx_detail_coins WHERE tx_id = $1 AND coin_type = $2`;
    const response = await db.query<TransactionCoins>(query, [tx_id, coint_type]);
    return response.rows;
}

export async function updateTransactionCoins(
    db: Pool,
    id: string,
    tx_id: string,
    data: Omit<TransactionCoins, 'id' | 'tx_id'>,
): Promise<boolean> {
    const query = `
    UPDATE mayachain.tx_detail_coins SET
      coin_type = $2,
      asset = $3,
      amount = $4
    WHERE id = $1 and tx_id = $5
  `;
    await db.query(query, [id, data.coin_type, data.asset, data.amount, tx_id]);
    return true;
}
