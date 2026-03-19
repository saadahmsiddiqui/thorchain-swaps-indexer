import { Stages } from '@/api/mayachain/tx-stages';
import { TransactionStage } from '@/lib/mayachain/transactions/types';

export function stagesChanged(stageDb: TransactionStage, stage: Stages): boolean {
    return (
        stageDb.inbound_observed_final_count !== stage.inbound_observed.final_count ||
        stageDb.inbound_observed_completed !== stage.inbound_observed.completed ||
        stageDb.inbound_confirmation_counted_remaining_seconds !==
            (stage.inbound_confirmation_counted?.remaining_confirmation_seconds ?? null) ||
        stageDb.inbound_confirmation_counted_completed !==
            (stage.inbound_confirmation_counted?.completed ?? null) ||
        stageDb.inbound_finalised_completed !== (stage.inbound_finalised?.completed ?? null) ||
        stageDb.swap_status_pending !== (stage.swap_status?.pending ?? null) ||
        stageDb.swap_finalised_completed !== (stage.swap_finalised?.completed ?? null) ||
        stageDb.outbound_signed_completed !== (stage.outbound_signed?.completed ?? null)
    );
}
