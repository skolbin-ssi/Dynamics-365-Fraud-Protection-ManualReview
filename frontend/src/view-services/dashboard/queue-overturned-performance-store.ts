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
import { QueueStore } from '../queues';
import { DASHBOARD_REPORTS_NAMES } from '../../constants/dashboard-reports';

export class QueueOverturnedPerformanceStore extends BaseOverturnedPerformanceStore<QueuePerformance> {
    constructor(
        @inject(TYPES.DASHBOARD_SERVICE) protected dashboardService: DashboardService,
        @inject(TYPES.DASHBOARD_ANALYST_PERFORMANCE_STORE) protected analystPerformanceStore: AnalystPerformanceStore,
        @inject(TYPES.USER_SERVICE) private userService: UserService,
        @inject(TYPES.QUEUE_STORE) private queueStore: QueueStore
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
            await this.queueStore.loadRegularAndHistoricalQueues();

            const performanceData = await this
                .dashboardService
                .getQueuesPerformance({
                    from, to, aggregation, analyst
                });

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

    /**
     * Collects reports for the dashboard
     *
     * @param isPersonal - indicates whether it is personal reports page
     */
    reports(isPersonal = false): Report[] {
        return computed(() => {
            const { overturnedDecisions, overturnedRate } = this.getReportsNames(isPersonal);
            return [
                this.overturnedActionsReport(overturnedDecisions),
                this.accuracyReport(overturnedRate)
            ].filter(report => report !== null) as Report[];
        }).get();
    }

    private getReportsNames(isPersonal: boolean) {
        const { ANALYST_OVERTURNED_DECISIONS_RATE, ANALYST_OVERTURNED_QUEUE_RATE } = DASHBOARD_REPORTS_NAMES.ANALYST;
        const { PERSONAL_OVERTURNED_DECISIONS_RATE, PERSONAL_OVERTURNED_QUEUE_RATE } = DASHBOARD_REPORTS_NAMES.PERSONAL_PERFORMANCE;

        let overturnedDecisions = ANALYST_OVERTURNED_DECISIONS_RATE;
        let overturnedRate = ANALYST_OVERTURNED_QUEUE_RATE;

        if (isPersonal) {
            overturnedDecisions = PERSONAL_OVERTURNED_DECISIONS_RATE;
            overturnedRate = PERSONAL_OVERTURNED_QUEUE_RATE;
        }

        return {
            overturnedDecisions,
            overturnedRate
        };
    }
}
