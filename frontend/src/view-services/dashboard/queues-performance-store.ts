// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { action, computed } from 'mobx';

import { Serie } from '@nivo/line';

import { BasePerformanceStore } from './base-performance-store';

import { DURATION_PERIOD } from '../../constants';
import { TYPES } from '../../types';
import { QueuePerformance, Report } from '../../models';
import { CollectedInfoService, DashboardService } from '../../data-services/interfaces';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { QueueStore } from '../queues';
import { DASHBOARD_REPORTS_NAMES } from '../../constants/dashboard-reports';

@injectable()
export class QueuesPerformanceStore extends BasePerformanceStore<QueuePerformance> {
    constructor(
        @inject(TYPES.COLLECTED_INFO_SERVICE) private readonly collectedInfoService: CollectedInfoService,
        @inject(TYPES.DASHBOARD_SERVICE) private dashboardService: DashboardService,
        @inject(TYPES.QUEUE_STORE) private queueStore: QueueStore
    ) {
        super();
    }

    @action
    loadData() {
        return this
            .loadDataGeneric((params: DashboardRequestApiParams) => this
                .fetchPerformanceData(params.from, params.to, params.aggregation));
    }

    @action
    async fetchPerformanceData(from: string, to: string, aggregation: DURATION_PERIOD) {
        this.isDataLoading = true;

        try {
            await this.queueStore.loadRegularAndHistoricalQueues();

            const performanceData = await this
                .dashboardService
                .getQueuesPerformance({ from, to, aggregation });

            (performanceData || []).forEach(queuePerformance => {
                const queue = this.queueStore.getQueueById(queuePerformance.id);
                queuePerformance.setQueueName(queue?.name || queuePerformance.id);
            });

            this.isDataLoading = false;
            return performanceData;
        } catch (e) {
            this.isDataLoading = false;
            throw e;
        }
    }

    @computed
    get lineChartData(): Serie[] {
        if (this.getPerformanceData) {
            return this.getPerformanceData.reduce<Serie[]>((selectedQueues, queue) => {
                if (queue.isChecked) {
                    return selectedQueues.concat([{
                        id: queue.id,
                        color: queue.color,
                        data: queue.lineChartData
                    }]);
                }
                return selectedQueues;
            }, []);
        }
        return [];
    }

    /**
     * Collects reports for the dashboard
     *
     * @returns - all reports for the dashboard
     */
    @computed
    get reports(): Report[] {
        const { QUEUES_TOTAL_DECISIONS, QUEUES_TOTAL_REVIEWED_STATS } = DASHBOARD_REPORTS_NAMES.QUEUES;

        const totalReviewReport = this.totalReviewdStats(QUEUES_TOTAL_REVIEWED_STATS);
        const fullPerformanceReport = this.fullPerformanceReport(QUEUES_TOTAL_DECISIONS);

        return [totalReviewReport, fullPerformanceReport]
            .filter(report => report !== null) as Report[];
    }
}
