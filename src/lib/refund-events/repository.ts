import { getClient } from '@/database';
import { RefundEvent } from './refund-event';

export async function get(id: string): Promise<RefundEvent | null> {
    const db = getClient('rw');
    const query = `SELECT protocol, height, id, coin, reason FROM thorchain.refund_events WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0] ?? null;
}

export async function store(event: RefundEvent): Promise<boolean> {
    const db = getClient('rw');
    const cols = `protocol, height, id, coin, reason`;
    const placeholders = `$1,$2,$3,$4,$5`;
    const query = `INSERT INTO thorchain.refund_events (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
    await db.query(query, [event.protocol, event.height, event.id, event.coin, event.reason]);
    return true;
}
