import { inject, injectable } from 'inversify';
import { action, computed, observable } from 'mobx';

import { Serie } from '@nivo/line';
import { PieDatum } from '@nivo/pie';

import { UnparseObject } from 'papaparse';
import { AxiosError } from 'axios';
import { BasePerformanceStore } from './base-performance-store';

import { TYPES } from '../../types';
import { AnalystPerformance, PerformanceMetrics } from '../../models/dashboard';
import { Report } from '../../models/misc';
import { DURATION_PERIOD, } from '../../constants';

import {
    CollectedInfoService, DashboardService, QueueService, UserService
} from '../../data-services/interfaces';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { formatMetricToPercentageString } from '../../utils/text';
import { Queue } from '../../models';

@injectable()
export class QueuePerformanceStore extends BasePerformanceStore<AnalystPerformance> {
    @observable totalPerformance: PerformanceMetrics | null = null;

    @observable isTotalPerformanceLoading = false;

    @observable queueId: string = '';

    @observable queue: Queue | null = null;

    @observable
    isQueueLoading = false;

    constructor(
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService,
        @inject(TYPES.COLLECTED_INFO_SERVICE) private readonly collectedInfoService: CollectedInfoService,
        @inject(TYPES.DASHBOARD_SERVICE) protected dashboardService: DashboardService,
        @inject(TYPES.USER_SERVICE) private userService: UserService

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
                this.fetchTotalPerformanceMetrics(from, to, aggregation, queueId);
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
    async fetchTotalPerformanceMetrics(from: string, to: string, aggregation: DURATION_PERIOD, queue: string) {
        this.isTotalPerformanceLoading = true;

        try {
            this.totalPerformance = await this
                .dashboardService
                .getTotalPerformanceMetrics({
                    from, to, aggregation, queue
                });

            this.isTotalPerformanceLoading = false;
        } catch (e) {
            this.isTotalPerformanceLoading = false;

            throw e;
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
    get pieChartData(): PieDatum[] {
        if (this.totalPerformance) {
            return this.totalPerformance.chartData;
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
                fields: ['approved', 'rejected', 'watched'],
                data: [
                    formatMetricToPercentageString(+reportRawData.approved),
                    formatMetricToPercentageString(+reportRawData.rejected),
                    formatMetricToPercentageString(+reportRawData.watched)
                ]
            };

            return QueuePerformanceStore.buildReport(REPORT_NAME, rawObjectData);
        }

        return null;
    }

    @computed
    get getQueueName() {
        if (this.queue) {
            return this.queue.name;
        }

        return '';
    }

    // TODO: Move this logic to a separate service and put under one generic method getQueue()
    //  and make the benefit of checking cached queues if any
    @action
    async loadQueue() {
        this.isQueueLoading = true;

        try {
            this.isQueueLoading = true;

            this.queue = await this.queueService.getQueue(this.queueId);
            this.isQueueLoading = false;
            return this.queue;
        } catch (err) {
            if (err && err.response) {
                const axiosError = err as AxiosError;
                if (axiosError.response && axiosError.response.status === 404) {
                    this.queue = await this.fetchHistoricalQueue(this.queueId);
                    return this.queue;
                }
            }

            return null;
        }
    }

    // TODO: Move this logic to a separate service and put under one generic method getQueue()
    //  and make the benefit of checking cached queues if any
    private async fetchHistoricalQueue(queueId: string) {
        this.isQueueLoading = true;

        try {
            this.queue = await this.collectedInfoService.getQueueCollectedInfo(queueId);
            this.isQueueLoading = false;
            return this.queue;
        } catch (e) {
            this.isQueueLoading = false;
            throw e;
        }
    }

    @action
    clearQueue() {
        this.queue = null;
    }

    @action
    clearStore() {
        this.clearPerformanceData();
        this.resetRating();
        this.resetAggregation();
    }
}
