import { config } from 'dotenv';
import { scheduleJob } from 'node-schedule';
import storedIndexedHash from '@/lib/state-machine/stored-indexed-hash';
import archiveSuccessful from '@/lib/state-machine/archive-successful';
import reIndexData from '@/lib/state-machine/reindex-data';
import { Mutex } from 'async-mutex';

config();

const lock = new Mutex();

const schedule = `*/10 * * * * *`;

process.title = `thorchain-indexer-sm ` + process.argv[2];

scheduleJob(process.title, schedule, async () => {
  if (lock.isLocked()) return;

  await lock.acquire();
  switch (process.argv[2]) {
    case 'STORED_INDEXED_HASH':
      await storedIndexedHash();
      break;
    case 'REINDEX_DATA':
      await reIndexData();
      break;
    case 'ARCHIVE_SUCCESSFUL':
      await archiveSuccessful();
      break;
    default:
      process.exit();
  }

  lock.release();
});
