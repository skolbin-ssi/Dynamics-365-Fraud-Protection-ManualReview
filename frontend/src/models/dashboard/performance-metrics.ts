// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { computed, observable } from 'mobx';

import { PieDatum } from '@nivo/pie';

import { PerformanceMetricsDTO } from '../../data-services/api-services/models/dashboard';
import { COLORS } from '../../styles/variables';

export class PerformanceMetrics implements PerformanceMetricsDTO {
    @observable reviewed: number = 0;

    @observable good: number = 0;

    @observable bad: number = 0;

    @observable watched: number = 0;

    @observable escalated: number = 0;

    @observable goodOverturned: number = 0;

    @observable badOverturned: number = 0;

    hitRate: number = 0;

    held: number = 0;

    other: number = 0;

    constructor(performanceMetricsDTO?: PerformanceMetricsDTO) {
        Object.assign(this, performanceMetricsDTO);
    }

    @computed
    get chartData(): PieDatum[] {
        const { good, bad, watched } = this.getPieChartPerformanceMetricsInPercentages();

        return [
            {
                id: 'Good',
                label: 'Good',
                value: this.good,
                color: COLORS.pieChart.goodColor,
                percentage: good,
            },
            {
                id: 'Bad',
                label: 'Bad',
                value: this.bad,
                color: COLORS.pieChart.badColor,
                percentage: bad
            },
            {
                id: 'Watch',
                label: 'Watch',
                value: this.watched,
                color: COLORS.pieChart.watchColor,
                percentage: watched

            }

        ];
    }

    private getPieChartPerformanceMetricsInPercentages() {
        const total = this.good + this.bad + this.watched;

        const getPercent = (portion: number) => ((portion / total) * 100)
            .toFixed(1);

        return {
            good: getPercent(this.good),
            bad: getPercent(this.bad),
            watched: getPercent(this.watched)
        };
    }

    @computed
    get totalDecisionsReport() {
        const { good, bad, watched } = this.getPieChartPerformanceMetricsInPercentages();

        return {
            good,
            bad,
            watched
        };
    }
}
