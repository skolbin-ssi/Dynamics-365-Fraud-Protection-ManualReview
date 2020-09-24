// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { roundNumberToDigit } from './round-number-to-digit';

export * from './distance-convertion';
export * from './calculate-progress';
export * from './round-number-to-digit';

export function calculatePercentageRatio(numerator: number, denominator: number, fractionDigits?: number) {
    const fraction = (numerator / denominator);

    if (!Number.isFinite(fraction)) {
        return 0;
    }

    if (typeof fractionDigits !== 'undefined') {
        return roundNumberToDigit(fraction * 100, fractionDigits);
    }

    return fraction * 100;
}
