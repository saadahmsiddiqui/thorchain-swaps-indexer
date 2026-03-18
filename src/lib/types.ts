export enum ArchiveSwapResult {
    ErrorStages = 'ERROR_STAGES',
    ErrorDetails = 'ERROR_DETAILS',
    ArchiveSuccessful = 'ARCHIVE_SUCCESSFUL',
    Skipped = 'SKIPPED',
    ArchiveFailed = 'ARCHIVE_FAILED',
}

export type IndexedHashState =
    | 'STORED_INDEXED_HASH'
    | 'REINDEX_DATA'
    | 'ARCHIVE_SUCCESSFUL'
    | ArchiveSwapResult;
