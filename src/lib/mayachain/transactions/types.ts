// Table: tx_base_info
export type TransactionBaseInfo = {
    // Numeric string, could exceed JS limit
    id: string;
    tx_id: string;
    consensus_height: number;
    finalised_height: number;
    updated_vault: boolean | null;
    outbound_height: number | null;
    created_at: number;
    updated_at: number;
};

// Table: txs
export type InnerTransaction = {
    id: string;
    tx_base_info_id: string;
    detail_id: string;
    detail_chain: string;
    detail_from_address: string;
    detail_to_address: string;
    detail_memo: string | null;
    status: string | null;
    external_observed_height: number | null;
    observed_pub_key: string | null;
    external_confirmation_delay_height: number | null;
    created_at: number;
};

// Table: tx_detail_coins
export type TransactionCoins = {
    id: string;
    tx_id: string;
    coin_type: 'coin' | 'gas';
    asset: string;
    amount: string;
};

// Table: tx_singers
export type TransactionSigner = {
    id: string;
    tx_id: string;
    signer: string;
};

// Table: tx_out_hashes
export type TransactionOutHash = {
    id: string;
    tx_id: string;
    out_hash: string;
};

// Table: actions
export type TransactionAction = {
    id: string;
    tx_base_info_id: string;
    chain: string;
    to_address: string;
    coin_asset: string;
    coin_amount: string;
    memo: string;
    original_memo: string | null;
    gas_rate: number;
    in_hash: string;
    clout_spent: string | null;
    vault_pub_key: string | null;
    vault_pub_key_eddsa: string | null;
    created_at: number;
};

// Table: action_max_gas
export type ActionMaxGas = {
    id: string;
    action_id: string;
    asset: string;
    amount: string;
    decimals: number;
};

// Table: out_txs
export type TransactionOutTx = {
    id: string;
    tx_base_info_id: string;
    out_tx_id: string;
    chain: string;
    from_address: string;
    to_address: string;
    memo: string;
    created_at: number;
};

// Table: out_tx_coins
export type TransactionOutTxCoin = {
    id: string;
    out_tx_id: string;
    coin_type: string;
    asset: string;
    amount: string;
};

export type TransactionStage = {
    protocol: string;
    hash: string;
    created_at: number;
    updated_at: number;
    inbound_observed_final_count: number;
    inbound_observed_completed: boolean;
    inbound_confirmation_counted_remaining_seconds: number | null;
    inbound_confirmation_counted_completed: boolean | null;
    inbound_finalised_completed: boolean | null;
    swap_status_pending: boolean | null;
    swap_finalised_completed: boolean | null;
    streaming_interval: number | null;
    streaming_quantity: number | null;
    streaming_count: number | null;
    outbound_signed_scheduled_outbound_height: number | null;
    outbound_signed_completed: boolean | null;
    outbound_delay_remaining_delay_blocks: number | null;
    outbound_delay_remaining_delay_seconds: number | null;
};
