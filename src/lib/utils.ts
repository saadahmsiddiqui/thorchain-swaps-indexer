import { get as getLastblockThorchain } from '@/api/thorchain/lastblock';
import { get as getLastblockMayachain } from '@/api/mayachain/lastblock';

export async function getLastBlockSafe(
    protocol: 'thorchain' | 'mayachain' = 'thorchain',
): Promise<number | null> {
    try {
        const getLastblock =
            protocol === 'thorchain' ? getLastblockThorchain : getLastblockMayachain;

        const blocks = await getLastblock();
        const firstBlock = blocks[0];

        if (firstBlock && 'thorchain' in firstBlock) {
            return firstBlock.thorchain;
        } else if (firstBlock && 'mayachain' in firstBlock) {
            return firstBlock.mayachain;
        }

        throw new Error('Blocks unavailable');
    } catch {
        return null;
    }
}
