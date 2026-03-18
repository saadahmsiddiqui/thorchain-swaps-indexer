import winston, { createLogger } from 'winston';
import { getHavingState } from '@/lib/mayachain/transactions/indexed-hashes/repository';
import { updateArchivedSwap } from '../transactions/update-archived-swap';

const errorLogger = createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'REINDEX_DATA' },
    transports: [new winston.transports.Console()],
});

export default async function action() {
    const list = await getHavingState({
        state: 'REINDEX_DATA',
        limit: 100,
    });

    for (const item of list) {
        try {
            await updateArchivedSwap(item.hash);
        } catch (error: any) {
            const message = error.message;
            errorLogger.error(`${item.hash} error: ${message}`);
            //   await updateState(item.hash, ArchiveSwapResult.ArchiveFailed);
        }
    }
}
