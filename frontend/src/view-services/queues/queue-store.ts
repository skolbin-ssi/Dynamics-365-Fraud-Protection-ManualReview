// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import {
    action, computed, observable, runInAction
} from 'mobx';
import { CollectedInfoService, ItemSortSettingsDTO, QueueService } from '../../data-services';
import { Item, Queue } from '../../models';
import { TYPES } from '../../types';
import { ItemsLoadable } from '../misc/items-loadable';
import { calculateDaysLeft, getProcessingDeadlineValues } from '../../utils';
import { DEFAULT_SORTING, QUEUE_VIEW_TYPE } from '../../constants';

@injectable()
export class QueueStore implements ItemsLoadable<Item> {
    /**
     * Sorting field and direction
     */
    @observable sorting: ItemSortSettingsDTO = DEFAULT_SORTING;

    /**
     * Queues list
     */
    @observable queues: Queue[] | null = null;

    /**
     * Escalated queues
     */
    @observable escalatedQueues: Queue[] | null = null;

    /**
     * Indication that queues are loading
     */
    @observable loadingQueues = false;

    /**
     * Indication Promise that regular queues are loading
     */
    @observable loadingRegularQueuesPromise: Promise<void> | null = null;

    /**
     * Indication that historical queues are loading
     */
    @observable loadingHistoricalQueuesPromise: Promise<void> | null = null;

    /**
     * Selected queue item id
     */
    @observable selectedQueueId: string | null = null;

    /**
     * Indication that at least first page of items was already loaded
     */
    @observable wasFirstPageLoaded = false;

    /**
     * Indication that more queue items are loading
     */
    @observable loadingMoreItems = false;

    /**
     * Items in selected Queue
     */
    @observable items: Item[] = [];

    /**
     * Sets if there are more items to load in selected queue
     */
    @observable canLoadMore: boolean = false;

    /**
     * Items in selected Queue
     */
    @observable refreshingQueueIds: string[] = [];

    @observable
    isLoadingQueueItems = false;

    private regularQueuesMap = new Map<string, Queue>();

    private historicalQueuesMap = new Map<string, Queue>();

    // For caching days left before the deadline values
    private daysLeftMap: Map<string, number> = new Map();

    constructor(
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService,
        @inject(TYPES.COLLECTED_INFO_SERVICE) private collectedInfoService: CollectedInfoService
    ) {}

    @action
    async loadQueues(viewType: QUEUE_VIEW_TYPE = QUEUE_VIEW_TYPE.REGULAR) {
        this.loadingQueues = true;

        try {
            const queues = await this
                .queueService
                .getQueues({ viewType });

            runInAction(() => {
                if (viewType !== QUEUE_VIEW_TYPE.ESCALATION) {
                    this.queues = queues;

                    this.regularQueuesMap = new Map<string, Queue>(queues
                        .map(queue => [queue.queueId, queue]));
                } else {
                    this.escalatedQueues = queues;
                }

                this.loadingQueues = false;
            });
        } catch (e) {
            runInAction(() => {
                this.loadingQueues = false;
                throw e;
            });
        }
    }

    @action
    updateSorting = async (updatedSorting: ItemSortSettingsDTO) => {
        this.sorting = updatedSorting;
        if (this.selectedQueueId) {
            this.wasFirstPageLoaded = false;
            this.items = [];
            await this.loadQueueItems(this.selectedQueueId);
        }
    };

    @action
    async loadHistoricalQueues() {
        const historicalQueues: Queue[] | null = await this.collectedInfoService.getQueuesCollectedInfo();

        this.historicalQueuesMap = new Map<string, Queue>((historicalQueues || [])
            .map(queue => [queue.queueId, queue]));
    }

    @action
    async loadRegularAndHistoricalQueues() {
        if (!this.regularQueuesMap.size) {
            this.loadingRegularQueuesPromise = this.loadingRegularQueuesPromise || this.loadQueues();

            await this.loadingRegularQueuesPromise;

            this.loadingRegularQueuesPromise = null;
        }

        if (!this.historicalQueuesMap.size) {
            this.loadingHistoricalQueuesPromise = this.loadingHistoricalQueuesPromise || this.loadHistoricalQueues();

            await this.loadingHistoricalQueuesPromise;

            this.loadingHistoricalQueuesPromise = null;
        }
    }

    @action
    async loadSingleQueue(
        viewId: string,
        updateInList: boolean = false
    ) {
        const requestedQueue = await this
            .queueService
            .getQueue(viewId);

        if (updateInList) {
            if (requestedQueue.forEscalations && this.escalatedQueues) {
                this.escalatedQueues = this.escalatedQueues.map(queue => {
                    if (queue.viewId === requestedQueue.viewId) {
                        return requestedQueue;
                    }
                    return queue;
                });
            } else if (this.queues) {
                this.queues = this.queues?.map(queue => {
                    if (queue.viewId === requestedQueue.viewId) {
                        return requestedQueue;
                    }
                    return queue;
                });
            }
        }

        return requestedQueue;
    }

    /**
     * @param queueId - id
     * @param loadMore - whether or not we're loading new items an existing list
     *
     * @ignore, use queueScreenStore.loadQueueItems instead
     */
    @action
    async loadQueueItems(queueId: string, loadMore: boolean = false) {
        this.isLoadingQueueItems = true;
        if (loadMore) {
            this.loadingMoreItems = true;
        } else {
            this.wasFirstPageLoaded = false;
        }

        try {
            const { data, canLoadMore } = await this.queueService.getQueueItems('QueueStore.getQueueItems', queueId, loadMore, this.sorting);
            this.items = loadMore ? [...this.items, ...data] : data;
            this.canLoadMore = canLoadMore;
            this.isLoadingQueueItems = false;
            this.wasFirstPageLoaded = true;
            this.loadingMoreItems = false;
        } catch (e) {
            this.wasFirstPageLoaded = true;
            this.isLoadingQueueItems = false;
            this.loadingMoreItems = false;
            throw e;
        }
    }

    @action
    async refreshQueue(queueViewId: string) {
        if (!this.refreshingQueueIds.includes(queueViewId)) {
            this.refreshingQueueIds.push(queueViewId);
        }
        const updatedQueue = await this.queueService.getQueue(queueViewId);
        this.refreshingQueueIds = this.refreshingQueueIds.filter(viewId => viewId !== queueViewId);

        // updates selected queue details in the list
        if (this.queues) {
            const queueIndex = this.queues.findIndex(({ viewId }) => viewId === queueViewId);
            if (queueIndex > -1) {
                this.queues[queueIndex] = updatedQueue;
            }
        }

        // updates selected escalated queue details in the list
        if (this.escalatedQueues) {
            const queueIndex = this.escalatedQueues.findIndex(({ viewId }) => viewId === queueViewId);
            if (queueIndex > -1) {
                this.escalatedQueues[queueIndex] = updatedQueue;
            }
        }
    }

    @action
    markQueueAsSelected(queue: Queue) {
        this.selectedQueueId = queue.viewId;

        // default queue details
        this.items = [];
        this.canLoadMore = false;
    }

    @action
    clearSelectedQueueData() {
        this.selectedQueueId = null;
        this.items = [];
        this.canLoadMore = false;
    }

    @action
    markQueueAsSelectedById(queueViewId: string) {
        if (!this.queues) { throw new Error('Queues are not defined'); }

        const regularQueueToSelect = this.queues.find(({ viewId }) => viewId === queueViewId);
        const escalatedQueueToSelect = this.escalatedQueues?.find(({ viewId }) => viewId === queueViewId);
        let queueToSelect = regularQueueToSelect || escalatedQueueToSelect || null;

        // TODO: probably 404 instead of this fallback to select first
        if (!queueToSelect) {
            const [firstQueue] = this.queues;
            queueToSelect = firstQueue;
        }

        this.selectedQueueId = queueToSelect.viewId;

        return queueToSelect;
    }

    @computed
    get selectedQueue(): Queue | null {
        let selectedQueue;
        let selectedEscalatedQueue;

        if (this.selectedQueueId) {
            selectedQueue = this.queues?.find(({ viewId }) => viewId === this.selectedQueueId);
            selectedEscalatedQueue = this.escalatedQueues?.find(({ viewId }) => viewId === this.selectedQueueId);
        }

        return selectedQueue || selectedEscalatedQueue || null;
    }

    @computed
    get processingDeadline() {
        const processingDeadline = this.selectedQueue?.processingDeadline;

        if (processingDeadline) {
            return getProcessingDeadlineValues(processingDeadline);
        }

        return null;
    }

    @computed
    get allQueues() {
        return [
            ...(this.queues || []),
            ...(this.escalatedQueues || [])
        ];
    }

    getDaysLeft(item: Item, queue?: Queue): number | null {
        if (!item.importDate || !queue?.processingDeadline) return null;

        const key = `${item.importDate.toISOString()}-${queue.processingDeadline}`;
        const cachedResult = this.daysLeftMap.get(key);
        if (cachedResult) return cachedResult;

        const result: number = calculateDaysLeft(item.importDate, queue.processingDeadline);
        this.daysLeftMap.set(key, result);

        return result;
    }

    getQueueById(queueId: string) {
        return this.regularQueuesMap?.get(queueId) || this.historicalQueuesMap?.get(queueId);
    }
}
