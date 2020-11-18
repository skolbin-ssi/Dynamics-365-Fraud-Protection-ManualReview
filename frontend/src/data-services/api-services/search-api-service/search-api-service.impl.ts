// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';

import { BaseApiService } from '../../base-api-service';
import { AuthenticationService } from '../../../utility-services';
import { SearchApiService } from '../../interfaces';
import { TYPES } from '../../../types';
import { Configuration } from '../../../utility-services/configuration';
import { SearchItemsResponse } from './api-models/search-items';
import { ItemSearchQueryDTO, ItemSortSettingsDTO } from '../models';

@injectable()
export class SearchApiServiceImpl extends BaseApiService implements SearchApiService {
    /**
     * @param config
     * @param authService
     */
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(
            `${config.apiBaseUrl}/items/search-query`,
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

    createSearchQuery(searchQuery: ItemSearchQueryDTO) {
        return this.post<string>('/', searchQuery);
    }

    getSearchQuery(id: string) {
        return this.get<ItemSearchQueryDTO>(`/${id}`);
    }

    searchItems(id: string, size: number, sortingObject?: ItemSortSettingsDTO, continuationToken?: string | null) {
        let manualParamsSerialized = `size=${size}`;

        if (sortingObject) {
            manualParamsSerialized += `&sortingField=${sortingObject.field}&sortingOrder=${sortingObject.order}`;
        }

        /**
         * There is an issue with embedded axios encoding of the url params,
         * this is why here configuration token is encoded manually
         * if passed with axios config.params api will respond with 400
         */
        if (continuationToken) {
            manualParamsSerialized += `&continuation=${encodeURIComponent(continuationToken)}`;
        }

        return this.get<SearchItemsResponse>(`/${id}/results?${manualParamsSerialized}`);
    }
}
