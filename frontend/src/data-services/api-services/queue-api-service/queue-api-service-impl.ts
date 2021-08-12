// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { QUEUE_VIEW_TYPE } from '../../../constants';
import { TYPES } from '../../../types';
import { AuthenticationService, Configuration } from '../../../utility-services';
import { BaseApiService } from '../../base-api-service';
import { QueueApiService, QueueItemsOverviewApiParams } from '../../interfaces';
import { ItemSortSettingsDTO } from '../models/item-search-query-dto';
import {
    DeleteQueueResponse, GetQueueItemsResponse,
    GetQueueResponse, GetQueuesOverviewResponse,
    GetQueuesResponse, LockQueueItemResponse,
    PatchQueueRequest, PatchQueueResponse,
    PostQueueRequest, PostQueueResponse
} from './api-models';

@injectable()
export class QueueApiServiceImpl extends BaseApiService implements QueueApiService {
    /**
     * @param config
     * @param authService
     */
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(
            `${config.apiBaseUrl}/queues`,
            {
                request: {
                    onFulfilled: authService.apiRequestInterceptor.bind(authService)
                },
                response: {
                    onRejection: authService.apiResponseInterceptor.bind(authService)
                }
            }
        );
    }

    getQueues(params: { viewType: QUEUE_VIEW_TYPE}) {
        return this.get<GetQueuesResponse>('', { params });
    }

    postQueue(queue: PostQueueRequest) {
        return this.post<PostQueueResponse>('', queue);
    }

    getQueue(id: string) {
        return this.get<GetQueueResponse>(`/${id}`);
    }

    deleteQueue(id: string) {
        return this.delete<DeleteQueueResponse>(`/${id}`);
    }

    patchQueue(id: string, queue: PatchQueueRequest) {
        return this.patch<PatchQueueResponse>(`/${id}`, queue);
    }

    getQueueItems(id: string, size: number, sortingObject?: ItemSortSettingsDTO, continuationToken?: string | null) {
        let manualParamsSerialized = `size=${size}`;

        if (sortingObject) {
            manualParamsSerialized += `&sortingField=${sortingObject.field}&sortingDirection=${sortingObject.order}`;
        }

        return this.post<GetQueueItemsResponse>(`/${id}/items?${manualParamsSerialized}`, { continuation: continuationToken || null });
    }

    lockTopQueueItem(queueId: string) {
        return this.post<LockQueueItemResponse>(`/${queueId}/top/lock`);
    }

    lockQueueItem(queueId: string, itemId: string) {
        return this.post<LockQueueItemResponse>(`/${queueId}/items/${itemId}/lock`);
    }

    /**
     * Get map of queue overviews for Overview Dashboard (Demand/Supply dashboard)
     */
    getQueuesOverview(timeToSla: string, timeToTimeout: string) {
        return this.get<GetQueuesOverviewResponse>('/overview', { params: { timeToSla, timeToTimeout } });
    }

    /**
     * Get list of items by queue for Overview Dashboard (Demand/Supply dashboard by a specific queue)
     */
    getQueueItemsOverview({
        id, size, continuationToken, timeToSla, timeToTimeout
    }: QueueItemsOverviewApiParams) {
        let manualParamsSerialized = `size=${size}`;

        /**
         * There is an issue with embedded axios encoding of the url params,
         * this is why here configuration token is encoded manually
         * if passed with axios config.params api will respond with 400
         */
        if (continuationToken) {
            manualParamsSerialized += `&continuation=${encodeURIComponent(continuationToken)}`;
        }

        return this.get<GetQueueItemsResponse>(`/${id}/overview?${manualParamsSerialized}`, { params: { timeToSla, timeToTimeout } });
    }
}
