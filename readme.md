## Required ENV vars

```sh
DB_HOST_READ=
DB_HOST_READ_WRITE=
DB_PASSWORD=
DB_USER=
DB_PORT=
DB_NAME=
THORCHAIN_NODE_URL=
MAYACHAIN_NODE_URL=
```

## Anatomy

Two main components

1. Catch up: Infinitely tries to catch up with thor chain produced blocks
2. Process Indexed Txs: Simulalates a finite state machine for upto n transactions and archives them w.r.t to their statuses

## Catch up

Steps:

1. Get last indexed block from disk/db
2. Fetch latest block from thorchain
3. if no new blocks, return
4. Iterate over each block, storing `txs` in `indexed_hashes` table to further archive each tx data. sets default state to `STORED_INDEXED_HASH`
   also stores refunds events from `end_block_events`

## State Machine Transitions

- `STORED_INDEXED_HASH` (onSwapsArchived) --> `ERROR_STAGES` | `ERROR_DETAILS` | `ARCHIVE_SUCCESSFUL` | `SKIPPED` | `ARCHIVE_FAILED`
- `ARCHIVE_SUCCESSFUL`
  - stages updated ? --> `REINDEX_DATA`
  - swaps complete and not swap pending ? `COMPLETE`
- `ARCHIVE_FAILED` | `ERROR_STAGES` | `ERROR_DETAILS` | `SKIPPED` --> not implemented at the moment

## Setup Local DB

```sh
docker run -d \
  --name postgres-xscanner \
  -e POSTGRES_PASSWORD=xscanner \
  -e POSTGRES_USER=xscanner \
  -e POSTGRES_DB=xscanner \
  -p 5432:5432 \
  postgres
```