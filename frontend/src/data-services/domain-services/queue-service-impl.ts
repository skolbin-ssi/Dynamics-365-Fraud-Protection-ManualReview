// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import {
    DEFAULT_QUEUE_ITEMS_PER_PAGE,
    DICTIONARY_TYPE, QUEUE_VIEW_TYPE
} from '../../constants';
import {
    Item,
    NewQueue,
    PageableList,
    Queue,
    QueueToUpdate
} from '../../models';
import { TYPES } from '../../types';
import { Logger, UserBuilder } from '../../utility-services';
import { PatchQueueRequest, PostQueueRequest } from '../api-services/queue-api-service/api-models';
import { BaseDomainService } from '../base-domain-service';
import {
    GetQueueTransformer,
    PostQueueTransformer,
    GetQueuesTransformer,
    GetQueueItemsTransformer,
    GetQueuesOverviewTransformer
} from '../data-transformers';
import {
    QueueService,
    QueueApiService,
    DictionaryApiService,
    QueueItemsOverviewRequestParams
} from '../interfaces';
import { QueuesOverview } from '../../models/queues';

@injectable()
export class QueueServiceImpl extends BaseDomainService implements QueueService {
    constructor(
        @inject(TYPES.QUEUE_API_SERVICE) private readonly queueApiService: QueueApiService,
        @inject(TYPES.DICTIONARY_API_SERVICE) private readonly dictionaryApiService: DictionaryApiService,
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
        @inject(TYPES.USER_BUILDER) protected readonly userBuilder: UserBuilder
    ) {
        super(logger, 'QueueService');
    }

    async getQueues(params: { viewType: QUEUE_VIEW_TYPE }): Promise<Queue[]> {
        const dataTransformer = new GetQueuesTransformer(this.userBuilder);
        let response;

        try {
            response = await this.queueApiService.getQueues(params);
        } catch (e) {
            throw this.handleApiException('getQueues', e, {
                500: 'Failed to get queues from the Api due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'getQueues',
                'Failed to parse response from API while getting queues list',
                e
            );
        }
    }

    async getQueue(id: string): Promise<Queue> {
        const dataTransformer = new GetQueueTransformer(this.userBuilder);
        let response;

        try {
            response = await this.queueApiService.getQueue(id);
        } catch (e) {
            throw this.handleApiException('getQueues', e, {
                500: `Failed to get queue (${id}) from the Api due to internal server error`
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'getQueues',
                `Failed to parse response from API while getting queue (${id}) list`,
                e
            );
        }
    }

    async getQueueItems(
        chainContinuationIdentifier: string,
        id: string,
        shouldLoadMore: boolean,
        size: number = DEFAULT_QUEUE_ITEMS_PER_PAGE
    ): Promise<PageableList<Item>> {
        const dataTransformer = new GetQueueItemsTransformer(this.userBuilder);
        const uniqueSequenceChainId = `${chainContinuationIdentifier}-${id}`;
        let response;

        try {
            const token = shouldLoadMore ? this.getContinuationToken(uniqueSequenceChainId) : null;
            response = await this.queueApiService.getQueueItems(id, size, token);
        } catch (e) {
            throw this.handleApiException('getQueues', e, {
                500: `Failed to get items for queue (${id}) from the Api due to internal server error`
            });
        }

        try {
            const canLoadMore = this.storeContinuationToken(uniqueSequenceChainId, response.data);

            return {
                data: dataTransformer.mapResponse(response.data),
                canLoadMore
            };
        } catch (e) {
            throw this.handleException(
                'getQueues',
                `Failed to parse response from API while getting items for queue (${id})`,
                e
            );
        }
    }

    async getQueueItemsOverview({
        chainContinuationIdentifier,
        id,
        shouldLoadMore,
        size = DEFAULT_QUEUE_ITEMS_PER_PAGE,
        timeToSla,
        timeToTimeout
    }: QueueItemsOverviewRequestParams): Promise<PageableList<Item>> {
        const dataTransformer = new GetQueueItemsTransformer(this.userBuilder);
        const uniqueSequenceChainId = `${chainContinuationIdentifier}-${id}`;
        let response;

        try {
            const token = shouldLoadMore ? this.getContinuationToken(uniqueSequenceChainId) : null;
            response = await this.queueApiService.getQueueItemsOverview({
                id,
                continuationToken: token,
                timeToTimeout,
                timeToSla,
                size
            });
        } catch (e) {
            throw this.handleApiException('getQueueItemsOverview', e, {
                500: `Failed to get items for queue (${id}) from the Api due to internal server error`
            });
        }

        try {
            const canLoadMore = this.storeContinuationToken(uniqueSequenceChainId, response.data);

            return {
                data: dataTransformer.mapResponse(response.data),
                canLoadMore
            };
        } catch (e) {
            throw this.handleException(
                'getQueueItemsOverview',
                `Failed to parse response from API while getting items for queue (${id})`,
                e
            );
        }
    }

    async createQueue(newQueue: NewQueue): Promise<Queue> {
        const dataTransformer = new PostQueueTransformer(this.userBuilder);
        let response;

        const newQueueDto: PostQueueRequest = {
            name: newQueue.name,
            allowedLabels: newQueue.allowedLabels,
            reviewers: newQueue.reviewers,
            supervisors: newQueue.supervisors,
            filters: newQueue.filters,
            sorting: {
                order: newQueue.sortDirection,
                field: newQueue.sortBy,
                locked: newQueue.sortingLocked
            },
            processingDeadline: newQueue.processingDeadline
        };

        try {
            response = await this.queueApiService.postQueue(newQueueDto);
        } catch (e) {
            // TODO: add verification error handling
            throw this.handleApiException('postQueues', e, {
                500: 'Failed to create a queue due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'createQueue',
                'Failed to parse response from API while posting a queue',
                e
            );
        }
    }

    async updateQueue(queueToUpdate: QueueToUpdate): Promise<Queue> {
        const { queueId, viewId } = queueToUpdate;
        const dataTransformer = new PostQueueTransformer(this.userBuilder);
        let response;

        const queueToUpdateDto: PatchQueueRequest = {
            name: queueToUpdate.name,
            reviewers: queueToUpdate.reviewers,
            supervisors: queueToUpdate.supervisors,
            processingDeadline: queueToUpdate.processingDeadline
        };

        try {
            response = await this.queueApiService.patchQueue(queueId, queueToUpdateDto);
        } catch (e) {
            // TODO: add verification error handling
            throw this.handleApiException('postQueues', e, {
                500: 'Failed to update a queue due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data, viewId);
        } catch (e) {
            throw this.handleException(
                'updateQueue',
                'Failed to parse response from API while posting a queue',
                e
            );
        }
    }

    async deleteQueue(idToDelete: string): Promise<void> {
        try {
            await this.queueApiService.deleteQueue(idToDelete);
        } catch (e) {
            throw this.handleApiException('deleteQueue', e, {
                500: 'Failed to delete a queue due to internal server error'
            });
        }
        return undefined;
    }

    async searchSKU(term: string): Promise<string[]> {
        return this.searchInDictionary(DICTIONARY_TYPE.PRODUCT_SKU, term);
    }

    async addSKU(term: string): Promise<unknown> {
        return this.dictionaryApiService.postDictionaryValues(DICTIONARY_TYPE.PRODUCT_SKU, term);
    }

    async searchCountry(term: string): Promise<string[]> {
        return this.searchInDictionary(DICTIONARY_TYPE.USER_COUNTRY, term);
    }

    async addCountry(term: string): Promise<unknown> {
        return this.dictionaryApiService.postDictionaryValues(DICTIONARY_TYPE.USER_COUNTRY, term);
    }

    private async searchInDictionary(type: DICTIONARY_TYPE, query: string) {
        try {
            const response = await this.dictionaryApiService.getDictionaryValues(type, query);
            return response.data;
        } catch (e) {
            return [];
        }
    }

    async getQueuesOverview(timeToSla: string, timeToTimeout: string): Promise<QueuesOverview> {
        const dataTransformer = new GetQueuesOverviewTransformer(this.userBuilder);
        let response;

        try {
            response = await this.queueApiService.getQueuesOverview(timeToSla, timeToTimeout);
        } catch (e) {
            throw this.handleApiException('getQueuesOverview', e, {
                500: 'Failed to get queues overviews from the Api due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'getQueues',
                'Failed to parse response from API while getting queues overview',
                e
            );
        }
    }
}
