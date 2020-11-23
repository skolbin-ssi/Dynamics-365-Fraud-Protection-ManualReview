// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed, observable } from 'mobx';
import { inject, injectable } from 'inversify';
import { UnparseObject } from 'papaparse';

import { Serie } from '@nivo/line';

import { BasePerformanceStore } from './base-performance-store';

import {
    DecisionPieDatum, PerformanceMetrics, ProcessingTimeMetric, QueuePerformance
} from '../../models/dashboard';
import { TYPES } from '../../types';
import { CollectedInfoService, DashboardService, UserService } from '../../data-services/interfaces';
import { DURATION_PERIOD } from '../../constants';
import { ProgressPerformanceMetric } from '../../models/dashboard/progress-performance-metric';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { Report } from '../../models/misc';
import { User } from '../../models/user';
import { PerformanceParsedQueryUrl } from '../../utility-services';
import { QueueStore } from '../queues';
import {
    ANALYSTS_PERFORMANCE_OVERVIEW_REPORT_NAMES,
    DASHBOARD_REPORTS_NAMES
} from '../../constants/dashboard-reports';

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
        @inject(TYPES.DASHBOARD_SERVICE) private dashboardService: DashboardService,
        @inject(TYPES.QUEUE_STORE) private queueStore: QueueStore
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
    get pieChartData(): DecisionPieDatum[] {
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

    @computed
    get isGenerateButtonsDisabled() {
        return this.isDataLoading
            || this.isTotalPerformanceLoading
            || this.isProcessingTimeMetricLoading;
    }

    /**
     * Collects reports for the dashboard
     *
     * @param isPersonal - indicates whether it is personal reports page
     */
    reports(isPersonal = false): Report[] {
        return computed(() => {
            const {
                totalReviewedStats,
                performanceByQueue,
                performanceOverview,
                decisions
            } = this.getReportsNames(isPersonal);

            return [
                this.totalReviewdStats(totalReviewedStats),
                this.performanceReport(performanceByQueue),
                this.analystOverviewReport(performanceOverview),
                this.totalDecisionsReport(decisions)
            ].filter(report => report !== null) as Report[];
        }).get();
    }

    private getReportsNames(isPersonal: boolean) {
        const {
            ANALYST_TOTAL_REVIEWED_STATS,
            ANALYST_DECISIONS_BY_QUEUE,
            ANALYST_PERFORMANCE_OVERVIEW,
            ANALYST_DECISIONS
        } = DASHBOARD_REPORTS_NAMES.ANALYST;

        const {
            PERSONAL_TOTAL_REVIEWED_STATS,
            PERSONAL_PERFORMANCE_BY_QUEUE,
            PERSONAL_PERFORMANCE_OVERVIEW,
            PERSONAL_DECISIONS
        } = DASHBOARD_REPORTS_NAMES.PERSONAL_PERFORMANCE;

        let totalReviewedStats = ANALYST_TOTAL_REVIEWED_STATS;
        let performanceByQueue = ANALYST_DECISIONS_BY_QUEUE;
        let performanceOverview = ANALYST_PERFORMANCE_OVERVIEW;
        let decisions = ANALYST_DECISIONS;

        if (isPersonal) {
            totalReviewedStats = PERSONAL_TOTAL_REVIEWED_STATS;
            performanceByQueue = PERSONAL_PERFORMANCE_BY_QUEUE;
            performanceOverview = PERSONAL_PERFORMANCE_OVERVIEW;
            decisions = PERSONAL_DECISIONS;
        }

        return {
            performanceByQueue,
            totalReviewedStats,
            performanceOverview,
            decisions
        };
    }

    /** ___ STARTS REPORTS GENERATION METHODS ___ */

    /**
     * Returns report
     * @param name - report name
     */
    private totalDecisionsReport(name: string): Report | null {
        return computed(() => {
            if (this.totalPerformance) {
                const reportRawData = this.totalPerformance.totalDecisionsReport;

                const rawObjectData: UnparseObject = {
                    fields: ['good, %', 'bad, %', 'watched, %'],
                    data: [
                        +reportRawData.good,
                        +reportRawData.bad,
                        +reportRawData.watched
                    ]
                };

                return this.csvReportBuilder.buildReport(name, rawObjectData);
            }

            return null;
        }).get();
    }

    /**
     * Returns report
     * @param name - report name
     */
    private analystOverviewReport(name: string) {
        return computed(() => {
            if (this.progressPerformanceMetric && this.processingTimeMetric) {
                let rawData: any[] = [];

                const reportsSummary = [
                    ...this.progressPerformanceMetric.reportSummary,
                    ...this.processingTimeMetric.reportSummary
                ];

                try {
                    const displayNames = Object.values(ANALYSTS_PERFORMANCE_OVERVIEW_REPORT_NAMES);

                    rawData = reportsSummary.map((progress, index) => [
                        [displayNames[index], progress.current],
                        [`${displayNames[index]}, %`, progress.progress || 0]
                    ]).flat(1);
                } catch (e) {
                    rawData = [];
                }

                const unparseObject = {
                    fields: ['name', 'metric'],
                    data: rawData
                };

                return this.csvReportBuilder.buildReport(name, unparseObject);
            }

            return null;
        }).get();
    }

    /** ___ END REPORTS GENERATION METHODS ___ */
}
