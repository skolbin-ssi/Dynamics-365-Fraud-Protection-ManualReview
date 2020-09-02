// eslint-disable-next-line max-classes-per-file
import {
    action, autorun, computed, IReactionDisposer, observable, reaction,
} from 'mobx';
import { inject, injectable } from 'inversify';

import { Serie } from '@nivo/line';

import { AxiosError } from 'axios';
import { UnparseObject } from 'papaparse';
import { DashboardScreenStore } from './dashboard-screen-store';

import { TYPES } from '../../types';
import { QueueStore } from '../queues';
import { Item, Queue, Report } from '../../models';
import { COLORS } from '../../styles/variables';
import { CollectedInfoService, DashboardService, QueueService } from '../../data-services/interfaces';
import { DashboardRequestApiParams } from '../../data-services/interfaces/dashboard-api-service';
import { excludeLocalTimeZoneDiff, getCurrentTimeDiff } from '../../utils/date';
import { CurrentProgress } from '../../models/dashboard/progress-performance-metric';
import { ItemPlacementMetrics, QueueSizeHistory } from '../../models/dashboard/deman-supply';
import {
    QUEUE_VIEW_TYPE,
    STATISTIC_AGGREGATION,
    CHART_AGGREGATION_PERIOD,
    DEFAULT_TIME_TO_SLA_DURATION,
    DEFAULT_TIME_TO_TIMEOUT_DURATION,
    DEFAULT_QUEUE_AUTO_REFRESH_CHECK_MILLISECONDS,
    DEFAULT_QUEUE_AUTO_REFRESH_INTERVAL_MILLISECONDS
} from '../../constants';
import { getProcessingDeadlineValues } from '../../utils';
import { LockedItemsStore } from '../locked-items-store';
import { CurrentUserStore } from '../current-user-store';
import { AutoRefreshStorageItemManger } from '../misc/auto-refresh-storage-item-manager';
import { CSVReportBuilder, LocalStorageService } from '../../utility-services';

export interface QueueItem {
    viewId: string;
    viewType: QUEUE_VIEW_TYPE;
    isLoading: boolean;
    isLoadingMoreItems: boolean;
    data: Item[] | null;
    canLoadMore: boolean;
}

class QueueItemImpl implements QueueItem {
    /**
     * Every 10 seconds queue items will be replace, in order to keep fresh
     * data list, see explanation in initQueueItemsAutoReplace
     */
    private static queueItemsDefaultReplaceTimeMilliseconds = 10 * 1000;

    @observable
    viewId = '';

    @observable
    canLoadMore = false;

    @observable
    data: Item[] | null = null;

    @observable
    isLoading = false;

    @observable
    isLoadingMoreItems = false;

    @observable
    viewType = '' as any;

    @observable
    isListAutoUpdateEnabled = false;

    @observable
    autoDataReplaceIntervalRef: number | undefined = undefined;

    constructor(viewType: QUEUE_VIEW_TYPE) {
        this.viewType = viewType;
    }

    /**
     * Initialize timeout countdown interval for each item that has lock date or has been locked
     */
    @action
    initItemsTimeoutCountdown() {
        if (this.data) {
            this.data = this.data.map(item => {
                if (item.lockedDate && !item.timeoutIntervalRef) {
                    item.initItemTimeoutCountdown();
                    return item;
                }
                return item;
            });
        }
    }

    /**
     * Update data list every set time interval, according to default value, list has to be updated
     *
     * Intention: Fabric UI DetailsList implemented using virtualization, that's why DetailsList data prop
     * can't listen updates each time when observable by mobx value is updated, in order to force list update
     * we need to create a brand new array by slicing the current one
     */
    initQueueItemsAutoReplace() {
        const isItemHasSomeLockedItems = this.data && this.data.some(item => !!item.lockedDate);

        if (isItemHasSomeLockedItems && !this.autoDataReplaceIntervalRef) {
            this.autoDataReplaceIntervalRef = window
                .setInterval(this.autoReplaceQueueItemsCallback, QueueItemImpl.queueItemsDefaultReplaceTimeMilliseconds);
        }
    }

    @action.bound
    autoReplaceQueueItemsCallback() {
        if (this.data) {
            this.data = [...this.data];
        }
    }

    @action
    setQueueItems(data: Item[], loadMore = false) {
        this.data = loadMore && this.data
            ? [...this.data, ...data]
            : data;
    }

    @action
    clearDataAutoReplaceInterval() {
        if (this.autoDataReplaceIntervalRef) {
            window.clearInterval(this.autoDataReplaceIntervalRef);
        }
    }

    @action
    clearQueueItemsInterval() {
        if (this.data) {
            this.data.forEach(item => item.clearTimeoutInterval());
        }
    }

    @action
    clearIntervals() {
        this.clearQueueItemsInterval();
        this.clearDataAutoReplaceInterval();
    }
}

@injectable()
export class DemandQueuePerformanceStore {
    @observable
    private queueId = '';

    @observable
    queue: Queue | null = null;

    @observable
    queueSizeHistory: QueueSizeHistory | null = null;

    @observable
    itemPlacementMetric: ItemPlacementMetrics | null = null;

    @observable
    aggregation: CHART_AGGREGATION_PERIOD = CHART_AGGREGATION_PERIOD.DAY;

    @observable
    regularQueueItems = new QueueItemImpl(QUEUE_VIEW_TYPE.REGULAR);

    @observable
    escalatedQueueItem = new QueueItemImpl(QUEUE_VIEW_TYPE.ESCALATION);

    /**
     * AutoRefreshStorageItemManger - manager for dealing with localStorage
     */
    private readonly autoRefreshStorageItemManager: AutoRefreshStorageItemManger;

    /**
     *  saveAutoRefreshReactionDisposerRef - IReaction disposer
     */
    private readonly saveAutoRefreshReactionDisposerRef: IReactionDisposer;

    /**
     * CSV report builder
     */
    private readonly CSVReportBuilder = new CSVReportBuilder();

    /**
     * Is auto refresh feature (toggle) enabled
     */
    @observable
    isAutoRefreshEnabled = true;

    /**
     * Last date of refresh
     */
    @observable
    lastRefreshQueueItemsMap: Map<string, number> = new Map();

    /**
     * Reference on queue items auto refresh interval
     */
    @observable
    refreshIntervalRef: number | null = null;

    /**
     * Current time stamp
     */
    @observable
    now: number = Date.now();

    @observable
    isQueueSizeHistoryLoading = false;

    @observable
    isItemsPlacementMetricsLoading = false;

    @observable
    isQueueLoading = false;

    constructor(
        @inject(TYPES.DASHBOARD_SERVICE) private dashboardService: DashboardService,
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService,
        @inject(TYPES.CURRENT_USER_STORE) private currentUserStore: CurrentUserStore,
        @inject(TYPES.LOCKED_ITEMS_STORE) private readonly lockedItemsStore: LockedItemsStore,
        @inject(TYPES.COLLECTED_INFO_SERVICE) private readonly collectedInfoService: CollectedInfoService,
        @inject(TYPES.DASHBOARD_SCREEN_STORE) private dashboardScreenStore: DashboardScreenStore,
        @inject(TYPES.QUEUE_STORE) private queueStore: QueueStore,
        @inject(TYPES.LOCAL_STORAGE_SERVICE) private localStorageService: LocalStorageService

    ) {
        this.autoRefreshStorageItemManager = this.getInstanceOfLocalStorageManager();

        this.saveAutoRefreshReactionDisposerRef = reaction(
            () => this.isAutoRefreshEnabled,
            isAutoRefreshEnabled => this.autoRefreshStorageItemManager.saveToggleState(isAutoRefreshEnabled)
        );

        this.initQueueItemsAutoRefresh();
    }

    @action
    toggleAutoRefresh(isEnabled: boolean = false) {
        if (isEnabled) {
            this.isAutoRefreshEnabled = true;
            this.initQueueItemsAutoRefresh();
        } else if (this.refreshIntervalRef) {
            this.isAutoRefreshEnabled = false;
            this.clearQueueItemsAutoRefreshInterval();
        }
    }

    @computed
    get lastQueueItemsUpdated() {
        const queueId = this.getQueueId();

        if (!queueId) { return null; }
        const lastUpdateTimestamp = this.lastRefreshQueueItemsMap.get(queueId);

        if (lastUpdateTimestamp) {
            const lastUpdatedMinutes = Math.floor((this.now - lastUpdateTimestamp) / 1000 / 60);

            if (lastUpdatedMinutes < 1) {
                return 'less than a minute ago';
            }

            return `${lastUpdatedMinutes} min ago`;
        }

        return null;
    }

    @action
    refreshQueueAndLockedItems() {
        this.clearQueueItems();
        this.fetchQueueItems(this.queue);
        this.lockedItemsStore.getLockedItems();
        this.setLastRefresh(this.queueId);
    }

    /**
     * Load queue
     */
    async loadQueue() {
        if (this.queueId) {
            const queue = await this.fetchQueue(this.queueId);

            if (queue) {
                this.fetchQueueItems(queue);
                this.setLastRefresh(this.queueId);
            }
        }
    }

    /**
     * Loads data for charts
     */
    loadQueueMetrics(): IReactionDisposer {
        return autorun(() => {
            if (this.getDashboardApiParams) {
                const { from, to, aggregation } = this.getDashboardApiParams;

                if (this.queueId) {
                    this.fetchQueueSizeHistory({
                        from, to, aggregation, queue: this.queueId
                    });
                    this.fetchItemsPlacementMetrics({
                        from, to, aggregation, queue: this.queueId
                    });
                }
            }
        });
    }

    @computed
    get getDashboardApiParams(): DashboardRequestApiParams | undefined {
        const toDate = this.dashboardScreenStore.getToDate;
        const fromDate = this.dashboardScreenStore.getFromDate;
        const aggregation = STATISTIC_AGGREGATION.get(this.aggregation)!;

        if (toDate && fromDate) {
            const from = excludeLocalTimeZoneDiff(fromDate);
            const to = excludeLocalTimeZoneDiff(toDate);

            return { from, to, aggregation };
        }

        return undefined;
    }

    /**
     *  Fetching more queue items by queue item type
     * @param viewId
     * @param viewType
     */
    loadMoreQueueItems(viewId: string, viewType: QUEUE_VIEW_TYPE) {
        switch (viewType) {
            case QUEUE_VIEW_TYPE.REGULAR:
                this.fetchRegularQueueItems(viewId, true);
                break;
            case QUEUE_VIEW_TYPE.ESCALATION:
                this.fetchEscalatedQueueItems(viewId, true);
                break;
            default:
        }
    }

    // TODO: Refactor this method and move to the appropriate Item model
    setTimeLeft(data: Item[]) {
        if (this.queue && this.queue.processingDeadline) {
            return data.map(item => {
                if (item.importDate) {
                    const itemImportDh = getCurrentTimeDiff(item.importDate);
                    const deadline = getProcessingDeadlineValues(this.queue!.processingDeadline);

                    const hours = deadline.hours - itemImportDh.hours;
                    const days = deadline.days - itemImportDh.days;

                    item.setTimeLeft({ days, hours });

                    return item;
                }

                return item;
            });
        }

        return data;
    }

    @computed
    get getItemPlacementMetricsStatistic(): Serie[] {
        if (this.itemPlacementMetric) {
            const { received, released, reviewed } = this.itemPlacementMetric.getItemPlacementDatums;

            return [
                {
                    id: 'New orders',
                    data: received,
                    color: COLORS.demandSupplyCharts.received
                },
                {
                    id: 'Reviewed',
                    data: reviewed,
                    color: COLORS.demandSupplyCharts.reviewed
                },
                {
                    id: 'Released',
                    data: released,
                    color: COLORS.demandSupplyCharts.released
                }
            ];
        }

        return [];
    }

    @computed
    get getItemPlacementProgress():
    { reviewedProgress: CurrentProgress, releasedProgress: CurrentProgress, receivedProgress: CurrentProgress } | null {
        if (this.itemPlacementMetric) {
            const reviewedProgress: CurrentProgress = {
                current: this.itemPlacementMetric.total.reviewed,
                progress: undefined,
            };

            const releasedProgress: CurrentProgress = {
                current: this.itemPlacementMetric.total.released,
                progress: undefined,
            };

            const receivedProgress: CurrentProgress = {
                current: this.itemPlacementMetric.total.received,
                progress: undefined
            };

            return { reviewedProgress, releasedProgress, receivedProgress };
        }

        return null;
    }

    getQueueId() {
        return this.queueId;
    }

    @computed
    get getQueueName() {
        if (this.queue) {
            return this.queue.name;
        }

        return '';
    }

    @computed
    get hasRegularQueueView() {
        if (this.queue && this.queue.views) {
            return this.queue.views.some(view => view.viewType === QUEUE_VIEW_TYPE.REGULAR);
        }

        return false;
    }

    @computed
    get hasEscalationQueueView() {
        if (this.queue && this.queue.views) {
            return this.queue.views.some(view => view.viewType === QUEUE_VIEW_TYPE.ESCALATION);
        }

        return false;
    }

    @computed
    get isRealtimeDataAvailable() {
        return !this.hasRegularQueueView && !this.hasEscalationQueueView;
    }

    @computed
    get isQueueItemsLoading() {
        return this.regularQueueItems.isLoading || this.escalatedQueueItem.isLoading;
    }

    @computed
    get getAutoRefreshToggleValue() {
        const value = this.autoRefreshStorageItemManager.getToggleValue();

        if (value !== null) {
            return value;
        }

        return null;
    }

    /**
     * Check if current item is looked by the same reviewer
     * @param item - item
     */
    isSelectedItemLockedByCurrentUser(item: Item) {
        if (this.currentUserStore.user) {
            return this.currentUserStore.user.id === item.lockedById;
        }

        return false;
    }

    @action
    setAggregationPeriod(period: CHART_AGGREGATION_PERIOD) {
        this.aggregation = period;
    }

    @action
    setQueueId(id: string) {
        this.queueId = id;
    }

    /**
     * Clear the store
     */
    @action
    clearStore() {
        this.clearQueueItems();
        this.clearQueueItemsAutoRefreshInterval();
    }

    /**
     * Initialize queue items auto refresh
     */
    @action
    private initQueueItemsAutoRefresh() {
        if (this.isAutoRefreshEnabled) {
            this.refreshIntervalRef = window
                .setInterval(this.autoRefreshFn, DEFAULT_QUEUE_AUTO_REFRESH_CHECK_MILLISECONDS);
        }
    }

    /**
     * Queue items auto refresh callback function
     */
    @action.bound
    private autoRefreshFn() {
        const now = Date.now();
        this.now = now;

        if (this.isAutoRefreshEnabled && this.queueId && this.queue) {
            const queueItemsLastRefresh = this.lastRefreshQueueItemsMap.get(this.queueId);

            if (
                queueItemsLastRefresh
                && now - queueItemsLastRefresh > DEFAULT_QUEUE_AUTO_REFRESH_INTERVAL_MILLISECONDS
            ) {
                this.refreshQueueAndLockedItems();
            }
        }
    }

    /**
     * Save current time stamp, when queue items were last updated
     * @param queueId - queue id, DIRECT
     */
    @action
    private setLastRefresh(queueId: string) {
        const now = Date.now();
        this.lastRefreshQueueItemsMap.set(queueId, now);
    }

    /* ---- STORE GENERATE REPORTING METHODS * ----  */

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

        if (this.getQueueItemsReport(QUEUE_VIEW_TYPE.REGULAR)) {
            reports.push(this.getQueueItemsReport(QUEUE_VIEW_TYPE.REGULAR));
        }

        if (this.getQueueItemsReport(QUEUE_VIEW_TYPE.ESCALATION)) {
            reports.push(this.getQueueItemsReport(QUEUE_VIEW_TYPE.ESCALATION));
        }

        return reports as Array<any>;
    }

    @computed
    private get totalReviewedNewItemsReport() {
        if (this.itemPlacementMetric) {
            const REPORT_NAME = 'Total reviewed/new orders';
            const rawData = this.itemPlacementMetric.fullTotalReviewedNewItemsReport;

            if (rawData?.length) {
                const unparseObject: UnparseObject = {
                    fields: ['date', 'reviewed orders', 'released orders', 'new orders'],
                    data: rawData.flat()
                };

                return this.CSVReportBuilder.buildReport(REPORT_NAME, unparseObject);
            }
        }

        return null;
    }

    @computed
    private get totalRemainingOrdersReport() {
        if (this.queueSizeHistory) {
            const REPORT_NAME = 'Total remaining orders';
            const rawData = this.queueSizeHistory.remainingOrdersReport;

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

    private getQueueItemsReport(viewType: QUEUE_VIEW_TYPE): Report | null {
        return computed(() => {
            const REPORT_NAME = viewType === QUEUE_VIEW_TYPE.REGULAR
                ? 'Regular orders real time data overview'
                : 'Escalated orders real time data overview';

            const queueItems = viewType === QUEUE_VIEW_TYPE.ESCALATION
                ? this.escalatedQueueItem
                : this.regularQueueItems;

            if (queueItems.data?.length) {
                const rawReportData = queueItems.data.map(item => {
                    let itemTimeout;
                    if (item.timeout) {
                        itemTimeout = item.timeout > 0 ? item.timeout : 'expired';
                    }

                    let itemTimeLeft: number | string | undefined = item?.timeLeft
                        ? item.timeLeft.days
                        : undefined;
                    itemTimeLeft = itemTimeLeft && itemTimeLeft < 0 ? 'overdue' : itemTimeLeft;

                    return [
                            item.decision?.riskScore,
                            item.id,
                            item.amount,
                            item.displayImportDateTime,
                            itemTimeout,
                            itemTimeLeft,
                            item.lockedById
                    ];
                });

                const unparseObject: UnparseObject = {
                    fields: ['fraud score', 'order id', 'amount', 'import date', 'timeout', 'time left', 'analyst id'],
                    data: rawReportData
                };

                return this.CSVReportBuilder.buildReport(REPORT_NAME, unparseObject);
            }

            return null;
        }).get();
    }

    /* ---- STORE FETCHING METHODS ----   */

    @action
    private fetchQueueItems(queue: Queue | null) {
        if (queue && queue.views) {
            queue.views.forEach(({ viewType, viewId }) => {
                if (viewType === QUEUE_VIEW_TYPE.REGULAR) {
                    this.fetchRegularQueueItems(viewId);
                }

                if (viewType === QUEUE_VIEW_TYPE.ESCALATION) {
                    this.fetchEscalatedQueueItems(viewId);
                }
            });
        }
    }

    @action
    private async fetchRegularQueueItems(viewId: string, loadMore: boolean = false) {
        this.regularQueueItems.viewId = viewId;

        if (loadMore) {
            this.regularQueueItems.isLoadingMoreItems = true;
        } else {
            this.regularQueueItems.isLoading = true;
        }

        try {
            const { data, canLoadMore } = await this.queueService.getQueueItemsOverview({
                chainContinuationIdentifier: 'DemandQueuePerformanceStore.fetchRegularQueueItems',
                id: viewId,
                shouldLoadMore: loadMore,
                timeToTimeout: DEFAULT_TIME_TO_TIMEOUT_DURATION,
                timeToSla: DEFAULT_TIME_TO_SLA_DURATION
            });

            const dataWithTimeLeft = this.setTimeLeft(data);
            this.regularQueueItems.setQueueItems(dataWithTimeLeft, loadMore);

            this.regularQueueItems.initItemsTimeoutCountdown();
            this.regularQueueItems.initQueueItemsAutoReplace();

            this.regularQueueItems.canLoadMore = canLoadMore;
            this.regularQueueItems.isLoading = false;
            this.regularQueueItems.isLoadingMoreItems = false;
        } catch (e) {
            this.regularQueueItems.isLoading = false;
            this.regularQueueItems.isLoadingMoreItems = false;
            throw e;
        }
    }

    @action
    private async fetchEscalatedQueueItems(viewId: string, loadMore: boolean = false) {
        this.escalatedQueueItem.viewId = viewId;

        if (loadMore) {
            this.escalatedQueueItem.isLoadingMoreItems = true;
        } else {
            this.escalatedQueueItem.isLoading = true;
        }

        try {
            const { data, canLoadMore } = await this.queueService.getQueueItemsOverview({
                chainContinuationIdentifier: 'DemandQueuePerformanceStore.fetchEscalatedQueueItems',
                id: viewId,
                shouldLoadMore: loadMore,
                timeToTimeout: DEFAULT_TIME_TO_TIMEOUT_DURATION,
                timeToSla: DEFAULT_TIME_TO_SLA_DURATION
            });

            this.escalatedQueueItem.setQueueItems(data, loadMore);
            this.escalatedQueueItem.canLoadMore = canLoadMore;
            this.escalatedQueueItem.isLoading = false;
            this.escalatedQueueItem.isLoadingMoreItems = false;
        } catch (e) {
            this.escalatedQueueItem.isLoading = false;
            this.escalatedQueueItem.isLoadingMoreItems = false;
            throw e;
        }
    }

    // TODO: Make benefit cache of checking queues store, maybe implement some kind of Cache service
    @action
    private async fetchQueue(queueId: string) {
        this.isQueueLoading = true;

        try {
            this.isQueueLoading = true;

            this.queue = await this.queueService.getQueue(queueId);
            this.isQueueLoading = false;
            return this.queue;
        } catch (err) {
            if (err && err.response) {
                const axiosError = err as AxiosError;
                if (axiosError.response && axiosError.response.status === 404) {
                    this.queue = await this.fetchHistoricalQueue(queueId);
                    return this.queue;
                }
            }

            return null;
        }
    }

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
    private async fetchQueueSizeHistory(params: DashboardRequestApiParams) {
        this.isQueueSizeHistoryLoading = true;

        try {
            const queuesSizeHistory = await this.dashboardService.getQueuesSizeHistory(params);

            if (queuesSizeHistory?.length) {
                const [queueSizeHistory] = queuesSizeHistory;
                this.queueSizeHistory = queueSizeHistory;
            }

            this.isQueueSizeHistoryLoading = false;
        } catch (e) {
            this.isQueueSizeHistoryLoading = false;

            throw e;
        }
    }

    @action
    private async fetchItemsPlacementMetrics(params: DashboardRequestApiParams) {
        this.isItemsPlacementMetricsLoading = true;

        try {
            const itemsPlacementMetrics = await this.dashboardService.getItemPlacementMetrics(params);

            if (itemsPlacementMetrics?.length) {
                const [itemPlacementMetrics] = itemsPlacementMetrics;
                this.itemPlacementMetric = itemPlacementMetrics;
            }

            this.isItemsPlacementMetricsLoading = false;
        } catch (e) {
            this.isItemsPlacementMetricsLoading = false;

            throw e;
        }
    }

    @action
    private getInstanceOfLocalStorageManager() {
        const localStorageId = 'DemandQueuePerformanceStore.isAutoRefreshEnabled';
        return new AutoRefreshStorageItemManger(localStorageId, this.localStorageService);
    }

    /* ---- STORE CLEARING METHODS ----   */

    @action
    private disposeAutoRefreshReaction() {
        this.saveAutoRefreshReactionDisposerRef();
    }

    @action
    private clearAutoRefreshLocalStorageManagerValue() {
        this.autoRefreshStorageItemManager.removeValue();
    }

    /**
     * Clear queue items auto refresh interval
     */
    @action
    private clearQueueItemsAutoRefreshInterval() {
        if (this.refreshIntervalRef) {
            window.clearInterval(this.refreshIntervalRef);
        }
    }

    /**
     * Set to default initial values, kind of "clearing"
     */
    @action
    private clearQueueItems() {
        this.regularQueueItems.clearIntervals();
        this.regularQueueItems = new QueueItemImpl(QUEUE_VIEW_TYPE.REGULAR);

        this.escalatedQueueItem.clearIntervals();
        this.escalatedQueueItem = new QueueItemImpl(QUEUE_VIEW_TYPE.ESCALATION);
    }
}
