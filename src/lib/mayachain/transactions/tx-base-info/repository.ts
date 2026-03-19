import { Pool } from 'pg';
import { TransactionBaseInfo } from '../types';

export async function storeTransactionBaseInfo(
    db: Pool,
    data: Omit<TransactionBaseInfo, 'id' | 'created_at' | 'updated_at'>,
): Promise<string | null> {
    const cols = `tx_id, consensus_height, finalised_height, updated_vault, outbound_height`;
    const query = `INSERT INTO mayachain.tx_base_info (${cols}) VALUES ($1,$2,$3,$4,$5) RETURNING id`;
    const response = await db.query<{ id: string }>(query, [
        data.tx_id,
        data.consensus_height,
        data.finalised_height,
        data.updated_vault,
        data.outbound_height,
    ]);
    return response.rows[0] ? response.rows[0].id : null;
}

/**
 * Retrieves the base tx info stored w.r.t tx_id(hash)
 * @param db
 * @param {string} tx_id transaction hash
 * @returns {TransactionBaseInfo}
 */
export async function getTransactionBaseInfo(
    db: Pool,
    tx_id: string,
): Promise<TransactionBaseInfo | null> {
    const query = `SELECT * FROM mayachain.tx_base_info WHERE tx_id = $1`;
    const response = await db.query<TransactionBaseInfo>(query, [tx_id]);
    return response.rows[0] ? response.rows[0] : null;
}

export async function updateTransactionBaseInfo(
    db: Pool,
    id: string,
    tx_id: string,
    data: Pick<
        TransactionBaseInfo,
        'consensus_height' | 'finalised_height' | 'updated_vault' | 'outbound_height'
    >,
): Promise<boolean> {
    const query = `
    UPDATE mayachain.tx_base_info SET
      consensus_height = $2,
      finalised_height = $3,
      updated_vault = $4,
      outbound_height = $5
    WHERE id = $1 AND tx_id = $6
  `;
    await db.query(query, [
        id,
        data.consensus_height,
        data.finalised_height,
        data.updated_vault,
        data.outbound_height,
        tx_id,
    ]);
    return true;
}
