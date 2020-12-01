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
import { DASHBOARD_REPORTS_NAMES } from '../../constants/dashboard-reports';

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
        const { QUEUE_OVERTURNED_DECISIONS_RATE, QUEUE_ANALYSTS_ACCURACY } = DASHBOARD_REPORTS_NAMES.QUEUE;

        return [
            this.overturnedActionsReport(QUEUE_OVERTURNED_DECISIONS_RATE),
            this.accuracyReport(QUEUE_ANALYSTS_ACCURACY)
        ].filter(report => report !== null) as Report[];
    }
}
