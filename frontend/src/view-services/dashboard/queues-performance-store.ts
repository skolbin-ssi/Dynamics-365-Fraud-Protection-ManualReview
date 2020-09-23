// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { action, computed } from 'mobx';

import { Serie } from '@nivo/line';

import { BasePerformanceStore } from './base-performance-store';

import { DURATION_PERIOD } from '../../constants';
import { TYPES } from '../../types';
import { QueuePerformance } from '../../models/dashboard';
import { CollectedInfoService, DashboardService } from '../../data-services/interfaces';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { Report } from '../../models/misc';

@injectable()
export class QueuesPerformanceStore extends BasePerformanceStore<QueuePerformance> {
    constructor(
        @inject(TYPES.COLLECTED_INFO_SERVICE) private readonly collectedInfoService: CollectedInfoService,
        @inject(TYPES.DASHBOARD_SERVICE) private dashboardService: DashboardService,
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
            const performanceData = await this
                .dashboardService
                .getQueuesPerformance({ from, to, aggregation });

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
     */
    @computed
    get reports(): Report[] {
        const reports = [];

        if (this.totalReviewedReport) {
            reports.push(this.totalReviewedReport);
        }

        if (this.fullPerformanceReport('Queues performance')) {
            reports.push(this.fullPerformanceReport('Queues performance')!);
        }

        return reports;
    }
}
