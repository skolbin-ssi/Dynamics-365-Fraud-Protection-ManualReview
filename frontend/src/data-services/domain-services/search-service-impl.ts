// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';

import { BaseDomainService } from '../base-domain-service';
import { Logger } from '../../utility-services/logger';
import { UserBuilder } from '../../utility-services';
import { SearchApiService } from '../interfaces';
import { TYPES } from '../../types';
import { SearchService } from '../interfaces/domain-interfaces/search-service';
import { PageableList } from '../../models/misc';
import { Item } from '../../models/item';
import { DEFAULT_QUEUE_ITEMS_PER_PAGE } from '../../constants';
import { GetQueueItemsTransformer } from '../data-transformers/queue-transformer';
import { ItemSearchQueryDTO, ItemSortSettingsDTO } from '../api-services/models';

@injectable()
export class SearchServiceImpl extends BaseDomainService implements SearchService {
    constructor(
        @inject(TYPES.SEARCH_API_SERVICE) private readonly searchApiService: SearchApiService,
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
        @inject(TYPES.USER_BUILDER) protected readonly userBuilder: UserBuilder
    ) {
        super(logger, 'SearchService');
    }

    async createSearchQuery(searchQuery: ItemSearchQueryDTO): Promise<string> {
        let response;
        try {
            response = await this.searchApiService.createSearchQuery(searchQuery);
        } catch (e) {
            throw this.handleApiException('createSearchQuery', e, {
                500: 'Failed to create a search query due to internal server error'
            });
        }

        return response.data;
    }

    async getSearchQuery(id: string): Promise<ItemSearchQueryDTO> {
        let response;
        try {
            response = await this.searchApiService.getSearchQuery(id);
        } catch (e) {
            throw this.handleApiException('getSearchQuery', e, {
                500: `Failed to get a search query (${id}) due to internal server error`
            });
        }

        return response.data;
    }

    async searchItems(
        chainContinuationIdentifier: string,
        id: string,
        shouldLoadMore: boolean,
        sortingObject?: ItemSortSettingsDTO,
        size: number = DEFAULT_QUEUE_ITEMS_PER_PAGE,
    ): Promise<PageableList<Item>> {
        const dataTransformer = new GetQueueItemsTransformer(this.userBuilder);
        const uniqueSequenceChainId = `${chainContinuationIdentifier}-${id}`;
        let response;

        try {
            const token = shouldLoadMore ? this.getContinuationToken(uniqueSequenceChainId) : null;
            response = await this.searchApiService.searchItems(id, size, sortingObject, token);
        } catch (e) {
            throw this.handleApiException('searchItems', e, {
                500: `Failed to get items for the search query (${id}) from the Api due to internal server error`
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
                'searchItems',
                `Failed to parse response from API while getting items for the search query (${id})`,
                e
            );
        }
    }
}
