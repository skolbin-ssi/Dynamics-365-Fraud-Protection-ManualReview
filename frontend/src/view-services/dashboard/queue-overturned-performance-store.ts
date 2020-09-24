// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed } from 'mobx';
import { inject } from 'inversify';

import { BaseOverturnedPerformanceStore } from './base-overturned-performance-store';
import { AnalystPerformanceStore } from './analyst-performance-store';

import { TYPES } from '../../types';
import { QueuePerformance } from '../../models/dashboard';
import { DashboardService, UserService } from '../../data-services/interfaces';
import { DURATION_PERIOD } from '../../constants';
import { Report } from '../../models/misc';

export class QueueOverturnedPerformanceStore extends BaseOverturnedPerformanceStore<QueuePerformance> {
    constructor(
        @inject(TYPES.DASHBOARD_SERVICE) protected dashboardService: DashboardService,
        @inject(TYPES.DASHBOARD_ANALYST_PERFORMANCE_STORE) protected analystPerformanceStore: AnalystPerformanceStore,
        @inject(TYPES.USER_SERVICE) private userService: UserService
    ) {
        super();
    }

    @action
    loadData(analystPerformanceStore: AnalystPerformanceStore) {
        return this.loadDataGeneric(({ from, aggregation, to }) => {
            const { analystId } = analystPerformanceStore;

            if (analystId) {
                return this.fetchPerformanceData(from, to, aggregation, analystId);
            }

            return Promise.resolve(null);
        });
    }

    @action
    async fetchPerformanceData(from: string, to: string, aggregation: DURATION_PERIOD, analyst: string) {
        this.isDataLoading = true;

        try {
            const performanceData = await this
                .dashboardService
                .getQueuesPerformance({
                    from, to, aggregation, analyst
                });

            this.isDataLoading = false;
            return performanceData;
        } catch (e) {
            this.isDataLoading = false;
            throw e;
        }
    }

    /**
     * Collects all generated CSV reports available for the store
     *
     * @returns Report[]
     */
    @computed
    get reports(): Report[] {
        const reports = [];

        if (this.overturnedActionsReport) {
            reports.push(this.overturnedActionsReport);
        }

        if (this.accuracyReport('Queues accuracy')) {
            reports.push(this.accuracyReport('Queues accuracy')!);
        }

        return reports;
    }
}
