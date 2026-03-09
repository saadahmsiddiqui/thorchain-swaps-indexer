import winston, { createLogger } from 'winston';
import { getHavingState, updateState } from '@/lib/transactions/indexed-hashes/repository';
import {
  getTransactionStage as getTransactionStageFromDb,
  updateTransactionStage,
} from '@/lib/transactions/tx-stages/repostiory';
import { get as getTransactionStageFromNode, Stages } from '@/api/thorchain/tx-stages';
import { getClient } from '@/database';
import { TransactionStage } from '@/lib/transactions/types';

const errorLogger = createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'on-archive-success' },
  transports: [new winston.transports.File({ filename: 'on-archive-success.log' })],
});

function isChanged(stageDb: TransactionStage, stage: Stages): boolean {
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

export default async function action() {
  const list = await getHavingState({
    state: 'ARCHIVE_SUCCESSFUL',
    limit: 250,
  });

  for (const item of list) {
    try {
      const stage = await getTransactionStageFromDb(item.hash, getClient());

      if (stage) {
        if (stage.swap_finalised_completed && !stage.swap_status_pending) {
          updateState(item.hash, 'COMPLETE');
          continue;
        }

        const nodeStage = await getTransactionStageFromNode(item.hash);
        if ('code' in nodeStage) return;

        const changed = isChanged(stage, nodeStage);
        if (changed) {
          updateState(item.hash, 'REINDEX_DATA');
        }

        await updateTransactionStage(
          {
            hash: item.hash,
            inbound_observed_final_count: nodeStage.inbound_observed.final_count,
            inbound_observed_completed: nodeStage.inbound_observed.completed,
            inbound_confirmation_counted_remaining_seconds:
              nodeStage.inbound_confirmation_counted?.remaining_confirmation_seconds ?? null,
            inbound_confirmation_counted_completed:
              nodeStage.inbound_confirmation_counted?.completed ?? null,
            inbound_finalised_completed: nodeStage.inbound_finalised?.completed ?? null,
            swap_status_pending: nodeStage.swap_status?.pending ?? null,
            swap_finalised_completed: nodeStage.swap_finalised?.completed ?? null,
          },
          getClient(),
        );
      }
    } catch (error: any) {
      const message = error.message;
      errorLogger.error(`${item.hash} error: ${message}`);
      //   await updateState(item.hash, ArchiveSwapResult.ArchiveFailed);
    }
  }
}
