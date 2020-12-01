// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { action, computed } from 'mobx';

import { Serie } from '@nivo/line';

import { BasePerformanceStore } from './base-performance-store';

import { AnalystPerformance } from '../../models/dashboard';
import { DashboardService, UserService } from '../../data-services/interfaces';
import { TYPES } from '../../types';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { Report } from '../../models/misc';
import { DASHBOARD_REPORTS_NAMES } from '../../constants/dashboard-reports';

@injectable()
export class AnalystsPerformanceStore extends BasePerformanceStore<AnalystPerformance> {
    constructor(
        @inject(TYPES.DASHBOARD_SERVICE) protected dashboardService: DashboardService,
        @inject(TYPES.USER_SERVICE) private userService: UserService

    ) {
        super();
    }

    @action
    loadData() {
        return this.loadDataGeneric((params: DashboardRequestApiParams) => this.fetchPerformanceData(params));
    }

    @action
    async fetchPerformanceData(params: DashboardRequestApiParams) {
        this.isDataLoading = true;

        try {
            this.performanceData = await this
                .dashboardService
                .getAnalystsPerformance(params);

            this.isDataLoading = false;
            return this.performanceData;
        } catch (e) {
            this.isDataLoading = false;
            throw e;
        }
    }

    @computed
    get lineChartData(): Serie[] {
        if (this.performanceData) {
            return this.performanceData.reduce<Serie[]>((selectedAnalyst, analyst) => {
                if (analyst.isChecked) {
                    return selectedAnalyst.concat([{
                        id: analyst.id,
                        color: analyst.color,
                        data: analyst.lineChartData
                    }]);
                }
                return selectedAnalyst;
            }, []);
        }
        return [];
    }

    /**
     * Collects reports for the dashboard
     */
    @computed
    get reports(): Report[] {
        const { ANALYSTS_TOTAL_REVIEWED_STATS, ANALYSTS_TOTAL_DECISIONS } = DASHBOARD_REPORTS_NAMES.ANALYSTS;

        return [
            this.totalReviewdStats(ANALYSTS_TOTAL_REVIEWED_STATS),
            this.fullPerformanceReport(ANALYSTS_TOTAL_DECISIONS)
        ].filter(report => report !== null) as Report[];
    }
}
