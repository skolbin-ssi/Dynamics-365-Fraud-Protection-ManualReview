// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { PageableList } from '../../../models/misc';
import { Item } from '../../../models/item';
import { ItemSearchQueryDTO, ItemSortSettingsDTO } from '../../api-services/models';

export interface SearchService {
    /**
     * Create search query
     * @param searchQuery - search query object
     */
    createSearchQuery(searchQuery: ItemSearchQueryDTO): Promise<string>;

    /**
     * Get search query object by id
     * @param id - search query id
     */
    getSearchQuery(id: string): Promise<ItemSearchQueryDTO>;

    /**
     * Search for items by search query id
     * @param chainContinuationIdentifier - unique id that will be same for first and subsequent calls
     * @param id - search query id
     * @param shouldLoadMore - should perform initial request or load more from last call
     * @param size - amount of items to load
     * @param sortingObject - optional sorting parameters
     */
    searchItems(
        chainContinuationIdentifier: string,
        id: string,
        shouldLoadMore: boolean,
        sortingObject?: ItemSortSettingsDTO,
        size?: number): Promise<PageableList<Item>>;
}
