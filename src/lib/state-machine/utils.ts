import { Stages } from '@/api/thorchain/tx-stages';
import { TransactionStage } from '@/lib/transactions/types';

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
        stageDb.swap_finalised_completed !== (stage.swap_finalised?.completed ?? null)
    );
}
