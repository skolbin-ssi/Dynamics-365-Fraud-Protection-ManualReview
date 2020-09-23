// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    action, computed, observable
} from 'mobx';
import { inject, injectable } from 'inversify';
import { UnparseObject } from 'papaparse';

import { Serie } from '@nivo/line';
import { PieDatum } from '@nivo/pie';

import { BasePerformanceStore } from './base-performance-store';

import { PerformanceMetrics, ProcessingTimeMetric, QueuePerformance } from '../../models/dashboard';
import { TYPES } from '../../types';
import { CollectedInfoService, DashboardService, UserService } from '../../data-services/interfaces';
import { DURATION_PERIOD } from '../../constants';
import { ProgressPerformanceMetric } from '../../models/dashboard/progress-performance-metric';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { Report } from '../../models/misc';
import { formatMetricToPercentageString } from '../../utils/text';
import { User } from '../../models/user';
import { PerformanceParsedQueryUrl } from '../../utility-services';

@injectable()
export class AnalystPerformanceStore extends BasePerformanceStore<QueuePerformance> {
    @observable totalPerformance: PerformanceMetrics | null = null;

    @observable isTotalPerformanceLoading = false;

    @observable analystId: string = '';

    @observable progressPerformanceMetric: ProgressPerformanceMetric | null = null;

    @observable isProgressPerformanceMetricLoading = false;

    @observable processingTimeMetric: ProcessingTimeMetric | null = null;

    @observable isProcessingTimeMetricLoading = false;

    @observable
    private analyst: User | null = null;

    constructor(
        @inject(TYPES.USER_SERVICE) private readonly userService: UserService,
        @inject(TYPES.COLLECTED_INFO_SERVICE) private collectedInfoService: CollectedInfoService,
        @inject(TYPES.DASHBOARD_SERVICE) private dashboardService: DashboardService
    ) {
        super();
    }

    /**
     *  Will load queues performance each time when any of autorun function dependencies
     *  will changed (e.g: fromDate, toDate, aggregation or analyst id)
     */
    @action
    loadData() {
        return this.loadDataGeneric(({ from, to, aggregation }: DashboardRequestApiParams) => {
            const { analystId } = this;

            this.fetchTotalPerformanceMetrics(from, to, aggregation, analystId);
            this.fetchProcessingTimeMetric(from, to, aggregation, analystId);
            this.fetchProgressPerformanceMetric(from, to, aggregation, analystId);

            return this.fetchPerformanceData(from, to, aggregation, analystId);
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

    @action
    async fetchTotalPerformanceMetrics(from: string, to: string, aggregation: DURATION_PERIOD, analyst: string) {
        this.isTotalPerformanceLoading = true;

        try {
            this.totalPerformance = await this
                .dashboardService
                .getTotalPerformanceMetrics({
                    from, to, aggregation, analyst
                });
            this.isTotalPerformanceLoading = false;
        } catch (e) {
            this.isTotalPerformanceLoading = false;

            throw e;
        }
    }

    @action
    async fetchProgressPerformanceMetric(from: string, to: string, aggregation: DURATION_PERIOD, analyst: string) {
        this.isProgressPerformanceMetricLoading = true;

        try {
            this.progressPerformanceMetric = await this
                .dashboardService
                .getProgressPerformanceMetric({
                    from, to, aggregation, analyst
                });
            this.isProgressPerformanceMetricLoading = false;
        } catch (e) {
            this.isProgressPerformanceMetricLoading = false;

            throw e;
        }
    }

    @computed
    get maxYTicksValue() {
        if (this.performanceData) {
            const data = this.performanceData.map(analyst => analyst.lineChartMaxYValue);
            return Math.max(...data);
        }

        return 5;
    }

    @action
    async fetchProcessingTimeMetric(from: string, to: string, aggregation: DURATION_PERIOD, analyst: string) {
        this.isProcessingTimeMetricLoading = true;

        try {
            this.processingTimeMetric = await this
                .dashboardService
                .getProcessingTimePerformanceMetrics({
                    from, to, aggregation, analyst
                });
            this.isProcessingTimeMetricLoading = false;
        } catch (e) {
            this.isProcessingTimeMetricLoading = false;

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

    @computed
    get pieChartData(): PieDatum[] {
        if (this.totalPerformance) {
            return this.totalPerformance.chartData;
        }

        return [];
    }

    @action
    setAnalystId(id: string) {
        if (id !== this.analystId) {
            this.setUrlSelectedIds([]);
        }

        this.analystId = id;
    }

    @action
    async loadAnalyst() {
        if (this.analystId) {
            this.analyst = await this.collectedInfoService.getHistoricalUser(this.analystId);
        }
    }

    /**
     *  Set initial values for the store, when page has mounted
     *  and URL parameters are in the URL
     *
     * @param parsedQuery - parsed URL params
     */
    @action
    setParsedUrlParams(parsedQuery: PerformanceParsedQueryUrl) {
        const { aggregation, rating, ids } = parsedQuery;

        if (ids) {
            this.setUrlSelectedIds(ids);
        }

        if (aggregation) {
            this.setAggregation(aggregation);
        }

        if (rating) {
            this.setRating(rating);
        }
    }

    @computed
    get analystAsPersona() {
        if (this.analyst) {
            return this.analyst.asPersona;
        }

        return null;
    }

    @action
    clearAnalystId() {
        this.analystId = '';
    }

    @action
    setAnalyst(analyst: User) {
        this.analyst = analyst;
    }

    @action
    clearAnalyst() {
        this.analyst = null;
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

        if (this.performanceReport('Queues performance')) {
            reports.push(this.performanceReport('Queues performance')!);
        }

        if (this.analystOverviewReport) {
            reports.push(this.analystOverviewReport);
        }

        if (this.totalDecisionsReport) {
            reports.push(this.totalDecisionsReport);
        }

        return reports;
    }

    // TODO: Move out this logic to more generic class
    @computed
    private get totalDecisionsReport(): Report | null {
        if (this.totalPerformance) {
            const REPORT_NAME = 'Decisions for the period';
            const reportRawData = this.totalPerformance.totalDecisionsReport;

            const rawObjectData: UnparseObject = {
                fields: ['good', 'bad', 'watched'],
                data: [
                    formatMetricToPercentageString(+reportRawData.good),
                    formatMetricToPercentageString(+reportRawData.bad),
                    formatMetricToPercentageString(+reportRawData.watched)
                ]
            };

            return AnalystPerformanceStore.buildReport(REPORT_NAME, rawObjectData);
        }

        return null;
    }

    @computed
    private get analystOverviewReport() {
        if (this.progressPerformanceMetric) {
            const REPORT_NAME = 'Analyst performance overview';

            const {
                reviewedProgress,
                annualReviewedProgress,
                goodDecisionsProgress,
                annualGoodDecisionsProgress,
                watchDecisionsProgress,
                annualWatchDecisionsProgress,
                badDecisionsProgress,
                annualBadDecisionsProgress,
                escalatedItemsProgress,
                annualEscalatedItemsProgress
            } = this.progressPerformanceMetric;

            let unparseObject: Object = {
                'number of decisions': reviewedProgress.current,
                'annual number of decisions': annualReviewedProgress.current,
                'good decisions': goodDecisionsProgress.current,
                'annual good decisions': annualGoodDecisionsProgress.current,
                'watch decisions': watchDecisionsProgress.current,
                'annual watch decisions': annualWatchDecisionsProgress.current,
                'bad decisions': badDecisionsProgress.current,
                'annual bad decisions': annualBadDecisionsProgress.current,
                'escalated items': escalatedItemsProgress.current,
                'annual escalated items': annualEscalatedItemsProgress.current
            };

            if (this.processingTimeMetric) {
                const { waistedTime, getTimeToMakeDecision } = this.processingTimeMetric;
                unparseObject = {
                    ...unparseObject,
                    'waisted time': waistedTime.current,
                    'time to make a decision': getTimeToMakeDecision.current

                };

                return this.CSVReportBuilder.buildReport(REPORT_NAME, [unparseObject]);
            }

            return this.CSVReportBuilder.buildReport(REPORT_NAME, [unparseObject]);
        }

        return null;
    }
}
