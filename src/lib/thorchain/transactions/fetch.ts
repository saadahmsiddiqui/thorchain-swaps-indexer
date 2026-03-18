import { getClient } from '@/database';
import { getTransactionBaseInfo } from './tx-base-info/repository';
import {
    ActionMaxGas,
    InnerTransaction,
    TransactionAction,
    TransactionBaseInfo,
    TransactionCoins,
    TransactionOutTx,
    TransactionOutTxCoin,
    TransactionStage,
} from './types';
import { getTransactionActions } from './tx-actions/repository';
import { getActionMaxGas } from './action-max-gas/repository';
import { getTransactionOutTxs } from './out-txs/repository';
import { getTransactionOutTxCoins } from './out-tx-coins/repository';
import { getInnerTransactions } from './inner-txs/repository';
import { getTransactionCoins } from './tx-coins/repository';
import { getTransactionStage } from './tx-stages/repostiory';
import { get as getRefundEvent } from '@/lib/thorchain/refund-events/repository';
import { RefundEvent } from '../refund-events/refund-event';
import { SwapEvent } from '../swap-events/swap-event';
import { get as getSwapEvents } from '../swap-events/repository';

type ActionWithMaxGas = TransactionAction & { maxGas: ActionMaxGas[] };
type OutTxWithCoins = TransactionOutTx & {
    coins: TransactionOutTxCoin[];
    gas: TransactionOutTxCoin[];
};
type TxWithCoins = InnerTransaction & {
    coins: TransactionCoins[];
    gas: TransactionCoins[];
};

export type Swap = {
    baseInfo: TransactionBaseInfo;
    actions: Array<ActionWithMaxGas>;
    outTxs: Array<OutTxWithCoins>;
    txs: TxWithCoins[];
    stages: TransactionStage | null;
    refund: RefundEvent | null;
    swapEvents: SwapEvent[];
};

export async function get(hash: string): Promise<null | Swap> {
    const db = getClient();
    const baseInfo = await getTransactionBaseInfo(db, hash);

    if (!baseInfo) return null;

    const actions = await getTransactionActions(db, baseInfo.id);
    const actionsWithGas: Array<ActionWithMaxGas> = [];

    for (const action of actions) {
        const maxGas = await getActionMaxGas(db, action.id);
        actionsWithGas.push({
            ...action,
            maxGas,
        });
    }

    const outTxsWithCoinsAndGas: Array<OutTxWithCoins> = [];
    const outTxs = await getTransactionOutTxs(db, baseInfo.id);
    for (const outTx of outTxs) {
        const coins = await getTransactionOutTxCoins(db, outTx.id, 'coin');
        const gas = await getTransactionOutTxCoins(db, outTx.id, 'gas');
        outTxsWithCoinsAndGas.push({
            ...outTx,
            coins,
            gas,
        });
    }

    const txs = await getInnerTransactions(db, baseInfo.id);
    const txsWithCoins: Array<TxWithCoins> = [];
    for (const tx of txs) {
        const coins = await getTransactionCoins(db, tx.id, 'coin');
        const gas = await getTransactionCoins(db, tx.id, 'gas');
        txsWithCoins.push({
            ...tx,
            coins,
            gas,
        });
    }

    const stages = await getTransactionStage(hash, db);
    const refund = await getRefundEvent(hash);
    const swapEvents: SwapEvent[] = await getSwapEvents(hash);

    return {
        baseInfo,
        actions: actionsWithGas,
        outTxs: outTxsWithCoinsAndGas,
        txs: txsWithCoins,
        stages,
        refund,
        swapEvents,
    };
}
