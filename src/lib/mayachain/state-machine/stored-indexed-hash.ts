import {
    getHavingState,
    updateState,
} from '@/lib/mayachain/transactions/indexed-hashes/repository';
import { archiveSwap } from '@/lib/mayachain/transactions/archive-swap';
import winston, { createLogger } from 'winston';
import { ArchiveSwapResult } from '@/lib/types';

const errorLogger = createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'STORED_INDEXED_HASH' },
    transports: [new winston.transports.Console()],
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
