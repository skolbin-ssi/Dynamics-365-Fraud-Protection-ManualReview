// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    Item,
    NewQueue, PageableList,
    Queue,
    QueueToUpdate
} from '../../models';
import { QueuesOverview } from '../../models/queues';
import { QUEUE_VIEW_TYPE } from '../../constants';

export interface QueueItemsOverviewRequestParams {
    /**
     * Queue id/ Queue view id
     */
    id: string,

    /**
     * chainContinuationIdentifier - unique id that will be same for first and subsequent calls
     */
    chainContinuationIdentifier: string,

    /**
     * shouldLoadMore - should perform initial request or load more from last call
     */
    shouldLoadMore: boolean,

    /**
     * timeToTimeout - string($PnDTnHnMn.nS) (e. g.: P1DT24H)
     * The response will contain all items which timeout is nearer this duration
     */
    timeToTimeout?: string;

    /**
     * timeToSla - string($PnDTnHnMn.nS) (e. g.: P1DT24H)
     * The response will contain all items which SLA is nearer this duration
     */
    timeToSla?: string;

    /**
     * size - amount of items to load @see {DEFAULT_QUEUE_ITEMS_PER_PAGE}
     */
    size?: number
}

export interface QueueService {
    /**
     * Get list of queues
     * @param params
     */
    getQueues(params: { viewType: QUEUE_VIEW_TYPE}): Promise<Queue[]>;

    /**
     * Get queue details by id
     * @param id - queue id
     */
    getQueue(id: string): Promise<Queue>;

    /**
     * Get items by queue id
     * @param chainContinuationIdentifier - unique id that will be same for first and subsequent calls
     * @param id - queue id
     * @param shouldLoadMore - should perform initial request or load more from last call
     * @param size - amount of items to load
     */
    getQueueItems(chainContinuationIdentifier: string, id: string, shouldLoadMore: boolean, size?: number): Promise<PageableList<Item>>;

    /**
     * Creating a new queue
     * @param newQueue - model of a new Queue
     */
    createQueue(newQueue: NewQueue): Promise<Queue>;

    /**
     * Editing a queue
     * @param queueToUpdate - model of a queue to update
     */
    updateQueue(queueToUpdate: QueueToUpdate): Promise<Queue>;

    /**
     * Deleting a queue
     * @param idToDelete - model of a queue to update
     */
    deleteQueue(idToDelete: string): Promise<void>;

    /**
     * Search for SKUs to use in Queue filters
     * @param term - search term
     */
    searchSKU(term: string): Promise<string[]>;

    /**
     * Add SKU to dictionary
     * @param term
     */
    addSKU(term: string): Promise<unknown>;

    /**
     * Search for coutries to use in Queue filters
     * @param term - search term
     */
    searchCountry(term: string): Promise<string[]>;

    /**
     * Add country to dictionary
     * @param term
     */
    addCountry(term: string): Promise<unknown>;

    getQueuesOverview(timeToSla: string, timeToTimeout: string): Promise<QueuesOverview>

    getQueueItemsOverview(params: QueueItemsOverviewRequestParams): Promise<PageableList<Item>>;
}
