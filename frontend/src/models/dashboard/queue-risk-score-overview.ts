// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed, observable } from 'mobx';

import { BarDatum } from '@nivo/bar';

import {
    QueueRiskScoreBucketDto,
    QueueRiskScoreOverviewDto
} from '../../data-services/api-services/models/dashboard/risk-score-overview';
import {
    BUCKET_COUNT,
    BUCKETS_RANGE,
    DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE,
    MAX_RISK_SCORE_BUCKET_SIZE
} from '../../constants';

/**
 * Describes bart chart bar datum keys
 */
export interface QueueRiskScoreDistributionBarDatum extends BarDatum {
    scoreDistributionRange: string;
    good: number;
    watched: number;
    bad: number;
}

export class QueueRiskScoreOverview {
    private static END_RISK_SCORE_GROUP_DECREMENT = 1;

    @observable
    riskScoreOverview: QueueRiskScoreBucketDto = {};

    @computed
    get barChartData(): QueueRiskScoreDistributionBarDatum[] {
        if (this.riskScoreOverview) {
            const realData = Object.keys(this.riskScoreOverview)
                .reduce((acc, key) => {
                    const startRiskScoreRangeValue = Number(key);
                    let endRiskScoreRangeValue = startRiskScoreRangeValue
                        + DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE
                        - QueueRiskScoreOverview.END_RISK_SCORE_GROUP_DECREMENT;

                    if (QueueRiskScoreOverview.isEndRiskScoreGroupValueEqualsMaximum(endRiskScoreRangeValue)) {
                        endRiskScoreRangeValue = MAX_RISK_SCORE_BUCKET_SIZE;
                    }

                    const riskScoreDistributionGroup: QueueRiskScoreDistributionBarDatum = {
                        good: this.riskScoreOverview[key].good,
                        watched: this.riskScoreOverview[key].watched,
                        bad: this.riskScoreOverview[key].bad,
                        scoreDistributionRange: `${startRiskScoreRangeValue} - ${endRiskScoreRangeValue}`
                    };

                    return [...acc, riskScoreDistributionGroup];
                }, [] as Array<QueueRiskScoreDistributionBarDatum>);

            // returns empty array if we don't have nothing to show on UI,
            // that means to show warning no data message
            if (!realData.length) {
                return [];
            }

            return this.getDataWithPlaceholderValues(realData);
        }

        return [];
    }

    @computed
    get substitutionBarChartData(): QueueRiskScoreDistributionBarDatum[] {
        return new Array(BUCKET_COUNT).fill(undefined)
            .map<QueueRiskScoreDistributionBarDatum>((_, index) => ({
            good: 0,
            watched: 0,
            bad: 0,
            scoreDistributionRange: BUCKETS_RANGE[index]
        }));
    }

    @action
    fromDto(queueRiskScoreOverviewDto: QueueRiskScoreOverviewDto) {
        const { riskScoreOverview } = queueRiskScoreOverviewDto;
        this.riskScoreOverview = riskScoreOverview;

        return this;
    }

    /**
     * Fills an array with placeholder values, and spreads real data into it.
     *
     * We need to constantly display all buckets on the chart, and it doesn't
     * depends on actual existing bucket groups retrieved from back-end;
     *
     * In order to resolve such case, we need to dynamically fill empty buckets with
     * nullish values (a.k.a.: placeholders values), and insert existed real buckets into
     * an array with situational values (kind of merging to array);
     *
     * Spreading of real data into situational data performed by checking of uniq
     * score distribution group, if group matches then we insert real datum point in place of
     * situational datum point.
     *
     * @param data - QueueRiskScoreDistributionBarDatum[]
     */
    private getDataWithPlaceholderValues(data: QueueRiskScoreDistributionBarDatum[]) {
        return this.substitutionBarChartData.map(placeholderDatum => {
            const realDatumItem = data
                .find(realDatum => realDatum.scoreDistributionRange === placeholderDatum.scoreDistributionRange);

            if (realDatumItem) {
                return realDatumItem;
            }

            return placeholderDatum;
        });
    }

    private static isEndRiskScoreGroupValueEqualsMaximum(value: number) {
        return value === MAX_RISK_SCORE_BUCKET_SIZE - QueueRiskScoreOverview.END_RISK_SCORE_GROUP_DECREMENT;
    }
}
