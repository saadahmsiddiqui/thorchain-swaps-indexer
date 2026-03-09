import { Pool } from 'pg';

let readPool: Pool | null = null;
let readWritePool: Pool | null = null;

export function getClient(mode: 'r' | 'rw' = 'r'): Pool {
  const host = mode === 'r' ? process.env.DB_HOST_READ : process.env.DB_HOST_READ_WRITE;
  const password = process.env.DB_PASSWORD;
  const user = process.env.DB_USER;
  const port = Number(process.env.DB_PORT) || 5432;
  const database = process.env.DB_NAME;

  if (mode === 'r' && !readPool) {
    readPool = new Pool({
      host,
      password,
      user,
      port,
      database,
    });
  } else if (mode === 'rw' && !readWritePool) {
    readWritePool = new Pool({
      host,
      password,
      user,
      port,
      database,
    });
  }

  return mode === 'r' ? readPool! : readWritePool!;
}
