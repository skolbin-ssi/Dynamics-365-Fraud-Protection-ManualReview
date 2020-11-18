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

import {
    AnalystPerformance,
    QueueRiskScoreOverview,
    QueueRiskScoreDistributionBarDatum
} from '../../models/dashboard';
import {
    DURATION_PERIOD,
    DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE,
} from '../../constants';
import { NOT_FOUND } from '../../constants/http-status-codes';
import {
    UserService,
    QueueService,
    DashboardService,
    CollectedInfoService
} from '../../data-services/interfaces';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { QueueStore } from '../queues';

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
        const reports = [];

        if (this.totalReviewedReport) {
            reports.push(this.totalReviewedReport);
        }

        if (this.performanceReport('Analysts performance')) {
            reports.push(this.performanceReport('Analysts performance')!);
        }

        if (this.riskScoreDistributionReport) {
            reports.push(this.riskScoreDistributionReport);
        }

        return reports;
    }

    // TODO: Implement report generating for the risk-score distribution and remove commented code, once API will be ready
    @computed
    private get riskScoreDistributionReport(): Report | null {
        // if (this.totalPerformance) {
        //     const REPORT_NAME = 'Decisions for the period';
        //     const reportRawData = this.totalPerformance.risckScoreDistributionReport;
        //
        //     const rawObjectData: UnparseObject = {
        //         fields: ['approved', 'rejected', 'watched'],
        //         data: [
        //             formatMetricToPercentageString(+reportRawData.approved),
        //             formatMetricToPercentageString(+reportRawData.rejected),
        //             formatMetricToPercentageString(+reportRawData.watched)
        //         ]
        //     };
        //
        //     return QueuePerformanceStore.buildReport(REPORT_NAME, rawObjectData);
        // }

        return null;
    }

    @computed
    get getQueueName() {
        if (this.queue) {
            return this.queue.name;
        }

        return '';
    }

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

    @action
    clearQueue() {
        this.queue = null;
    }

    @action
    clearRiskScoreDistributionData() {
        this.riskScoreDistribution = null;
    }

    @action
    clearStore() {
        this.clearRiskScoreDistributionData();
        this.clearPerformanceData();
        this.resetRating();
        this.resetAggregation();
    }
}
