export type ParsedSwapMemo = {
    hash: string;
    asset: string;
    limit: number | null;
    interval: number | null;
    quantity: number | null;
    destination_address: string;
    refund_address: string | null;
    created_at: string;
};

export type ParsedSwapMemoAffiliate = {
    hash: string;
    affiliate: string;
    fee_basis_points: number;
    created_at: string;
};
