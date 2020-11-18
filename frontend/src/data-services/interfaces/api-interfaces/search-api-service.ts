// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ApiServiceResponse } from '../../base-api-service';
import { GetQueueItemsResponse } from '../../api-services/queue-api-service/api-models';
import { ItemSearchQueryDTO, ItemSortSettingsDTO } from '../../api-services/models';
/**
 * API for searching items in the system by provided parameters.
 */
export interface SearchApiService {
    /**
     * Create a searchQuery in the system
     * @param searchQuery
     */
    createSearchQuery(searchQuery: ItemSearchQueryDTO): Promise<ApiServiceResponse<string>>

    /**
     * Get a searchQuery by id
     * @param id
     */
    getSearchQuery(id: string): Promise<ApiServiceResponse<ItemSearchQueryDTO>>

    /**
     * Search for items by provided parameters
     * @param id - id of the searchQuery
     * @param size
     * @param sortingObject - optional sorting parameters
     * @param continuationToken
     */
    searchItems(
        id: string,
        size: number,
        sortingObject?: ItemSortSettingsDTO,
        continuationToken?: string | null): Promise<ApiServiceResponse<GetQueueItemsResponse>>;
}
