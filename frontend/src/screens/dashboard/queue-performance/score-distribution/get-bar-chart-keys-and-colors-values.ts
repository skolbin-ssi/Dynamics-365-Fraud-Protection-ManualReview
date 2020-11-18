// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { QueueRiskScoreDistributionBarDatum } from '../../../../models/dashboard';
import {
    QUEUE_RISK_SCORE_LABELS_TO_RISK_SCORE_KEYS_COLORS,
    DATUM_KEYS_TO_CHART_KEYS
} from '../../../../constants';

interface QueueRiskScoreDistributionBarDatumAccumulator {
    good: number;
    bad: number;
    watched: number;
}

interface BarChartMetaData {
    /**
     * keys - Keys to use to determine each serie.
     */
    keys: string[];

    /**
     * colors - Defines color range.
     */
    colors: string[];
}

/**
 * Returns dynamically calculated keys and colors for the responsive bar chart
 *
 * This function is intentionally create in order to resolve the issue when some of the datum points
 * has 0, nullish values if that is that case, then some of the provided colors under color property
 * of Responsive bar would be shifted in unpredictable orders, and it brakes representation of actual
 * data to be displayed on the dashboard, thus such solution will aim to avoid such issue
 *
 * For more details please refer:
 * @see https://github.com/plouc/nivo/issues/952
 * @see https://github.com/plouc/nivo/issues/952#issuecomment-688245940
 * @see https://github.com/plouc/nivo/issues/986
 * @see https://github.com/plouc/nivo/issues/1031
 *
 * @returns BarChartMetaData
 */
export function getBarChartKeysAndColorsValues(data: QueueRiskScoreDistributionBarDatum[]): BarChartMetaData {
    const keys: string[] = [];
    const colors: string[] = [];

    // order of the keys must be in the defined order for the representation
    const dataSum: QueueRiskScoreDistributionBarDatumAccumulator = data.reduce((acc, next) => ({
        good: acc.good + next.good,
        watched: acc.watched + next.watched,
        bad: acc.bad + next.bad

    }), {
        good: 0, watched: 0, bad: 0,
    });

    Object.keys(dataSum).forEach(key => {
        const value = dataSum[key as keyof QueueRiskScoreDistributionBarDatumAccumulator];

        // filter keys if every decision exists (good, bad, watched)
        // total sum is greater then 0
        if (value > 0) {
            const overturnedChartDatumKey = DATUM_KEYS_TO_CHART_KEYS[key as keyof QueueRiskScoreDistributionBarDatumAccumulator];
            const { color, key: chartKey } = QUEUE_RISK_SCORE_LABELS_TO_RISK_SCORE_KEYS_COLORS.get(overturnedChartDatumKey)!;

            keys.push(chartKey);
            colors.push(color);
        }
    });

    return {
        keys, colors
    };
}
