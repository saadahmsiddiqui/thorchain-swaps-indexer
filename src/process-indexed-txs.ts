import { config } from 'dotenv';
import { scheduleJob } from 'node-schedule';
import onSwapsArchived from '@/lib/state-machine/on-swaps-archived';
import onArchiveSuccess from '@/lib/state-machine/on-archive-success';
import onReindexData from '@/lib/state-machine/on-reindex-data';
import { Mutex } from 'async-mutex';

config();

const lock = new Mutex();

const stateMachineJob = scheduleJob('thorchain-indexer', '*/1 * * * *', async () => {
  if (lock.isLocked()) return;
  await lock.acquire();
  await onSwapsArchived();
  await onArchiveSuccess();
  await onReindexData();
  lock.release();
});

process.on('SIGTERM', function onSigterm() {
  console.info('Got SIGTERM. Graceful shutdown start', new Date().toISOString());
  // start graceul shutdown here
  stateMachineJob.cancel(false);
  stateMachineJob.cancelNext(false);
});
