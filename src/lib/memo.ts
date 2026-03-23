import {
    ParsedSwapMemo,
    ParsedSwapMemoAffiliate,
} from './thorchain/parsed-swap-memos/parsed-swap-memos';

export function isSwapMemo(memo: string | undefined | null): boolean {
    if (!memo) return false;
    const lowercased = memo.toLowerCase();
    return (
        lowercased.startsWith('swap') || lowercased.startsWith('s') || lowercased.startsWith('=')
    );
}

export function parseSwapMemo(
    hash: string,
    memo: string,
): {
    parsed: Omit<ParsedSwapMemo, 'created_at'>;
    affiliates: Array<Omit<ParsedSwapMemoAffiliate, 'created_at'>>;
} | null {
    const params = memo.split(':');
    const [handler, asset, destinationAddress, ...rest] = params;
    console.log('[cosmos/memo] MEMO handler: ', hash, handler);

    const isSwap = isSwapMemo(memo);
    if (!isSwap) return null;

    const affiliates: Array<Omit<ParsedSwapMemoAffiliate, 'created_at'>> = [];
    const parsedMemo: Omit<ParsedSwapMemo, 'created_at'> = {
        hash,
        swap_limit: null,
        swap_interval: null,
        swap_quantity: null,
        destination_address: destinationAddress,
        refund_address: null,
        asset: parseAssetShortcode(asset, 'thorchain'),
    };

    const destSplit = destinationAddress.split('/');
    const destAddrHasRefundAddr = destSplit.length > 1;

    if (destAddrHasRefundAddr) {
        parsedMemo.destination_address = destSplit[0];
        parsedMemo.refund_address = destSplit[1];
    }

    const hasLimIntQuan = rest[0] !== undefined;
    const values = hasLimIntQuan ? rest[0].split('/') : [];
    if (values.length > 0) {
        parsedMemo.swap_limit = Number(values[0]);
        parsedMemo.swap_interval = Number(values[1]);
        parsedMemo.swap_quantity = Number(values[2]);
    }

    const hasAffiliates = rest[1] !== undefined;
    const memoAffiliates = hasAffiliates ? rest[1].split('/') : [];
    if (affiliates.length > 0) {
        for (const affiliate of memoAffiliates) {
            affiliates.push({
                affiliate,
                hash,
                fee_basis_points: 0,
            });
        }
    }

    const hasAffiliateFee = rest[2] !== undefined;
    const affiliateFee = hasAffiliateFee ? rest[2].split('/') : [];
    if (affiliateFee.length > 0) {
        const hasOneFeeForAll = affiliateFee.length === 1;
        if (hasOneFeeForAll) {
            const fee = Number(affiliateFee[0]);
            for (const affiliate of affiliates) {
                affiliate.fee_basis_points = fee;
            }
        } else {
            let idx = 0;
            for (const fee of affiliateFee) {
                const feeNum = Number(fee);
                affiliates[idx].fee_basis_points = feeNum;
                idx = idx + 1;
            }
        }
    }

    return { parsed: parsedMemo, affiliates };
}

// -------------------------------------------------
// See the TC and Maya repos:
// https://gitlab.com/thorchain/thornode/-/blob/develop/common/asset.go
// https://gitlab.com/mayachain/mayanode/-/blob/develop/common/asset.go
export function parseAssetShortcode(rawAsset: string, protocol?: 'thorchain' | 'maya'): string {
    switch (rawAsset.toLowerCase()) {
        case 'x':
        case 'xx':
        case 'XRD.XRD'.toLowerCase():
            return 'XRD.XRD';
        case 'c':
        case 'mc':
            if (protocol && protocol === 'thorchain') {
                return 'BCH.BCH';
            }
            return 'MAYA.CACAO';
        case 'b':
        case 'bb':
            return 'BTC.BTC';
        case 'e':
        case 'ee':
            return 'ETH.ETH';
        case 'r':
        case 'tr':
        case 'rune':
            return 'THOR.RUNE';
        case 'k':
        case 'kk':
            return 'KUJI.KUJI';
        case 'ku':
            return 'KUJI.USK';
        case 'd':
        case 'dd':
            if (protocol && protocol === 'thorchain') {
                return 'DOGE.DOGE';
            }
            return 'DASH.DASH';
        case 'g':
            return 'GAIA.ATOM';
        case 'l':
            return 'LTC.LTC';
        case 'a':
        case 'ae':
            if (protocol && protocol === 'thorchain') {
                return 'AVAX.AVAX';
            }
            return 'ARB.ETH';
        case 's':
            return 'BSC.BNB';
        case 'f':
            return 'BASE.ETH';
        case 'et':
            return 'ETH.USDT';
        case 'ec':
            return 'ETH.USDC';
        case 'ep':
            return 'ETH.PEPE';
        case 'ew':
            return 'ETH.WSTETH';
        case 'at':
            return 'ARB.USDT';
        case 'ac':
            return 'ARB.USDC';
        case 'ad':
            return 'ARB.DAI';
        case 'ap':
            return 'ARB.PEPE';
        case 'aw':
            return 'ARB.WSTETH';
        case 'ab':
            return 'ARB.WBTC';
        case 'z':
            return 'ZEC.ZEC';

        default:
            return rawAsset;
    }
}
