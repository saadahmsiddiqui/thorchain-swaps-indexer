import { THORCHAIN_NODE_URL } from '@/config/constants';

export interface TxDetails {
  tx_id: string;
  tx: Tx;
  consensus_height: number;
  txs: Tx[];
  actions: Action[] | null;
  out_txs: OutTx[] | null;
  finalised_height: number;
  updated_vault?: boolean;
  outbound_height?: number;
}

export interface Tx {
  tx: TxDetail;
  status: string;
  out_hashes: string[];
  external_observed_height?: number;
  signers?: string[];
  observed_pub_key?: string;
  external_confirmation_delay_height?: number;
}

export interface TxDetail {
  id: string;
  chain: string;
  from_address: string;
  to_address: string;
  coins: Coin[];
  gas: Array<Coin> | null;
  memo: string | null;
}

export interface Coin {
  asset: string;
  amount: string;
}

export interface Action {
  chain: string;
  to_address: string;
  coin: Coin;
  memo: string;
  original_memo: string;
  max_gas: MaxGas[];
  gas_rate: number;
  in_hash: string;
  clout_spent: string | null;
  vault_pub_key?: string;
  vault_pub_key_eddsa?: string;
}

export interface MaxGas {
  asset: string;
  amount: string;
  decimals: number;
}

export interface OutTx {
  id: string;
  chain: string;
  from_address: string;
  to_address: string;
  coins: Coin[];
  gas: Coin[];
  memo: string;
}

export interface DetailsError {
  code: number;
  message: string;
  details: Array<any>;
}

export async function get(hash: string): Promise<TxDetails | Error> {
  const url = THORCHAIN_NODE_URL + `/thorchain/tx/details/` + hash;
  const response = await fetch(url);
  const json = await response.json();
  return json as TxDetails | Error;
}
