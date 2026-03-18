import { config } from 'dotenv';
config();

import { scheduleJob } from 'node-schedule';
import { Mutex } from 'async-mutex';

import storedIndexedHash from '@/lib/thorchain/state-machine/stored-indexed-hash';
import archiveSuccessful from '@/lib/thorchain/state-machine/archive-successful';
import reIndexData from '@/lib/thorchain/state-machine/reindex-data';

import { IndexedHashState } from './lib/types';
import { ArchiveSwapResult } from './lib/types';

async function transition(lock: Mutex, state: IndexedHashState): Promise<void> {
    if (lock.isLocked()) return;
    await lock.acquire();

    switch (state) {
        case 'STORED_INDEXED_HASH': {
            await storedIndexedHash();
            break;
        }
        case 'REINDEX_DATA': {
            await reIndexData();
            break;
        }
        case 'ARCHIVE_SUCCESSFUL': {
            await archiveSuccessful();
            break;
        }
        case ArchiveSwapResult.ErrorStages: {
            console.log(state);
            break;
        }
        case ArchiveSwapResult.ErrorDetails: {
            console.log(state);
            break;
        }
        case ArchiveSwapResult.ArchiveSuccessful: {
            console.log(state);
            break;
        }
        case ArchiveSwapResult.Skipped: {
            console.log(state);
            break;
        }
        case ArchiveSwapResult.ArchiveFailed: {
            console.log(state);
            break;
        }
    }

    lock.release();
}

const scheduleForAll = `*/10 * * * * *`;

const storedIndexedHashLock = new Mutex();
scheduleJob('STORED_INDEXED_HASH', scheduleForAll, async () =>
    transition(storedIndexedHashLock, 'STORED_INDEXED_HASH'),
);
const reIndexDataLock = new Mutex();
scheduleJob('REINDEX_DATA', scheduleForAll, async () =>
    transition(reIndexDataLock, 'REINDEX_DATA'),
);
const archiveSuccessfulLock = new Mutex();
scheduleJob('ARCHIVE_SUCCESSFUL', scheduleForAll, async () =>
    transition(archiveSuccessfulLock, 'ARCHIVE_SUCCESSFUL'),
);
