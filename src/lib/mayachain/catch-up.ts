import { config } from 'dotenv';
config();

import winston, { createLogger } from 'winston';
import { EndBlockEvent, Root, Tx, get } from '../../api/mayachain/block';
import { isRefundEvent, isSwapEvent } from '../end-block-events/utils';
import { buildRefundEvent } from './refund-events/refund-event';
import { store as storeIndexedHash } from './transactions/indexed-hashes/repository';
import { store as storeRefundEvent } from './refund-events/repository';
import { store as storeSwapEvent } from './swap-events/repository';
import { store as storePool } from './pools/repository';
import { isSwapMemo, parseSwapMemo } from '../memo';
import { buildSwapEvent } from './swap-events/swap-event';
import { getPoolsAtHeight } from '@/api/mayachain/pools';
import { storeParsedMemoAffiliates, storeParsedSwapMemo } from './parsed-swap-memos/repository';
import { getClient } from '@/database';

const logger = createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'indexer-catch-up-mayachain' },
    transports: [new winston.transports.Console()],
});

async function processSwapMemo(hash: string, memo: string): Promise<void> {
    try {
        const parsedMemo = parseSwapMemo('mayachain', hash, memo);
        const db = getClient('rw');
        if (parsedMemo) {
            await storeParsedSwapMemo(db, parsedMemo.parsed);
            await storeParsedMemoAffiliates(db, parsedMemo.affiliates);
        }
    } catch (error: any) {
        logger.error('process-swap-memo error: ' + error.message);
    }
}

async function processTxs(height: number, time: string, txs: Tx[]): Promise<void> {
    logger.info(`process-txs num txs: ` + txs.length);

    for (const transaction of txs) {
        const hasMemoInBody =
            transaction.tx.body && transaction.tx.body.memo && transaction.tx.body.memo.length;
        const hasMemoInFirstMessage =
            transaction.tx.body &&
            transaction.tx.body.messages &&
            transaction.tx.body.messages[0] &&
            transaction.tx.body.messages[0].memo &&
            transaction.tx.body.messages[0].memo.length;

        const memo = hasMemoInBody
            ? transaction.tx.body!.memo
            : hasMemoInFirstMessage
              ? transaction.tx.body!.messages[0].memo
              : null;

        const indexedHash = {
            protocol: 'mayachain',
            state: 'STORED_INDEXED_HASH',
            hash: transaction.hash,
            height: height.toString(),
        };

        try {
            const isSwap = isSwapMemo(memo);
            if (isSwap) {
                await storeIndexedHash(indexedHash, time);
                // * Store information about affiliate transactions
                // * for calculating stats using a cron Job
                await processSwapMemo(indexedHash.hash, memo as string);
            }
        } catch (error: any) {
            const message = error.message;
            logger.error(`process-txs error: ` + message);
        }
    }
}

async function processEndBlockEvents(
    time: string,
    height: number,
    events: EndBlockEvent[],
): Promise<void> {
    logger.info(`process-end-block-events num events: ` + events.length);

    for (const event of events) {
        try {
            if (isRefundEvent(event)) {
                const block = {
                    height,
                };

                const refundEvent = buildRefundEvent(block, event);
                await storeRefundEvent(refundEvent);
            } else if (isSwapEvent(event)) {
                const swapEvent = buildSwapEvent(height.toString(), event);
                await storeSwapEvent(swapEvent);
                await storeIndexedHash(
                    {
                        protocol: 'mayachain',
                        state: 'STORED_INDEXED_HASH',
                        hash: swapEvent.id,
                        height: height.toString(),
                    },
                    time,
                );
                if (event.memo && isSwapMemo(event.memo)) {
                    await processSwapMemo(event.id!, event.memo);
                }
            }
        } catch (error: any) {
            const message = error.message;
            logger.error(`process-end-block-events error: ` + message);
        }
    }
}

async function processPools(height: number): Promise<void> {
    try {
        const poolsAtHeight = await getPoolsAtHeight(height);

        for (const pool of poolsAtHeight) {
            await storePool({ height, pool });
        }
    } catch (error: any) {
        const message = error.message;
        logger.error(`process-pools error: ` + message);
        console.error(error);
    }
}

export async function indexHeight(height: number): Promise<{ successful: boolean; halt: boolean }> {
    logger.info('index-height processing block: ' + height);
    // eslint-disable-next-line no-useless-assignment
    let block: Root | null = null;

    try {
        block = await get(height);
        if ('code' in block && 'message' in block) {
            const message = block.message as string;
            throw new Error(message);
        }
    } catch {
        return { successful: false, halt: true };
    }

    try {
        if (block.txs && Array.isArray(block.txs)) {
            await processTxs(height, block.header.time, block.txs);
        }

        if (block.end_block_events && Array.isArray(block.end_block_events)) {
            await processEndBlockEvents(block.header.time, height, block.end_block_events);
        }
        await processPools(height);
    } catch {
        return { successful: false, halt: false };
    }

    return { successful: true, halt: false };
}
