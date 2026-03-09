import { config } from 'dotenv';
import winston, { createLogger } from 'winston';
import { getIndexedHeight, updateIndexedHeight } from './lib/indexer/state-utils';
import { EndBlockEvent, get as getBlock, Root, Tx } from './api/thorchain/block';
import { store } from './lib/transactions/indexed-hashes/repository';
import { scheduleJob } from 'node-schedule';
import { isRefundEvent } from './lib/end-block-events/utils';
import { buildRefundEvent } from './lib/refund-events/refund-event';
import { store as storeRefundEvent } from './lib/refund-events/repository';
import { getLastBlockSafe } from './lib/utils';

config();

const errorLogger = createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'catch-up' },
  transports: [new winston.transports.File({ filename: 'catch-up-errors.log' })],
});

async function processTxs(height: number, time: string, txs: Tx[]): Promise<void> {
  console.log(`process-txs num txs: `, txs.length);

  for (const transaction of txs) {
    const indexedHash = {
      protocol: 'thorchain',
      state: 'STORED_INDEXED_HASH',
      hash: transaction.hash,
      height: height.toString(),
    };

    try {
      await store(indexedHash, time);
    } catch (error: any) {
      const message = error.message;
      errorLogger.info(`process-txs error: ` + message);
    }
  }
}

async function processEndBlockEvents(height: number, events: EndBlockEvent[]): Promise<void> {
  console.log(`process-end-block-events num events: `, events.length);

  for (const event of events) {
    if (isRefundEvent(event)) {
      const block = {
        height,
      };

      try {
        const refundEvent = buildRefundEvent(block, event);
        await storeRefundEvent(refundEvent);
      } catch (error: any) {
        const message = error.message;
        errorLogger.info(`process-end-block-events error: ` + message);
      }
    }
  }
}

async function indexHeight(height: number): Promise<{ successful: boolean; halt: boolean }> {
  console.log('index-height processing block: ', height);
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
    await processEndBlockEvents(height, block.end_block_events);
  }

  return { successful: true, halt: false };
}

scheduleJob('thorchain-indexer', '*/1 * * * *', async () => {
  console.log('thorchain-indexer started');
  const currentHeight = await getLastBlockSafe();
  if (currentHeight === null) return;
  console.log('thorchain-indexer current height: ', currentHeight);

  const indexedHeight = getIndexedHeight('thorchain');
  console.log('thorchain-indexer indexed height: ', indexedHeight);
  if (indexedHeight >= currentHeight) return;
  const difference = currentHeight - indexedHeight;

  for (let index = 1; index < difference; index++) {
    const height = index + indexedHeight;
    console.log('thorchain-indexer processing height: ', height);
    const state = await indexHeight(height);
    if (state.halt) return;
    updateIndexedHeight('thorchain', height);
  }
});
