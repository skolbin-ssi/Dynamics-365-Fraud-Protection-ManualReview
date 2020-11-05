// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import {
    action,
    autorun,
    computed,
    observable,
    IReactionDisposer
} from 'mobx';

import { Serie } from '@nivo/line';
import { UnparseObject } from 'papaparse';

import { DashboardScreenStore } from './dashboard-screen-store';

import { TYPES } from '../../types';
import { ItemPlacementMetrics, QueueSizeHistory } from '../../models/dashboard/deman-supply';
import { formatToISOStringWithLocalTimeZone } from '../../utils/date';
import {
    QUEUE_VIEW_TYPE,
    STATISTIC_AGGREGATION,
    CHART_AGGREGATION_PERIOD,
    DEFAULT_TIME_TO_SLA_DURATION,
    DEFAULT_TIME_TO_TIMEOUT_DURATION
} from '../../constants';
import { DashboardService, QueueService, UserService } from '../../data-services/interfaces';
import { QueueStore } from '../queues';
import { Queue, Report } from '../../models';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { OverviewItem, QueuesOverview } from '../../models/queues';
import { CSVReportBuilder } from '../../utility-services';

export interface DemandSupplyDashboardTableItemData {
    queueName: string;
    remaining?: number;
    newOrders: number;
    reviewed: number;
    nearToSlaCount?: number;
    nearToTimeoutCount?: number;
    queue?: Queue
}

@injectable()
export class DashboardDemandSupplyScreenStore {
    @observable aggregation: CHART_AGGREGATION_PERIOD = CHART_AGGREGATION_PERIOD.DAY;

    /**
     * ___ DATA FOR CHARTS ___
     */

    /**
     * Data (metrics) - required for building [ Total reviewed(released) / new ] chart
     */
    @observable itemPlacementMetricsOverall: ItemPlacementMetrics | null = null;

    /**
     * Data (metrics) -  required for building [ Total remaining orders ] chart
     */
    @observable queueSizeHistoryOverall: QueueSizeHistory | null = null;

    /**
     * ___ DATA FOR THE TABLE ___
     */

    /**
     *  Metrics required for parts of data table columns, specifically:
     *  Remaining (size field), Analysts (reviewers field), view type of queues is DIRECT
     */
    @observable queues: Queue[] | null = null;

    /**
     * Metrics required for parts of data table columns, specifically:
     * New orders (received), Reviewed (released) - metrics for total files of the model
     */
    @observable itemPlacementMetrics: ItemPlacementMetrics[] | null = null;

    /**
     * Metrics required for parts of data table columns, specifically:
     * Near to SLA, and Near to Timeout fields of the table
     */
    @observable queuesOverview: QueuesOverview | null = null;

    @observable isQueuesSizeHistoryLoading = false;
    /**
     * ___ LOADERS ___
     */

    @observable isItemPlacementMetricsOverallLoading = false;

    @observable isQueueSizeHistoryOverallLoading = false;

    @observable isOverallDataLoading = false;

    @observable isItemPlacementLoading = false;

    @observable isQueuesOverviewLoading = false;

    /**
     * CSV report builder
     */
    private readonly CSVReportBuilder = new CSVReportBuilder();

    constructor(
        @inject(TYPES.DASHBOARD_SERVICE) private dashboardService: DashboardService,
        @inject(TYPES.DASHBOARD_SCREEN_STORE) private dashboardScreenStore: DashboardScreenStore,
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService,
        @inject(TYPES.QUEUE_STORE) private queueStore: QueueStore,
        @inject(TYPES.USER_SERVICE) private userService: UserService
    ) {
        this.queueStore.loadRegularAndHistoricalQueues();
    }

    loadData(): IReactionDisposer {
        return autorun(() => {
            if (this.getDashboardApiParams) {
                const { from, to, aggregation } = this.getDashboardApiParams;

                this.fetchItemPlacementOverall({ from, to, aggregation });
                this.fetchQueuesSizeHistoryOverall({ from, to, aggregation });

                // TODO: Think on how to make a parallel requests e.g.: axios.all
                this.fetchQueuesOverview();
                this.fetchQueues();
                this.fetchItemPlacement({ from, to, aggregation });
            }
        });
    }

    @action
    private async fetchItemPlacementOverall(params: DashboardRequestApiParams) {
        this.isItemPlacementMetricsOverallLoading = true;

        try {
            this.itemPlacementMetricsOverall = await this.dashboardService.getItemPlacementMetricsOverall(params);

            this.isItemPlacementMetricsOverallLoading = false;
        } catch (e) {
            this.isItemPlacementMetricsOverallLoading = false;

            throw e;
        }
    }

    @action
    async fetchQueuesSizeHistoryOverall(params: DashboardRequestApiParams) {
        this.isQueueSizeHistoryOverallLoading = true;

        try {
            this.queueSizeHistoryOverall = await this.dashboardService.getQueueSizeHistoryOverall(params);

            this.isQueueSizeHistoryOverallLoading = false;
        } catch (e) {
            this.isQueueSizeHistoryOverallLoading = false;

            throw e;
        }
    }

    @action
    private async fetchQueuesOverview() {
        this.isQueuesOverviewLoading = true;
        try {
            this.queuesOverview = await this.queueService
                .getQueuesOverview(DEFAULT_TIME_TO_SLA_DURATION, DEFAULT_TIME_TO_TIMEOUT_DURATION);

            this.isQueuesOverviewLoading = false;
        } catch (e) {
            this.isQueuesOverviewLoading = false;

            throw e;
        }
    }

    @action
    private async fetchQueues() {
        this.queues = await this.queueService.getQueues({ viewType: QUEUE_VIEW_TYPE.DIRECT });
    }

    @action
    private async fetchItemPlacement(params: DashboardRequestApiParams) {
        this.isItemPlacementLoading = true;

        try {
            this.itemPlacementMetrics = await this
                .dashboardService
                .getItemPlacementMetrics(params);

            this.isItemPlacementLoading = false;
        } catch (e) {
            this.isItemPlacementLoading = false;
            throw e;
        }
    }

    @action
    setAggregationPeriod(period: CHART_AGGREGATION_PERIOD) {
        this.aggregation = period;
    }

    @computed
    get getDashboardApiParams(): DashboardRequestApiParams | undefined {
        const toDate = this.dashboardScreenStore.getToDate;
        const fromDate = this.dashboardScreenStore.getFromDate;
        const aggregation = STATISTIC_AGGREGATION.get(this.aggregation)!;

        if (toDate && fromDate) {
            const from = formatToISOStringWithLocalTimeZone(fromDate);
            const to = formatToISOStringWithLocalTimeZone(toDate);

            return { from, to, aggregation };
        }

        return undefined;
    }

    /**
     * Chart data for [ Total reviewed(released) / new ] chart
     */
    @computed
    get itemPlacementMetricsOverallChartData(): Serie[] {
        if (this.itemPlacementMetricsOverall) {
            const { received, released } = this.itemPlacementMetricsOverall.getItemPlacementDatums;

            return [
                {
                    id: 'New orders',
                    data: received,
                    color: '#FF9314'
                },
                {
                    id: 'Released',
                    data: released,
                    color: '#2B88D8'
                }
            ];
        }

        return [];
    }

    /**
     * Chart data for [ Total remaining orders ] chart
     */
    @computed
    get queueSizeHistoryOverallChartData(): Serie[] {
        if (this.queueSizeHistoryOverall) {
            return [
                {
                    id: 'Remaining',
                    data: this.queueSizeHistoryOverall.getRemainingChartDatum,
                    color: '#BF82F1'
                }
            ];
        }

        return [];
    }

    @computed
    get remainingLineChartMaxYTick() {
        if (this.queueSizeHistoryOverallChartData.length) {
            const [remaining] = this.queueSizeHistoryOverallChartData;
            return Math.max(...remaining.data.map(it => it.y as number));
        }
        return 5;
    }

    @computed
    get totalLineChartMaxYTick() {
        if (this.itemPlacementMetricsOverallChartData.length) {
            const [reviewed, newOrders] = this.itemPlacementMetricsOverallChartData;
            return Math.max(...reviewed.data.map(it => it.y as number), ...newOrders.data.map(it => it.y as number));
        }
        return 5;
    }

    // TODO: The data table building computed function depends on the data sources from 3 different API endpoints,
    //  taking this into account implementation should check and match received data from the APIs implementing
    //  interceptions between data sources, change this method using such approach
    @computed
    get demandSupplyDashboardTableData(): DemandSupplyDashboardTableItemData[] | null {
        if (this.itemPlacementMetrics && this.queues && this.queuesOverview) {
            if (this.itemPlacementMetrics) {
                return this.itemPlacementMetrics.map(item => {
                    const remaining = this.getRemaining(item.id);
                    const { nearToSlaCount, nearToTimeoutCount } = this.getQueueOverviewMetrics(item.id);
                    const queue = this.getSpecificQueue(item.id);

                    return {
                        queueId: item.id,
                        queueName: queue?.name || item.id,
                        remaining,
                        newOrders: item.total.received,
                        reviewed: item.total.reviewed,
                        nearToSlaCount,
                        nearToTimeoutCount,
                        queue
                    };
                }).sort((a, b) => this.sortTableDataItemsByRemainingCount(a, b));
            }

            return null;
        }
        return null;
    }

    /**
     * Collects reports for the dashboard
     */
    @computed
    get reports(): Report[] {
        const reports = [];

        if (this.totalReviewedNewItemsReport) {
            reports.push(this.totalReviewedNewItemsReport);
        }

        if (this.totalRemainingOrdersReport) {
            reports.push(this.totalRemainingOrdersReport);
        }

        if (this.queuesOverviewReport) {
            reports.push(this.queuesOverviewReport);
        }

        return reports as Array<any>;
    }

    @computed
    private get totalReviewedNewItemsReport() {
        if (this.itemPlacementMetricsOverall) {
            const REPORT_NAME = 'Total reviewed/new orders';
            const rawData = this.itemPlacementMetricsOverall.totalReviewedNewItemsReport;

            if (rawData?.length) {
                const unparseObject: UnparseObject = {
                    fields: ['date', 'reviewed', 'new orders'],
                    data: rawData.flat()
                };

                return this.CSVReportBuilder.buildReport(REPORT_NAME, unparseObject);
            }
        }

        return null;
    }

    @computed
    private get totalRemainingOrdersReport() {
        if (this.queueSizeHistoryOverall) {
            const REPORT_NAME = 'Total remaining orders';
            const rawData = this.queueSizeHistoryOverall.remainingOrdersReport;

            if (rawData?.length) {
                const unparseObject: UnparseObject = {
                    fields: ['date', 'remaining orders'],
                    data: rawData
                };
                return this.CSVReportBuilder.buildReport(REPORT_NAME, unparseObject);
            }
        }

        return null;
    }

    @computed
    private get queuesOverviewReport() {
        if (this.demandSupplyDashboardTableData) {
            const REPORT_NAME = 'Queues demand/supply overview';
            const checkNA = (item: any) => (typeof item !== 'undefined' ? item : 'N/A');

            const rawData = this.demandSupplyDashboardTableData.map(item => {
                const analystsIds = item.queue?.assignees?.map(analyst => analyst) || [];

                return [
                    item.queueName,
                    checkNA(item.remaining),
                    item.newOrders,
                    item.reviewed,
                    checkNA(item.nearToSlaCount),
                    checkNA(item.nearToTimeoutCount),
                    [...analystsIds]];
            });

            const unparseObject: UnparseObject = {
                fields: ['name', 'remaining', 'new orders', 'reviewed', 'near to SLA', 'near to timeout', 'analysts ids'],
                data: rawData
            };

            return this.CSVReportBuilder.buildReport(REPORT_NAME, unparseObject);
        }

        return null;
    }

    private getRemaining(id: string) {
        if (this.queues) {
            return this.queues.find(queue => queue.queueId === id)?.size;
        }

        return undefined;
    }

    private getQueueOverviewMetrics(id: string): OverviewItem {
        if (this.queuesOverview) {
            return this.queuesOverview.get(id) || {} as OverviewItem;
        }

        return {} as OverviewItem;
    }

    /**
     * Sort table according to remaining value
     * Please, @see (https://stackoverflow.com/questions/56312968/javascript-sort-object-array-by-number-properties-which-include-undefined)
     * @param left - data item (DemandSupplyDashboardTableItemData)
     * @param right - data item (DemandSupplyDashboardTableItemData)
     */
    private sortTableDataItemsByRemainingCount(
        left: DemandSupplyDashboardTableItemData,
        right: DemandSupplyDashboardTableItemData
    ) {
        const leftRemaining = typeof left.remaining !== 'undefined';
        const rightRemaining = typeof right.remaining !== 'undefined';

        return +rightRemaining - +leftRemaining
            || (leftRemaining && right.remaining! - left.remaining!)
            || 0;
    }

    private getSpecificQueue(queueId: string) {
        return this.queues?.find(q => q.queueId === queueId) || this.queueStore.getQueueById(queueId);
    }
}
