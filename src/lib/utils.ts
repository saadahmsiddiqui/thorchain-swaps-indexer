import { get as getLastblock } from '@/api/thorchain/lastblock';

export async function getLastBlockSafe(): Promise<number | null> {
    try {
        const blocks = await getLastblock();
        if (blocks.length > 0) {
            return blocks[0].thorchain;
        }

        throw new Error('Blocks unavailable');
    } catch {
        return null;
    }
}
