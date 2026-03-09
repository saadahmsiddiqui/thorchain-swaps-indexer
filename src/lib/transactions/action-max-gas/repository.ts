import { Pool } from 'pg';
import { ActionMaxGas } from '../types';

export async function storeActionMaxGas(
  db: Pool,
  data: Omit<ActionMaxGas, 'id'>,
): Promise<boolean> {
  const cols = `action_id, asset, amount, decimals`;
  const query = `INSERT INTO thorchain.action_max_gas (${cols}) VALUES ($1,$2,$3,$4)`;
  await db.query(query, [data.action_id, data.asset, data.amount, data.decimals]);
  return true;
}

export async function getActionMaxGas(db: Pool, action_id: string): Promise<ActionMaxGas[]> {
  const query = `SELECT * FROM thorchain.action_max_gas WHERE action_id = $1`;
  const response = await db.query<ActionMaxGas>(query, [action_id]);
  return response.rows;
}

export async function updateActionMaxGas(
  db: Pool,
  id: string,
  action_id: string,
  data: Omit<ActionMaxGas, 'action_id' | 'id'>,
): Promise<boolean> {
  const query = `
    UPDATE thorchain.action_max_gas SET
      asset = $2,
      amount = $3,
      decimals = $4
    WHERE id = $1 AND action_id = $5
  `;
  await db.query(query, [id, data.asset, data.amount, data.decimals, action_id]);
  return true;
}
