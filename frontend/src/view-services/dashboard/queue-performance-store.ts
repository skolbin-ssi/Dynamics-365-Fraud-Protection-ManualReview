// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import {
    action, computed, observable, runInAction
} from 'mobx';

import { Serie } from '@nivo/line';

import { AxiosError } from 'axios';
import { BasePerformanceStore } from './base-performance-store';

import { TYPES } from '../../types';
import { Queue } from '../../models';
import { Report } from '../../models/misc';

import { AnalystPerformance, QueueRiskScoreDistributionBarDatum, QueueRiskScoreOverview } from '../../models/dashboard';
import { DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE, DURATION_PERIOD, } from '../../constants';
import { NOT_FOUND } from '../../constants/http-status-codes';
import {
    CollectedInfoService, DashboardService, QueueService, UserService
} from '../../data-services/interfaces';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { QueueStore } from '../queues';
import { DASHBOARD_REPORTS_NAMES } from '../../constants/dashboard-reports';

@injectable()
export class QueuePerformanceStore extends BasePerformanceStore<AnalystPerformance> {
    @observable riskScoreDistribution: QueueRiskScoreOverview | null = null;

    @observable queueId: string = '';

    @observable queue: Queue | null = null;

    @observable isQueueLoading = false;

    @observable isRiskScoreDistributionDataLoading = false;

    constructor(
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService,
        @inject(TYPES.COLLECTED_INFO_SERVICE) private readonly collectedInfoService: CollectedInfoService,
        @inject(TYPES.DASHBOARD_SERVICE) protected dashboardService: DashboardService,
        @inject(TYPES.USER_SERVICE) private userService: UserService,
        @inject(TYPES.QUEUE_STORE) private queueStore: QueueStore,
    ) {
        super();
    }

    /**
     *  Will load queues performance each time when any of autorun function dependencies
     *  will changed (e.g: fromDate, toDate, aggregation)
     */
    @action
    loadData() {
        return this.loadDataGeneric(({ from, to, aggregation }: DashboardRequestApiParams) => {
            const { queueId } = this;

            if (queueId) {
                this.fetchRiskScoreDistribution(queueId, from, to);

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

    @action
    async fetchRiskScoreDistribution(queueId: string, from: string, to: string) {
        this.isRiskScoreDistributionDataLoading = true;

        try {
            const riskScoreDistribution = await this.dashboardService.getQueueRiskScoreOverview({
                bucketSize: DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE,
                queue: queueId,
                from,
                to
            });

            runInAction(() => {
                this.riskScoreDistribution = riskScoreDistribution;
                this.isRiskScoreDistributionDataLoading = false;
            });
        } catch (e) {
            runInAction(() => {
                this.isRiskScoreDistributionDataLoading = false;
            });

            throw e;
        }
    }

    @action
    async loadQueue() {
        this.isQueueLoading = true;

        try {
            const queue = this.queueStore.getQueueById(this.queueId) || await this.queueService.getQueue(this.queueId);

            runInAction(() => {
                this.isQueueLoading = false;
                this.queue = queue;
            });
        } catch (err) {
            runInAction(() => {
                if (err && err.response) {
                    const { response } = err as AxiosError;

                    if (response && response.status === NOT_FOUND) {
                        this.fetchHistoricalQueue(this.queueId);
                    }
                }
            });
        } finally {
            runInAction(() => {
                this.isQueueLoading = false;
            });
        }
    }

    @action
    setQueueId(id: string) {
        if (id !== this.queueId) {
            this.setUrlSelectedIds([]);
        }

        this.queueId = id;
    }

    @computed
    get riskScoreDistributionBarChartData(): QueueRiskScoreDistributionBarDatum[] {
        if (this.riskScoreDistribution) {
            return this.riskScoreDistribution.barChartData;
        }

        return [];
    }

    @computed
    get substitutionRiskScoreDistributionBarChartData(): QueueRiskScoreDistributionBarDatum[] {
        if (this.riskScoreDistribution) {
            return this.riskScoreDistribution.substitutionBarChartData;
        }

        return [];
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
        const {
            QUEUE_TOTAL_REVIEWED_STATS,
            QUEUE_ANALYSTS_PERFORMANCE,
            QUEUE_RISK_SCORE_DISTRIBUTION
        } = DASHBOARD_REPORTS_NAMES.QUEUE;

        return [
            this.totalReviewdStats(QUEUE_TOTAL_REVIEWED_STATS),
            this.performanceReport(QUEUE_ANALYSTS_PERFORMANCE),
            this.riskScoreDistributionReport(QUEUE_RISK_SCORE_DISTRIBUTION)
        ].filter(report => report !== null) as Report[];
    }

    @computed
    get getQueueName() {
        if (this.queue) {
            return this.queue.name;
        }

        return '';
    }

    @action
    clearQueue() {
        this.queue = null;
    }

    @action
    clearRiskScoreDistributionData() {
        this.riskScoreDistribution = null;
    }

    @computed
    get isGenerateReportButtonDisabled() {
        return this.isDataLoading
            || this.isRiskScoreDistributionDataLoading;
    }

    @action
    clearStore() {
        this.clearRiskScoreDistributionData();
        this.clearPerformanceData();
        this.resetRating();
        this.resetAggregation();
    }

    /** ___ START REPORTS GENERATION METHODS ___ */

    /**
     * Returns generated report for risk score distribution
     * @param name - report name
     */
    private riskScoreDistributionReport(name: string): Report | null {
        return computed(() => {
            if (this.riskScoreDistributionBarChartData.length) {
                const reportRawData: Object[] = this.riskScoreDistributionBarChartData
                    .map(({
                        scoreDistributionRange, bad, watched, good
                    }) => ({
                        bucket: scoreDistributionRange,
                        good,
                        watched,
                        bad
                    }));

                return this.csvReportBuilder.buildReport(name, reportRawData);
            }

            return null;
        }).get();
    }

    /** ___ END REPORTS GENERATION METHODS ___ */

    @action
    private async fetchHistoricalQueue(queueId: string) {
        try {
            const queue = await this.collectedInfoService.getQueueCollectedInfo(queueId);

            runInAction(() => {
                this.queue = queue;
                this.isQueueLoading = false;
            });
        } catch (e) {
            runInAction(() => {
                this.isQueueLoading = false;
            });

            throw e;
        }
    }
}
