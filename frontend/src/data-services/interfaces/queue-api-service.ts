// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { QUEUE_VIEW_TYPE } from '../../constants';
import { ItemSortSettingsDTO } from '../api-services/models/item-search-query-dto';
import {
    DeleteQueueResponse,
    GetQueueItemsResponse,
    GetQueueResponse,
    GetQueuesOverviewResponse,
    GetQueuesResponse,
    LockQueueItemResponse,
    PatchQueueRequest,
    PatchQueueResponse,
    PostQueueRequest,
    PostQueueResponse
} from '../api-services/queue-api-service/api-models';
import { ApiServiceResponse } from '../base-api-service';

export interface QueueItemsOverviewApiParams {
    id: string,
    size: number,
    continuationToken?: string | null,

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
}

/**
 * Queue Api - service to work with Queue Controller on API side
 */
export interface QueueApiService {
    /**
     * Get queue details by ID
     * @param id
     */
    getQueue(id: string): Promise<ApiServiceResponse<GetQueueResponse>>;

    /**
     * Delete a queue by ID
     * @param id
     */
    deleteQueue(id: string): Promise<ApiServiceResponse<DeleteQueueResponse>>;

    /**
     * Update a queue by ID
     * @param id
     * @param queue
     */
    patchQueue(id: string, queue: PatchQueueRequest): Promise<ApiServiceResponse<PatchQueueResponse>>;

    /**
     * Get list of items from the specified queue
     * @param id
     * @param size
     * @param sortingObject - optional sorting parameters
     * @param continuationToken     
     */
    getQueueItems(id: string, size: number, sortingObject?: ItemSortSettingsDTO, continuationToken?: string | null): Promise<ApiServiceResponse<GetQueueItemsResponse>>;

    /**
     * Lock the top item from the specified queue
     * @param queueId - queue id
     */
    lockTopQueueItem(queueId: string): Promise<ApiServiceResponse<LockQueueItemResponse>>;

    /**
     * Lock the specified item from the specified queue
     * @param queueId - queue id
     * @param itemId - item id
     */
    lockQueueItem(queueId: string, itemId: string): Promise<ApiServiceResponse<LockQueueItemResponse>>;

    /**
     * Get list of queues
     * @param params
     */
    getQueues(params: { viewType: QUEUE_VIEW_TYPE }): Promise<ApiServiceResponse<GetQueuesResponse>>;

    /**
     * Create a new queue
     * @param queue
     */
    postQueue(queue: PostQueueRequest): Promise<ApiServiceResponse<PostQueueResponse>>;

    /**
     * Get map of queue overviews for Overview Dashboard (Demand/Supply dashboard)
     */
    getQueuesOverview(timeToSla: string, timeToTimeout: string): Promise<ApiServiceResponse<GetQueuesOverviewResponse>>;

    getQueueItemsOverview(params: QueueItemsOverviewApiParams): Promise<ApiServiceResponse<GetQueueItemsResponse>>;
}
