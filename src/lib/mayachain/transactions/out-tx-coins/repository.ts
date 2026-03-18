import { Pool } from 'pg';
import { TransactionOutTxCoin } from '../types';

export async function storeTransactionOutTxCoin(
    db: Pool,
    data: Omit<TransactionOutTxCoin, 'id'>,
): Promise<boolean> {
    const cols = `out_tx_id, coin_type, asset, amount`;
    const query = `INSERT INTO mayachain.out_tx_coins (${cols}) VALUES ($1,$2,$3,$4)`;
    await db.query(query, [data.out_tx_id, data.coin_type, data.asset, data.amount]);
    return true;
}

export async function getTransactionOutTxCoins(
    db: Pool,
    out_tx_id: string,
    coint_type: 'gas' | 'coin',
): Promise<TransactionOutTxCoin[]> {
    const query = `SELECT * FROM mayachain.out_tx_coins WHERE out_tx_id = $1 AND coin_type = $2`;
    const response = await db.query<TransactionOutTxCoin>(query, [out_tx_id, coint_type]);
    return response.rows;
}

export async function updateTransactionOutTxCoin(
    db: Pool,
    id: string,
    out_tx_id: string,
    data: Omit<TransactionOutTxCoin, 'id' | 'out_tx_id'>,
): Promise<boolean> {
    const query = `
    UPDATE mayachain.out_tx_coins SET
      coin_type = $2,
      asset = $3,
      amount = $4
    WHERE id = $1 AND out_tx_id = $5
  `;
    await db.query(query, [id, data.coin_type, data.asset, data.amount, out_tx_id]);
    return true;
}
