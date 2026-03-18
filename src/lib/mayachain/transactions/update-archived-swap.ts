import { get as getFromDb } from '@/lib/thorchain/transactions/fetch';

import { get as getTxDetails, TxDetails } from '@/api/thorchain/tx-details';
import { get as getTxStages } from '@/api/thorchain/tx-stages';
import { stagesChanged } from '../state-machine/utils';
import { getClient } from '@/database';
import { updateTransactionStage } from './tx-stages/repostiory';
import { storeTransactionAction, updateTransactionAction } from './tx-actions/repository';
import { storeActionMaxGas, updateActionMaxGas } from './action-max-gas/repository';
import { updateState } from './indexed-hashes/repository';
import { updateTransactionBaseInfo } from './tx-base-info/repository';
import { storeTransactionOutTx, updateTransactionOutTx } from './out-txs/repository';
import { storeTransactionOutTxCoin, updateTransactionOutTxCoin } from './out-tx-coins/repository';
import { storeInnerTransaction, updateInnerTransaction } from './inner-txs/repository';
import { storeTransactionCoins, updateTransactionCoins } from './tx-coins/repository';

export async function updateArchivedSwap(hash: string) {
    console.log(`update-archived-swap ${hash} PROCESSING`);
    const fromDb = await getFromDb(hash);
    const stages = await getTxStages(hash);
    const details = await getTxDetails(hash);

    if (!fromDb) {
        console.log(`update-archived-swap: no data from db`);
        return;
    }
    if ('code' in stages) {
        console.log(`update-archived-swap: no stages from api`);
        return;
    }
    if ('code' in details) {
        console.log(`update-archived-swap: no details from api`);
        return;
    }

    const detail = details as TxDetails;

    if (fromDb.stages) {
        const db = getClient('rw');
        const stagesHaveUpdated = stagesChanged(fromDb.stages, stages);

        if (stagesHaveUpdated || stages.swap_finalised?.completed) {
            await updateTransactionBaseInfo(db, fromDb.baseInfo.id, fromDb.baseInfo.tx_id, {
                consensus_height: detail.consensus_height,
                finalised_height: detail.finalised_height,
                updated_vault: detail.updated_vault ?? null,
                outbound_height: detail.outbound_height ?? null,
            });

            await updateTransactionStage(
                {
                    hash: hash,
                    inbound_observed_final_count: stages.inbound_observed.final_count,
                    inbound_observed_completed: stages.inbound_observed.completed,
                    inbound_confirmation_counted_remaining_seconds:
                        stages.inbound_confirmation_counted?.remaining_confirmation_seconds ?? null,
                    inbound_confirmation_counted_completed:
                        stages.inbound_confirmation_counted?.completed ?? null,
                    inbound_finalised_completed: stages.inbound_finalised?.completed ?? null,
                    swap_status_pending: stages.swap_status?.pending ?? null,
                    swap_finalised_completed: stages.swap_finalised?.completed ?? null,
                    streaming_interval: stages.swap_status?.streaming?.interval ?? 0,
                    streaming_quantity: stages.swap_status?.streaming?.quantity ?? 0,
                    streaming_count: stages.swap_status?.streaming?.count ?? 0,
                    outbound_signed_scheduled_outbound_height:
                        stages.outbound_signed?.scheduled_outbound_height ?? null,
                    outbound_delay_remaining_delay_blocks:
                        stages.outbound_delay?.remaining_delay_blocks ?? null,
                    outbound_delay_remaining_delay_seconds:
                        stages.outbound_delay?.remaining_delay_seconds ?? null,
                    outbound_signed_completed: stages.outbound_signed?.completed ?? null,
                },
                db,
            );

            if (detail.actions && Array.isArray(detail.actions)) {
                for (const action of detail.actions) {
                    const isStored = fromDb.actions.find((x) => x.in_hash === action.in_hash);

                    if (isStored) {
                        await updateTransactionAction(db, isStored.id, fromDb.baseInfo.id, {
                            chain: action.chain,
                            to_address: action.to_address,
                            coin_asset: action.coin.asset,
                            coin_amount: action.coin.amount,
                            memo: action.memo,
                            original_memo: action.original_memo,
                            gas_rate: action.gas_rate,
                            in_hash: action.in_hash,
                            clout_spent: action.clout_spent,
                            vault_pub_key: action.vault_pub_key ?? null,
                            vault_pub_key_eddsa: action.vault_pub_key_eddsa ?? null,
                        });

                        for (const gas of action.max_gas) {
                            const storedGas = isStored.maxGas.find((g) => g.asset === gas.asset);
                            if (storedGas) {
                                await updateActionMaxGas(db, storedGas.id, isStored.id, {
                                    asset: gas.asset,
                                    amount: gas.amount,
                                    decimals: gas.decimals,
                                });
                            } else {
                                await storeActionMaxGas(db, {
                                    action_id: isStored.id,
                                    asset: gas.asset,
                                    amount: gas.amount,
                                    decimals: gas.decimals,
                                });
                            }
                        }
                    } else {
                        const newActionId = await storeTransactionAction(db, {
                            tx_base_info_id: fromDb.baseInfo.id,
                            chain: action.chain,
                            to_address: action.to_address,
                            coin_asset: action.coin.asset,
                            coin_amount: action.coin.amount,
                            memo: action.memo,
                            original_memo: action.original_memo,
                            gas_rate: action.gas_rate,
                            in_hash: action.in_hash,
                            clout_spent: action.clout_spent,
                            vault_pub_key: action.vault_pub_key ?? null,
                            vault_pub_key_eddsa: action.vault_pub_key_eddsa ?? null,
                        });

                        if (newActionId) {
                            for (const gas of action.max_gas) {
                                await storeActionMaxGas(db, {
                                    action_id: newActionId,
                                    asset: gas.asset,
                                    amount: gas.amount,
                                    decimals: gas.decimals,
                                });
                            }
                        }
                    }
                }
            }

            if (detail.out_txs && Array.isArray(detail.out_txs)) {
                for (const outTx of detail.out_txs) {
                    const stored = fromDb.outTxs.find((x) => x.out_tx_id === outTx.id);

                    if (stored) {
                        await updateTransactionOutTx(db, stored.id, fromDb.baseInfo.id, {
                            chain: outTx.chain,
                            from_address: outTx.from_address,
                            to_address: outTx.to_address,
                            memo: outTx.memo,
                        });

                        for (const coin of outTx.coins) {
                            const storedCoin = stored.coins.find((c) => c.asset === coin.asset);
                            if (storedCoin) {
                                await updateTransactionOutTxCoin(db, storedCoin.id, stored.id, {
                                    coin_type: 'coin',
                                    asset: coin.asset,
                                    amount: coin.amount,
                                });
                            } else {
                                await storeTransactionOutTxCoin(db, {
                                    out_tx_id: stored.id,
                                    coin_type: 'coin',
                                    asset: coin.asset,
                                    amount: coin.amount,
                                });
                            }
                        }

                        for (const gas of outTx.gas) {
                            const storedGas = stored.gas.find((g) => g.asset === gas.asset);
                            if (storedGas) {
                                await updateTransactionOutTxCoin(db, storedGas.id, stored.id, {
                                    coin_type: 'gas',
                                    asset: gas.asset,
                                    amount: gas.amount,
                                });
                            } else {
                                await storeTransactionOutTxCoin(db, {
                                    out_tx_id: stored.id,
                                    coin_type: 'gas',
                                    asset: gas.asset,
                                    amount: gas.amount,
                                });
                            }
                        }
                    } else {
                        const newOutTxId = await storeTransactionOutTx(db, {
                            tx_base_info_id: fromDb.baseInfo.id,
                            out_tx_id: outTx.id,
                            chain: outTx.chain,
                            from_address: outTx.from_address,
                            to_address: outTx.to_address,
                            memo: outTx.memo,
                        });

                        if (newOutTxId) {
                            for (const coin of outTx.coins) {
                                await storeTransactionOutTxCoin(db, {
                                    out_tx_id: newOutTxId,
                                    coin_type: 'coin',
                                    asset: coin.asset,
                                    amount: coin.amount,
                                });
                            }
                            for (const gas of outTx.gas) {
                                await storeTransactionOutTxCoin(db, {
                                    out_tx_id: newOutTxId,
                                    coin_type: 'gas',
                                    asset: gas.asset,
                                    amount: gas.amount,
                                });
                            }
                        }
                    }
                }
            }

            if (detail.txs && Array.isArray(detail.txs)) {
                for (const tx of detail.txs) {
                    const stored = fromDb.txs.find((x) => x.detail_id === tx.tx.id);

                    if (stored) {
                        await updateInnerTransaction(db, stored.id, fromDb.baseInfo.id, {
                            status: tx.status,
                            external_observed_height: tx.external_observed_height ?? null,
                            observed_pub_key: tx.observed_pub_key ?? null,
                            external_confirmation_delay_height:
                                tx.external_confirmation_delay_height ?? null,
                        });

                        if (tx.tx.coins && Array.isArray(tx.tx.coins)) {
                            for (const coin of tx.tx.coins) {
                                const storedCoin = stored.coins.find((c) => c.asset === coin.asset);
                                if (storedCoin) {
                                    await updateTransactionCoins(db, storedCoin.id, stored.id, {
                                        coin_type: 'coin',
                                        asset: coin.asset,
                                        amount: coin.amount,
                                    });
                                } else {
                                    await storeTransactionCoins(db, {
                                        tx_id: stored.id,
                                        coin_type: 'coin',
                                        asset: coin.asset,
                                        amount: coin.amount,
                                    });
                                }
                            }
                        }

                        if (tx.tx.gas && Array.isArray(tx.tx.gas)) {
                            for (const gas of tx.tx.gas) {
                                const storedGas = stored.gas.find((g) => g.asset === gas.asset);
                                if (storedGas) {
                                    await updateTransactionCoins(db, storedGas.id, stored.id, {
                                        coin_type: 'gas',
                                        asset: gas.asset,
                                        amount: gas.amount,
                                    });
                                } else {
                                    await storeTransactionCoins(db, {
                                        tx_id: stored.id,
                                        coin_type: 'gas',
                                        asset: gas.asset,
                                        amount: gas.amount,
                                    });
                                }
                            }
                        }
                    } else {
                        const newTxId = await storeInnerTransaction(db, {
                            tx_base_info_id: fromDb.baseInfo.id,
                            detail_id: tx.tx.id,
                            detail_chain: tx.tx.chain,
                            detail_from_address: tx.tx.from_address,
                            detail_to_address: tx.tx.to_address,
                            detail_memo: tx.tx.memo,
                            status: tx.status,
                            external_observed_height: tx.external_observed_height ?? null,
                            observed_pub_key: tx.observed_pub_key ?? null,
                            external_confirmation_delay_height:
                                tx.external_confirmation_delay_height ?? null,
                        });

                        if (newTxId) {
                            if (tx.tx.coins && Array.isArray(tx.tx.coins)) {
                                for (const coin of tx.tx.coins) {
                                    await storeTransactionCoins(db, {
                                        tx_id: newTxId,
                                        coin_type: 'coin',
                                        asset: coin.asset,
                                        amount: coin.amount,
                                    });
                                }
                            }
                            if (tx.tx.gas && Array.isArray(tx.tx.gas)) {
                                for (const gas of tx.tx.gas) {
                                    await storeTransactionCoins(db, {
                                        tx_id: newTxId,
                                        coin_type: 'gas',
                                        asset: gas.asset,
                                        amount: gas.amount,
                                    });
                                }
                            }
                        }
                    }
                }
            }

            console.log(`update-archived-swap: ${hash} ARCHIVE_SUCCESSFUL`);
            await updateState(hash, 'ARCHIVE_SUCCESSFUL');
        } else {
            console.log(`update-archived-swap: no change in stages`);
        }
    }
}
