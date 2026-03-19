import { THORCHAIN_NODE_URL } from '@/config/constants';

export interface Root {
    id: Id;
    header: Header;
    finalize_block_events: any[];
    begin_block_events: BeginBlockEvent[];
    end_block_events: EndBlockEvent[];
    txs: Tx[];
}

export interface Id {
    hash: string;
    parts: Parts;
}

export interface Parts {
    total: number;
    hash: string;
}

export interface Header {
    version: Version;
    chain_id: string;
    height: number;
    time: string;
    last_block_id: LastBlockId;
    last_commit_hash: string;
    data_hash: string;
    validators_hash: string;
    next_validators_hash: string;
    consensus_hash: string;
    app_hash: string;
    last_results_hash: string;
    evidence_hash: string;
    proposer_address: string;
}

export interface Version {
    block: string;
    app: string;
}

export interface LastBlockId {
    hash: string;
    parts: Parts2;
}

export interface Parts2 {
    total: number;
    hash: string;
}

export interface BeginBlockEvent {
    asset: string;
    asset_add: string;
    asset_amt: string;
    mode: string;
    reason: string;
    rune_add: string;
    rune_amt: string;
    type: string;
}

export interface EndBlockEvent {
    amount?: string;
    mode: string;
    spender?: string;
    type: string;
    receiver?: string;
    recipient?: string;
    sender?: string;
    chain?: string;
    coin?: string;
    emit_asset?: string;
    from?: string;
    id?: string;
    liquidity_fee?: string;
    liquidity_fee_in_rune?: string;
    memo?: string;
    pool?: string;
    pool_slip?: string;
    streaming_swap_count?: string;
    streaming_swap_quantity?: string;
    swap_slip?: string;
    swap_target?: string;
    to?: string;
    asset?: string;
    asset_address?: string;
    rune_address?: string;
    tx_id?: string;
    in_tx_id?: string;
    burner?: string;
    denom?: string;
    reason?: string;
    supply?: string;
    bond_reward?: string;
    dev_fund_reward?: string;
    income_burn?: string;
    marketing_fund_reward?: string;
    tcy_stake_reward?: string;
}

export interface Tx {
    hash: string;
    result: Result;
    tx: Tx2;
}

export interface Result {
    code: number;
    gas_wanted: string;
    gas_used: string;
    events: Event[];
}

export interface Event {
    action?: string;
    module?: string;
    msg_index?: string;
    sender?: string;
    type: string;
    price?: string;
    symbol?: string;
    fee?: string;
    fee_payer?: string;
    acc_seq?: string;
    signature?: string;
    _contract_address?: string;
    executor?: string;
    strategy_address?: string;
    node_index?: string;
    status?: string;
    operation?: string;
    path?: string;
    amount?: string;
    spender?: string;
    receiver?: string;
    recipient?: string;
    asset?: string;
    asset_address?: string;
    rune_address?: string;
    tx_id?: string;
    coins?: string;
    pool_deduct?: string;
    chain?: string;
    coin_amount?: string;
    coin_asset?: string;
    coin_decimals?: string;
    gas_rate?: string;
    in_hash?: string;
    max_gas_amount_0?: string;
    max_gas_asset_0?: string;
    max_gas_decimals_0?: string;
    memo?: string;
    module_name?: string;
    out_hash?: string;
    to_address?: string;
    vault_pub_key?: string;
}

export interface Tx2 {
    messages?: Message[];
    body?: Body;
    auth_info?: AuthInfo;
    signatures?: string[];
}

export interface Message {
    '@type': string;
    quoPriceFeeds: QuoPriceFeed[];
    signer: string;
}

export interface QuoPriceFeed {
    price_feed: PriceFeed;
    attestations: Attestation[];
}

export interface PriceFeed {
    version: string;
    time: string;
    rates: Rate[];
}

export interface Rate {
    amount: string;
    decimals: number;
}

export interface Attestation {
    PubKey: string;
    Signature: string;
}

export interface Body {
    messages: Message2[];
    memo: string;
    timeout_height: string;
    unordered: boolean;
    timeout_timestamp: any;
    extension_options: any[];
    non_critical_extension_options: any[];
}

export interface Message2 {
    '@type': string;
    coins?: Coin[];
    memo?: string;
    signer?: string;
    sender?: string;
    contract?: string;
    msg?: Msg;
    funds?: any[];
}

export interface Coin {
    asset: string;
    amount: string;
    decimals: string;
}

export interface Msg {
    execute: string[];
}

export interface AuthInfo {
    signer_infos: SignerInfo[];
    fee: Fee;
    tip: any;
}

export interface SignerInfo {
    public_key: PublicKey;
    mode_info: ModeInfo;
    sequence: string;
}

export interface PublicKey {
    '@type': string;
    key: string;
}

export interface ModeInfo {
    single: Single;
}

export interface Single {
    mode: string;
}

export interface Fee {
    amount: Amount[];
    gas_limit: string;
    payer: string;
    granter: string;
}

export interface Amount {
    denom: string;
    amount: string;
}

export async function get(height: number): Promise<Root> {
    const url = new URL(`/thorchain/block`, THORCHAIN_NODE_URL);
    url.searchParams.set('height', height.toString());
    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(25_000) });
    const json = await response.json();
    return json as Root;
}
