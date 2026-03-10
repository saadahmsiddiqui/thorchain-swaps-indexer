CREATE TABLE thorchain.transactions_stages (
    protocol VARCHAR(50),
    hash TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- InboundObserved (required)
    inbound_observed_final_count INTEGER NOT NULL,
    inbound_observed_completed BOOLEAN NOT NULL,

    -- InboundConfirmationCounted (optional)
    inbound_confirmation_counted_remaining_seconds INTEGER,
    inbound_confirmation_counted_completed BOOLEAN,

    -- InboundFinalised (optional)
    inbound_finalised_completed BOOLEAN,

    -- SwapStatus (optional)
    swap_status_pending BOOLEAN,

    streaming_interval INTEGER,
    streaming_quantity INTEGER,
    streaming_count INTEGER,
    outbound_signed_scheduled_outbound_height INTEGER,
    outbound_delay_remaining_delay_blocks INTEGER,
    outbound_delay_remaining_delay_seconds INTEGER,

    -- SwapFinalised (optional)
    swap_finalised_completed BOOLEAN,
    PRIMARY KEY (hash, protocol)
);

-- Core transaction details
CREATE TABLE thorchain.tx_base_info (
    id BIGSERIAL PRIMARY KEY,
    tx_id VARCHAR NOT NULL UNIQUE,
    consensus_height INTEGER NOT NULL,
    finalised_height INTEGER NOT NULL,
    updated_vault BOOLEAN,
    outbound_height INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tx records (used for both tx and txs[])
CREATE TABLE thorchain.txs (
    id BIGSERIAL PRIMARY KEY,
    tx_base_info_id BIGINT NOT NULL REFERENCES thorchain.tx_base_info(id) ON DELETE CASCADE,

    -- TxDetail (nested tx.tx)
    detail_id VARCHAR NOT NULL,
    detail_chain VARCHAR NOT NULL,
    detail_from_address VARCHAR NOT NULL,
    detail_to_address VARCHAR NOT NULL,
    detail_memo VARCHAR,

    -- Tx fields
    status VARCHAR,
    external_observed_height INTEGER,
    observed_pub_key VARCHAR,
    external_confirmation_delay_height INTEGER,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Coins for TxDetail (tx.tx.coins and tx.tx.gas)
CREATE TABLE thorchain.tx_detail_coins (
    id BIGSERIAL PRIMARY KEY,
    tx_id BIGINT NOT NULL REFERENCES thorchain.txs(id) ON DELETE CASCADE,
    coin_type VARCHAR NOT NULL CHECK (coin_type IN ('coin', 'gas')),
    asset VARCHAR NOT NULL,
    amount VARCHAR NOT NULL
);

-- Signers for Tx (tx.signers[])
CREATE TABLE thorchain.tx_signers (
    id BIGSERIAL PRIMARY KEY,
    tx_id BIGINT NOT NULL REFERENCES thorchain.txs(id) ON DELETE CASCADE,
    signer VARCHAR NOT NULL
);

-- Out hashes for Tx (tx.out_hashes[])
CREATE TABLE thorchain.tx_out_hashes (
    id BIGSERIAL PRIMARY KEY,
    tx_id BIGINT NOT NULL REFERENCES thorchain.txs(id) ON DELETE CASCADE,
    out_hash VARCHAR NOT NULL
);

-- Actions (tx_details.actions[])
CREATE TABLE thorchain.actions (
    id BIGSERIAL PRIMARY KEY,
    tx_base_info_id BIGINT NOT NULL REFERENCES thorchain.tx_base_info(id) ON DELETE CASCADE,
    chain VARCHAR NOT NULL,
    to_address VARCHAR NOT NULL,
    coin_asset VARCHAR NOT NULL,
    coin_amount VARCHAR NOT NULL,
    memo VARCHAR NOT NULL,
    original_memo VARCHAR NOT NULL,
    gas_rate INTEGER NOT NULL,
    in_hash VARCHAR NOT NULL,
    clout_spent VARCHAR,
    vault_pub_key VARCHAR,
    vault_pub_key_eddsa VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- MaxGas for Actions (actions.max_gas[])
CREATE TABLE thorchain.action_max_gas (
    id BIGSERIAL PRIMARY KEY,
    action_id BIGINT NOT NULL REFERENCES thorchain.actions(id) ON DELETE CASCADE,
    asset VARCHAR NOT NULL,
    amount VARCHAR NOT NULL,
    decimals INTEGER NOT NULL
);

-- OutTxs (tx_details.out_txs[])
CREATE TABLE thorchain.out_txs (
    id BIGSERIAL PRIMARY KEY,
    tx_base_info_id BIGINT NOT NULL REFERENCES thorchain.tx_base_info(id) ON DELETE CASCADE,
    out_tx_id VARCHAR NOT NULL,
    chain VARCHAR NOT NULL,
    from_address VARCHAR NOT NULL,
    to_address VARCHAR NOT NULL,
    memo VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Coins for OutTx (out_txs.coins[] and out_txs.gas[])
CREATE TABLE thorchain.out_tx_coins (
    id BIGSERIAL PRIMARY KEY,
    out_tx_id BIGINT NOT NULL REFERENCES thorchain.out_txs(id) ON DELETE CASCADE,
    coin_type VARCHAR NOT NULL CHECK (coin_type IN ('coin', 'gas')),
    asset VARCHAR NOT NULL,
    amount VARCHAR NOT NULL
);

-- Indexes
CREATE INDEX idx_tx_details_tx_id ON thorchain.tx_base_info(tx_id);
CREATE INDEX idx_txs_tx_base_info_id ON thorchain.txs(tx_base_info_id);
CREATE INDEX idx_actions_tx_base_info_id ON thorchain.actions(tx_base_info_id);
CREATE INDEX idx_actions_in_hash ON thorchain.actions(in_hash);
CREATE INDEX idx_out_txs_tx_base_info_id ON thorchain.out_txs(tx_base_info_id);

CREATE TABLE thorchain.indexed_hashes (
	protocol varchar(50) NOT NULL,
	hash varchar(200) NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	height int8 NOT NULL,
	state varchar(200) DEFAULT 'PENDING'::character varying NULL,
    PRIMARY KEY (protocol, hash)
);

CREATE TABLE thorchain.refund_events (
    protocol VARCHAR(50) NOT NULL,
    height BIGINT NOT NULL,
    id VARCHAR NOT NULL,
    coin VARCHAR NOT NULL,
    reason VARCHAR NOT NULL,
    PRIMARY KEY (protocol, id, height)
);

CREATE TABLE thorchain.swap_end_block_events (
    swap_event_id BIGSERIAL,
    height BIGINT NOT NULL,
    id VARCHAR NOT NULL,
    chain VARCHAR NOT NULL,
    coin VARCHAR NOT NULL,
    emit_asset VARCHAR NOT NULL,
    from_address VARCHAR NOT NULL,
    to_address VARCHAR NOT NULL,
    memo TEXT,
    mode VARCHAR NOT NULL,
    pool VARCHAR NOT NULL,
    liquidity_fee BIGINT NOT NULL,
    liquidity_fee_in_rune BIGINT NOT NULL,
    pool_slip INTEGER NOT NULL,
    swap_slip INTEGER NOT NULL,
    swap_target BIGINT NOT NULL,
    streaming_swap_count INTEGER NOT NULL,
    streaming_swap_quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (swap_event_id)
);

CREATE INDEX idx_swap_end_block_events_height ON thorchain.swap_end_block_events(height);