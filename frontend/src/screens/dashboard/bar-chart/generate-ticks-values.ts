// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AccuracyChartDatum } from '../../../view-services/dashboard/base-overturned-performance-store';
import { formatToLocaleMonthDayFormat } from '../../../utils/date';

/**
 * Returns calculated number of tick values for the chart
 * depending on ratio between data length and maximum ticks count
 *
 * @param data
 * @param maxTicksCount - maximum tick values count
 */
export function generateTicksValues(data: AccuracyChartDatum[], maxTicksCount = 30) {
    const dataLength = data.length;

    if (!dataLength) {
        return [];
    }

    const divisor = Math.ceil(dataLength / maxTicksCount);

    return data.reduce((accum, next, currentIndex) => {
        if (currentIndex % divisor === 0) {
            return [...accum, formatToLocaleMonthDayFormat(next.originalDate)];
        }

        return [...accum];
    }, [] as Array<string>);
}
