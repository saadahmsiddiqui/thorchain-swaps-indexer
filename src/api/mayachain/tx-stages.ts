import { MAYACHAIN_NODE_URL } from '@/config/constants';

export interface Stages {
    inbound_observed: InboundObserved;
    inbound_confirmation_counted?: InboundConfirmationCounted;
    inbound_finalised?: InboundFinalised;
    swap_status?: SwapStatus;
    swap_finalised?: SwapFinalised;
    outbound_signed?: {
        scheduled_outbound_height: number;
        completed?: boolean;
    };
    outbound_delay?: {
        remaining_delay_blocks: number;
        remaining_delay_seconds: number;
    };
}

export interface InboundObserved {
    final_count: number;
    completed: boolean;
}

export interface InboundConfirmationCounted {
    remaining_confirmation_seconds: number;
    completed: boolean;
}

export interface InboundFinalised {
    completed: boolean;
}

export interface SwapStatus {
    pending: boolean;
    streaming?: {
        quantity: number;
        count: number;
        interval: number;
    };
}

export interface SwapFinalised {
    completed: boolean;
}

export interface StagesError {
    code: number;
    message: string;
    details: Array<any>;
}

export async function get(hash: string): Promise<StagesError | Stages> {
    const url = MAYACHAIN_NODE_URL + '/mayachain/tx/stages/' + hash;
    const response = await fetch(url, { signal: AbortSignal.timeout(25_000) });
    const json = await response.json();
    return json as StagesError | Stages;
}
