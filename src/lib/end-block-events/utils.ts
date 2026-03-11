/**
 * Check if a blockchain event
 * is a refund transaction
 * @param {EventData} data
 * @returns {boolean}
 */
export function isRefundEvent(data: any): boolean {
    if (data.type && data.id && data.coin && data.reason) {
        return data.type === 'refund';
    }

    return false;
}

/**
 *
 * @param data
 * @returns
 */
export function isSwapEvent(data: any): boolean {
    return data && data.type && data.type === 'swap';
}
