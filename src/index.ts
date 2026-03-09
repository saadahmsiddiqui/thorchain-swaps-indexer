import { writeFileSync } from 'node:fs';
import { get } from './lib/transactions/fetch';
import { config } from 'dotenv';
config();
async function main() {
  const data = await get('656015529F8C6694826EB10178CCBD052F4548261B3C476186C9CF637418AC3D');
  writeFileSync('data.json', JSON.stringify(data));
}

main().then(console.log).catch(console.error);
