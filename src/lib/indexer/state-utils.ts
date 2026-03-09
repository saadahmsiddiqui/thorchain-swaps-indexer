import { readFileSync, writeFileSync } from 'node:fs';
import { IndexerState } from './state';

const stateFileName = 'indexer-state.json';

export function getIndexedHeight(protocol: string): number {
  const state = readFileSync(stateFileName, 'utf-8');
  const parsed = JSON.parse(state) as IndexerState;
  return parsed[protocol].indexedHeight;
}

export function updateIndexedHeight(protocol: string, height: number): boolean {
  const state = readFileSync(stateFileName, 'utf-8');
  const parsed = JSON.parse(state) as IndexerState;
  parsed[protocol].indexedHeight = height;
  writeFileSync(stateFileName, JSON.stringify(parsed));
  return true;
}
