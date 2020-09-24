// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed } from 'mobx';

import { inject } from 'inversify';
import { BaseOverturnedPerformanceStore } from './base-overturned-performance-store';
import { QueuePerformanceStore } from './queue-performance-store';

import { TYPES } from '../../types';
import { AnalystPerformance } from '../../models/dashboard';
import { DURATION_PERIOD } from '../../constants';
import { DashboardService, UserService } from '../../data-services/interfaces';
import { Report } from '../../models/misc';

export class AnalystOverturnedPerformanceStore extends BaseOverturnedPerformanceStore<AnalystPerformance> {
    constructor(
        @inject(TYPES.DASHBOARD_SERVICE) protected dashboardService: DashboardService,
        @inject(TYPES.QUEUE_PERFORMANCE_STORE) protected queuePerformanceStore: QueuePerformanceStore,
        @inject(TYPES.USER_SERVICE) private userService: UserService
    ) {
        super();
    }

    @action
    loadAnalystData(queuePerformanceStore: QueuePerformanceStore) {
        return this.loadDataGeneric(({ from, to, aggregation }) => {
            const { queueId } = queuePerformanceStore;

            if (queueId) {
                return this.fetchPerformanceData(from, to, aggregation, queueId);
            }

            return Promise.resolve(null);
        });
    }

    @action
    async fetchPerformanceData(from: string, to: string, aggregation: DURATION_PERIOD, queue: string) {
        this.isDataLoading = true;

        try {
            const performanceData = await this
                .dashboardService
                .getAnalystsPerformance({
                    from, to, aggregation, queue
                });

            this.isDataLoading = false;
            return performanceData;
        } catch (e) {
            this.isDataLoading = false;
            throw e;
        }
    }

    @computed
    get reports(): Report[] {
        const reports = [];

        if (this.overturnedActionsReport) {
            reports.push(this.overturnedActionsReport);
        }

        if (this.accuracyReport('Analysts accuracy')) {
            reports.push(this.accuracyReport('Analysts accuracy')!);
        }

        return reports;
    }
}
