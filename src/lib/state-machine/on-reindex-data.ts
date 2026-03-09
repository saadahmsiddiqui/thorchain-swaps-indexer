import winston, { createLogger } from 'winston';
import { getHavingState } from '@/lib/transactions/indexed-hashes/repository';
import { get as getDetails } from '@/api/thorchain/tx-details';

const errorLogger = createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'on-reindex-data' },
  transports: [new winston.transports.File({ filename: 'on-reindex-data.log' })],
});

export default async function action() {
  const list = await getHavingState({
    state: 'REINDEX_DATA',
    limit: 250,
  });

  for (const item of list) {
    try {
      const details = getDetails(item.hash);
      if ('code' in details) return;
    } catch (error: any) {
      const message = error.message;
      errorLogger.error(`${item.hash} error: ${message}`);
      //   await updateState(item.hash, ArchiveSwapResult.ArchiveFailed);
    }
  }
}
