import Fastify from 'fastify';
import { get } from '@/lib/transactions/fetch';
import { config } from 'dotenv';

config();

const fastify = Fastify({
  logger: true,
});

fastify.get('/hash/:hash', async function handler(request) {
  const { hash } = request.params as { hash: string };
  const data = await get(hash);
  return { data };
});

async function main() {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main().then(console.log).catch(console.error);
