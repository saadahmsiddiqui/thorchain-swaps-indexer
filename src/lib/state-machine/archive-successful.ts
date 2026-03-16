import winston, { createLogger } from 'winston';
import { getHavingState, updateState } from '@/lib/transactions/indexed-hashes/repository';
import {
    getTransactionStage as getTransactionStageFromDb,
    updateTransactionStage,
} from '@/lib/transactions/tx-stages/repostiory';
import { get as getTransactionStageFromNode } from '@/api/thorchain/tx-stages';
import { getClient } from '@/database';
import { stagesChanged } from './utils';

const errorLogger = createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'ARCHIVE_SUCCESSFUL' },
    transports: [new winston.transports.Console()],
});

export default async function action() {
    const list = await getHavingState({
        state: 'ARCHIVE_SUCCESSFUL',
        limit: 100,
    });

    for (const item of list) {
        try {
            const stage = await getTransactionStageFromDb(item.hash, getClient());

            if (stage) {
                const nodeStage = await getTransactionStageFromNode(item.hash);
                if ('code' in nodeStage) return;

                await updateTransactionStage(
                    {
                        hash: item.hash,
                        inbound_observed_final_count: nodeStage.inbound_observed.final_count,
                        inbound_observed_completed: nodeStage.inbound_observed.completed,
                        inbound_confirmation_counted_remaining_seconds:
                            nodeStage.inbound_confirmation_counted
                                ?.remaining_confirmation_seconds ?? null,
                        inbound_confirmation_counted_completed:
                            nodeStage.inbound_confirmation_counted?.completed ?? null,
                        inbound_finalised_completed: nodeStage.inbound_finalised?.completed ?? null,
                        swap_status_pending: nodeStage.swap_status?.pending ?? null,
                        swap_finalised_completed: nodeStage.swap_finalised?.completed ?? null,
                        streaming_interval: nodeStage.swap_status?.streaming?.interval ?? 0,
                        streaming_quantity: nodeStage.swap_status?.streaming?.quantity ?? 0,
                        streaming_count: nodeStage.swap_status?.streaming?.count ?? 0,
                        outbound_signed_scheduled_outbound_height:
                            nodeStage.outbound_signed?.scheduled_outbound_height ?? null,
                        outbound_signed_completed: nodeStage.outbound_signed?.completed ?? null,
                        outbound_delay_remaining_delay_blocks:
                            nodeStage.outbound_delay?.remaining_delay_blocks ?? null,
                        outbound_delay_remaining_delay_seconds:
                            nodeStage.outbound_delay?.remaining_delay_seconds ?? null,
                    },
                    getClient('rw'),
                );

                const changed = stagesChanged(stage, nodeStage);
                if (changed) {
                    updateState(item.hash, 'REINDEX_DATA');
                    continue;
                }

                const isSwapComplete =
                    Boolean(nodeStage.swap_finalised) && nodeStage.swap_finalised!.completed;

                const isOutboundComplete = nodeStage.outbound_signed
                    ? nodeStage.outbound_signed.completed
                    : true;

                if (isSwapComplete && isOutboundComplete) {
                    updateState(item.hash, 'COMPLETE');
                    continue;
                }
            }
        } catch (error: any) {
            const message = error.message;
            errorLogger.error(`${item.hash} error: ${message}`);
            //   await updateState(item.hash, ArchiveSwapResult.ArchiveFailed);
        }
    }
}
