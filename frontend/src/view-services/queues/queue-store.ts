import { inject, injectable } from 'inversify';
import { action, computed, observable } from 'mobx';
import { QueueService } from '../../data-services';
import { Item, Queue } from '../../models';
import { TYPES } from '../../types';
import { getCurrentTimeDiff, getProcessingDeadlineValues } from '../../utils';
import { QUEUE_VIEW_TYPE } from '../../constants';

@injectable()
export class QueueStore {
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
     * Selected queue item id
     */
    @observable selectedQueueId: string | null = null;

    /**
     * Indication that queue details are loading
     */
    @observable loadingQueueDetails = false;

    /**
     * Indication that more queue items are loading
     */
    @observable loadingMoreItems = false;

    /**
     * Items in selected Queue
     */
    @observable selectedQueueItems: Item[] = [];

    /**
     * Sets if there are more items to load in selected queue
     */
    @observable selectedQueueCanLoadMore: boolean = false;

    /**
     * Items in selected Queue
     */
    @observable refreshingQueueIds: string[] = [];

    constructor(
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService
    ) {}

    @action
    async loadQueues(viewType: QUEUE_VIEW_TYPE = QUEUE_VIEW_TYPE.REGULAR) {
        this.loadingQueues = true;

        try {
            const queues = await this
                .queueService
                .getQueues({ viewType });

            if (viewType !== QUEUE_VIEW_TYPE.ESCALATION) {
                this.queues = queues;
            } else {
                this.escalatedQueues = queues;
            }

            this.loadingQueues = false;
            return viewType === QUEUE_VIEW_TYPE.ESCALATION ? this.escalatedQueues : this.queues;
        } catch (e) {
            this.loadingQueues = false;
            throw e;
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
        if (loadMore) {
            this.loadingMoreItems = true;
        } else {
            this.loadingQueueDetails = true;
        }

        try {
            const { data, canLoadMore } = await this.queueService.getQueueItems('QueueStore.getQueueItems', queueId, loadMore);
            this.selectedQueueItems = loadMore ? [...this.selectedQueueItems, ...data] : data;
            this.selectedQueueCanLoadMore = canLoadMore;
            this.loadingQueueDetails = false;
            this.loadingMoreItems = false;
        } catch (e) {
            this.loadingQueueDetails = false;
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
        this.refreshingQueueIds = this.refreshingQueueIds.filter(id => id !== queueViewId);

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
        this.selectedQueueItems = [];
        this.selectedQueueCanLoadMore = false;
    }

    @action
    clearSelectedQueueData() {
        this.selectedQueueId = null;
        this.selectedQueueItems = [];
        this.selectedQueueCanLoadMore = false;
    }

    @action
    markQueueAsSelectedById(queueViewId: string) {
        if (!this.queues) { throw new Error('Queues are not defined'); }

        const regularQueueToSelect = this.queues.find(({ viewId }) => viewId === queueViewId);
        const escalatedQueueToSelect = this.escalatedQueues?.find(({ viewId }) => viewId === queueViewId);
        let queueToSelect = regularQueueToSelect || escalatedQueueToSelect || null;

        // TODO: probably 404 instaed of this fallback to select first
        if (!queueToSelect) {
            const [firstQueue] = this.queues;
            queueToSelect = firstQueue;
        }

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

    getTimeLeft(importDateTime: Date) {
        const { days: currentDiffDays } = getCurrentTimeDiff(importDateTime);

        if (this.processingDeadline) {
            const { days: processingDeadlineDays } = this.processingDeadline;
            return processingDeadlineDays - currentDiffDays;
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
}
