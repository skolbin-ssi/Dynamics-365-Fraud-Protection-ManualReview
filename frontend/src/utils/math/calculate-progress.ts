import { roundNumberToDigit } from './round-number-to-digit';

/**
 *  Calculates ration in percentage between current and previous values,
 *  increase or decrease metrics compare to previous/current numbers
 *
 * @param current - current period value
 * @param previous - previous period value
 */
export function calculateProgress(current: number, previous: number) {
    const quotient = 100;
    let ratio = 0;

    if (current > previous) {
        ratio = (current - previous) / current;
    }

    if (current < previous) {
        ratio = (current - previous) / previous;
    }

    ratio = Number.isFinite(ratio) ? ratio : 0;

    return roundNumberToDigit(ratio * quotient, 2);
}
