// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { computed, observable } from 'mobx';

import { PieDatum } from '@nivo/pie';

import {
    RiskScoreOverviewDto,
    RiskScoreOverviewBucketItem
} from '../../data-services/api-services/models/queues/risk-score-overview';
import { COLORS } from '../../styles/variables';
import {
    DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE,
    MAX_RISK_SCORE_BUCKET_SIZE
} from '../../constants';

export interface DistributionRiskScoreGroup {
    group: number[];
    count: number;
    color: string
}

export class RiskScoreOverview {
    @observable
    riskScoreOverview: RiskScoreOverviewBucketItem = {};

    private static END_RISK_SCORE_GROUP_DECREMENT = 1;

    fromDto(riskScoreOverviewDto: RiskScoreOverviewDto) {
        const { riskScoreOverview } = riskScoreOverviewDto;

        this.riskScoreOverview = riskScoreOverview;

        return this;
    }

    @computed
    get riskScoreGroups(): DistributionRiskScoreGroup[] | null {
        if (this.riskScoreOverview) {
            return Object.keys(this.riskScoreOverview)
                .reduce((acc, next) => {
                    const startRiskScoreGroupValue = Number(next);
                    let endRiskScoreGroupValue = startRiskScoreGroupValue
                        + DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE
                        - RiskScoreOverview.END_RISK_SCORE_GROUP_DECREMENT;

                    if (RiskScoreOverview.isEndRiskScoreGroupValueEqualsMaximum(endRiskScoreGroupValue)) {
                        endRiskScoreGroupValue = MAX_RISK_SCORE_BUCKET_SIZE;
                    }

                    const riskScoreDistributionGroup: DistributionRiskScoreGroup = {
                        group: [startRiskScoreGroupValue, endRiskScoreGroupValue],
                        count: this.riskScoreOverview[next].count,
                        color: this.getDistributionRiskScoreGroupColor(endRiskScoreGroupValue)
                    };

                    return [...acc, riskScoreDistributionGroup];
                }, [] as Array<DistributionRiskScoreGroup>);
        }

        return null;
    }

    @computed
    get pieChartData(): PieDatum[] {
        if (this.riskScoreGroups) {
            return this.riskScoreGroups
                .map(riskScoreGroup => {
                    const {
                        color,
                        count,
                        group: [startRiskScoreGroupValue, endRiskScoreGroupValue]
                    } = riskScoreGroup;

                    const pieDatumId = `${startRiskScoreGroupValue}-${endRiskScoreGroupValue}`;

                    return {
                        id: pieDatumId,
                        label: `Risk score ${pieDatumId}`,
                        value: count,
                        color
                    };
                });
        }

        return [];
    }

    private static isEndRiskScoreGroupValueEqualsMaximum(values: number) {
        return values === MAX_RISK_SCORE_BUCKET_SIZE - RiskScoreOverview.END_RISK_SCORE_GROUP_DECREMENT;
    }

    /**
     * Find and returns risk score values from available colors
     * @param count - risk score
     * @returns returns color for a specific risk score (count)
     */
    private getDistributionRiskScoreGroupColor(count: number) {
        const { riskScoreDistributionPieChart } = COLORS;
        const DEFAULT_COLOR = riskScoreDistributionPieChart.redDark;

        const multiplyBucketStep = (multiplier: number) => multiplier * DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE;

        return Object
            .values(riskScoreDistributionPieChart)
            .find((_, index) => count < multiplyBucketStep(index + 1)) || DEFAULT_COLOR;
    }
}
