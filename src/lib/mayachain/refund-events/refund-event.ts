export type RefundEvent = {
    protocol: string;
    height: string;
    id: string;
    coin: string;
    reason: string;
};

/**
 * Creates a refund transaction
 * object from a block end event
 * object
 * @param {Protocol} protocol
 * @param {{ height: number }} block
 * @param {{ id: string; coin: string; reason: string}} event
 * @returns {RefundedTransaction}
 */
export function buildRefundEvent(block: any, event: any): RefundEvent {
    const { height } = block;
    const { id, coin, reason } = event;

    return {
        protocol: 'mayachain',
        height: height.toString(),
        id,
        coin,
        reason,
    };
}
