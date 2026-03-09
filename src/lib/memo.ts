export function isSwapMemo(memo: string | undefined | null): boolean {
  if (!memo) return false;
  const lowercased = memo.toLowerCase();
  return lowercased.startsWith('swap') || lowercased.startsWith('s') || lowercased.startsWith('=');
}

type ParsedSwapMemo = {
  limit: number | null;
  interval: number | null;
  quantity: number | null;
  affiliates: Array<{ affiliate: string; fee: number }>;
  destinationAddress: string;
  refundAddress: string | null;
  asset: string;
  assetRaw: string;
};

export function parseSwapMemo(memo: string): ParsedSwapMemo | null {
  const params = memo.split(':');
  const [handler, asset, destinationAddress, ...rest] = params;
  console.log('[cosmos/memo] MEMO handler: ', handler);

  const isSwap = isSwapMemo(memo);
  if (!isSwap) return null;

  const parsedMemo: ParsedSwapMemo = {
    limit: null,
    interval: null,
    quantity: null,
    affiliates: [],
    destinationAddress: destinationAddress,
    refundAddress: null,
    assetRaw: asset,
    asset: parseAssetShortcode(asset, 'thorchain'),
  };

  const destSplit = destinationAddress.split('/');
  const destAddrHasRefundAddr = destSplit.length > 1;

  if (destAddrHasRefundAddr) {
    parsedMemo.destinationAddress = destSplit[0];
    parsedMemo.refundAddress = destSplit[1];
  }

  const hasLimIntQuan = rest[0] !== undefined;
  const values = hasLimIntQuan ? rest[0].split('/') : [];
  if (values.length > 0) {
    parsedMemo.limit = Number(values[0]);
    parsedMemo.interval = Number(values[1]);
    parsedMemo.quantity = Number(values[2]);
  }

  const hasAffiliates = rest[1] !== undefined;
  const affiliates = hasAffiliates ? rest[1].split('/') : [];
  if (affiliates.length > 0) {
    for (const affiliate of affiliates) {
      parsedMemo.affiliates.push({
        affiliate,
        fee: 0,
      });
    }
  }

  const hasAffiliateFee = rest[2] !== undefined;
  const affiliateFee = hasAffiliateFee ? rest[2].split('/') : [];
  if (affiliateFee.length > 0) {
    const hasOneFeeForAll = affiliateFee.length === 1;
    if (hasOneFeeForAll) {
      const fee = Number(affiliateFee[0]) / 10000;
      for (const affiliate of parsedMemo.affiliates) {
        affiliate.fee = fee;
      }
    } else {
      let idx = 0;
      for (const fee of affiliateFee) {
        const feeNum = Number(fee) / 10000;
        parsedMemo.affiliates[idx].fee = feeNum;
        idx = idx + 1;
      }
    }
  }

  return parsedMemo;
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
