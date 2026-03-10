import { config } from 'dotenv';
config();

import winston, { createLogger } from 'winston';
import {
    getIndexedHeight,
    storeIndexedHeight,
    updateIndexedHeight,
} from './lib/indexer/repository';
import { EndBlockEvent, get as getBlock, Root, Tx } from './api/thorchain/block';
import { scheduleJob } from 'node-schedule';
import { isRefundEvent, isSwapEvent } from './lib/end-block-events/utils';
import { buildRefundEvent } from './lib/refund-events/refund-event';
import { store } from './lib/transactions/indexed-hashes/repository';
import { store as storeRefundEvent } from './lib/refund-events/repository';
import { store as storeSwapEvent } from './lib/swap-events/repository';
import { getLastBlockSafe } from './lib/utils';
import { isSwapMemo } from './lib/memo';
import { buildSwapEvent } from './lib/swap-events/swap-event';
import { Mutex } from 'async-mutex';

const logger = createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'indexer-catch-up' },
    transports: [new winston.transports.Console()],
});

async function processTxs(height: number, time: string, txs: Tx[]): Promise<void> {
    logger.info(`process-txs num txs: `, txs.length);

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
            protocol: 'thorchain',
            state: 'STORED_INDEXED_HASH',
            hash: transaction.hash,
            height: height.toString(),
        };

        try {
            const isSwap = isSwapMemo(memo);
            if (isSwap) {
                await store(indexedHash, time);
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
                await store(
                    {
                        protocol: 'thorchain',
                        state: 'STORED_INDEXED_HASH',
                        hash: swapEvent.id,
                        height: height.toString(),
                    },
                    time,
                );
            }
        } catch (error: any) {
            const message = error.message;
            logger.error(`process-end-block-events error: ` + message);
        }
    }
}

async function indexHeight(height: number): Promise<{ successful: boolean; halt: boolean }> {
    logger.info('index-height processing block: ' + height);
    // eslint-disable-next-line no-useless-assignment
    let block: Root | null = null;

    try {
        block = await getBlock(height);
        if ('code' in block && 'message' in block) {
            const message = block.message as string;
            throw new Error(message);
        }
    } catch {
        return { successful: false, halt: true };
    }

    if (block.txs && Array.isArray(block.txs)) {
        await processTxs(height, block.header.time, block.txs);
    }

    if (block.end_block_events && Array.isArray(block.end_block_events)) {
        await processEndBlockEvents(block.header.time, height, block.end_block_events);
    }

    return { successful: true, halt: false };
}

const lock = new Mutex();

scheduleJob('catch-up', '*/1 * * * *', async () => {
    if (lock.isLocked()) {
        logger.info('catch-up job already running... job terminated');
        return;
    }

    await lock.acquire();
    logger.info('catch-up job started');
    const currentHeight = await getLastBlockSafe();
    if (currentHeight === null) return;
    logger.info('catch-up current height: ' + currentHeight);

    let indexedHeight = await getIndexedHeight({ protocol: 'thorchain' });
    if (!indexedHeight) {
        logger.info(`catch-up storing height to start from ` + currentHeight);
        await storeIndexedHeight({ height: currentHeight, protocol: 'thorchain' });
    }

    indexedHeight = await getIndexedHeight({ protocol: 'thorchain' });

    if (!indexedHeight) {
        logger.info(`catch-up height not found ` + currentHeight);
        lock.release();
        return;
    }

    logger.info('catch-up indexed height: ' + indexedHeight);
    const heightNum = Number(indexedHeight.height);

    if (heightNum >= currentHeight) {
        lock.release();
        return;
    }

    const difference = currentHeight - heightNum;
    for (let index = 1; index < difference; index++) {
        const height = index + heightNum;
        logger.info('catch-up processing height: ' + height);
        const state = await indexHeight(height);
        if (state.halt) {
            lock.release();
            return;
        }
        await updateIndexedHeight({ protocol: 'thorchain', height: height });
    }

    lock.release();
});
