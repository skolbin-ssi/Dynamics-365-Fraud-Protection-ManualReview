import { computed, observable } from 'mobx';

import { PieDatum } from '@nivo/pie';

import { PerformanceMetricsDTO } from '../../data-services/api-services/models/dashboard';
import { COLORS } from '../../styles/variables';

export class PerformanceMetrics implements PerformanceMetricsDTO {
    @observable reviewed: number = 0;

    @observable approved: number = 0;

    @observable rejected: number = 0;

    @observable watched: number = 0;

    @observable escalated: number = 0;

    @observable approveOverturned: number = 0;

    @observable rejectOverturned: number = 0;

    hitRate: number = 0;

    held: number = 0;

    other: number = 0;

    constructor(performanceMetricsDTO?: PerformanceMetricsDTO) {
        Object.assign(this, performanceMetricsDTO);
    }

    @computed
    get chartData(): PieDatum[] {
        const { approved, rejected, watched } = this.getPieChartPerformanceMetricsInPercentages();

        return [
            {
                id: 'Approve',
                label: 'Approve',
                value: this.approved,
                color: COLORS.pieChart.approveColor,
                percentage: approved,
            },
            {
                id: 'Reject',
                label: 'Reject',
                value: this.rejected,
                color: COLORS.pieChart.rejectColor,
                percentage: rejected
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
        const total = this.approved + this.rejected + this.watched;

        const getPercent = (portion: number) => ((portion / total) * 100)
            .toFixed(1);

        return {
            approved: getPercent(this.approved),
            rejected: getPercent(this.rejected),
            watched: getPercent(this.watched)
        };
    }

    @computed
    get totalDecisionsReport() {
        const { approved, rejected, watched } = this.getPieChartPerformanceMetricsInPercentages();

        return {
            approved,
            rejected,
            watched
        };
    }
}
