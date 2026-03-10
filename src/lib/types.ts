import { ArchiveSwapResult } from './transactions/archive-swap';

export type IndexedHashState =
    | 'STORED_INDEXED_HASH'
    | 'REINDEX_DATA'
    | 'ARCHIVE_SUCCESSFUL'
    | ArchiveSwapResult;
