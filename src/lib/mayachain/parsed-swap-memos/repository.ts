import { Pool } from 'pg';
import { ParsedSwapMemo, ParsedSwapMemoAffiliate } from './parsed-swap-memos';

export async function storeParsedSwapMemo(
    db: Pool,
    memo: Omit<ParsedSwapMemo, 'created_at'>,
): Promise<ParsedSwapMemo | null> {
    const schema = 'mayachain';
    const params = [
        memo.hash,
        memo.asset,
        memo.swap_limit,
        memo.swap_interval,
        memo.swap_quantity,
        memo.destination_address,
        memo.refund_address,
    ];
    const query = `INSERT INTO ${schema}.parsed_swap_memos (hash, asset, swap_limit, swap_interval, swap_quantity, destination_address, refund_address) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`;
    const response = await db.query<ParsedSwapMemo>(query, params);
    return response.rows[0] ? response.rows[0] : null;
}

export async function storeParsedMemoAffiliates(
    db: Pool,
    affiliates: Array<Omit<ParsedSwapMemoAffiliate, 'created_at'>>,
): Promise<void> {
    const schema = 'mayachain';
    for (const affiliate of affiliates) {
        const query = `INSERT INTO ${schema}.parsed_swap_memos_affiliates (hash, affiliate, fee_basis_points) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`;
        await db.query<ParsedSwapMemo>(query, [
            affiliate.hash,
            affiliate.affiliate,
            affiliate.fee_basis_points,
        ]);
    }
}
