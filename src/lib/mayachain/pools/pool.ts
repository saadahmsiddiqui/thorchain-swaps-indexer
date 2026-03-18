export type Pool = {
    height: string;
    asset: string;
    lp_units: string;
    pool_units: string;
    status: string;
    synth_units: string;
    synth_supply: string;
    pending_inbound_asset: string;
    pending_inbound_native_currency: string;
    balance_asset: string;
    balance_native_currency: string;
    bondable: boolean | null;
    decimals: number | null;
    created_at: string;
};
