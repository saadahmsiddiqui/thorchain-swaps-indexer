import { getHavingState, updateState } from '@/lib/transactions/indexed-hashes/repository';
import { archiveSwap, ArchiveSwapResult } from '@/lib/transactions/archive-swap';
import winston, { createLogger } from 'winston';

const errorLogger = createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'on-swaps-archived' },
  transports: [new winston.transports.File({ filename: 'on-swaps-archived.log' })],
});

export default async function action() {
  const list = await getHavingState({
    state: 'STORED_INDEXED_HASH',
    limit: 100,
  });

  for (const item of list) {
    try {
      const result = await archiveSwap(item.hash);
      await updateState(item.hash, result);
      console.log(`tx-updated-state: `, result);
    } catch (error: any) {
      const message = error.message;
      errorLogger.error(`${item.hash} error: ${message}`);
      await updateState(item.hash, ArchiveSwapResult.ArchiveFailed);
    }
  }
}
