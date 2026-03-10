import { getClient } from '@/database';
import { IndexedHeight } from './indexed-height';

export async function getIndexedHeight({
  protocol,
}: {
  protocol: string;
}): Promise<IndexedHeight | null> {
  const db = getClient('r');
  const query = `SELECT * FROM thorchain.indexed_heights WHERE protocol = $1`;
  const response = await db.query<IndexedHeight>(query, [protocol]);
  return response.rows[0] ?? null;
}

export async function updateIndexedHeight({
  protocol,
  height,
}: {
  protocol: string;
  height: number;
}): Promise<boolean> {
  const db = getClient('rw');
  const query = `UPDATE thorchain.indexed_heights SET height = $1 WHERE protocol = $2`;
  await db.query(query, [height, protocol]);
  return true;
}

export async function storeIndexedHeight({
  protocol,
  height,
}: {
  protocol: string;
  height: number;
}): Promise<IndexedHeight | null> {
  const db = getClient('rw');
  const query = `INSERT INTO thorchain.indexed_heights (height, protocol) VALUES ($1, $2) ON CONFLICT DO NOTHING`;
  const response = await db.query<IndexedHeight>(query, [height, protocol]);
  return response.rows[0] ? response.rows[0] : null;
}
