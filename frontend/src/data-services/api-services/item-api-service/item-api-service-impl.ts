// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { LABEL } from '../../../constants';
import { TYPES } from '../../../types';
import { AuthenticationService, Configuration } from '../../../utility-services';
import { BaseApiService } from '../../base-api-service';
import { DeleteItemLockResponse } from './api-models/delete-item-lock-response';
import { BatchItemsLabelApiParams, ItemApiService, } from '../../interfaces';
import {
    GetItemResponse,
    GetLinkAnalysisDfpItemsResponse,
    GetLinkAnalysisMrItemsResponse,
    GetLockedItemsResponse, PatchBatchLabelItemsResponse
} from './api-models';
import { PostLinkAnalysisBody } from '../../../models/item/link-analysis';

@injectable()
export class ItemApiServiceImpl extends BaseApiService implements ItemApiService {
    /**
     * @param config
     * @param authService
     */
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(
            `${config.apiBaseUrl}/items`,
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

    patchItemTag(id: string, tags: string[], queueId?: string) {
        return this.patch<never>(`/${id}/tags`, { tags }, {
            headers: {
                'Content-Type': 'application/json'
            },
            params: { queueId }
        });
    }

    deleteItemLock(id: string, queueId?: string) {
        return this.delete<DeleteItemLockResponse>(`/${id}/lock`, { params: { queueId } });
    }

    patchItemLabel(id: string, label: LABEL, queueId?: string) {
        return this.patch<never>(`/${id}/label`, {
            label
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            params: { queueId }
        });
    }

    patchBatchLabel({ label, itemIds }: BatchItemsLabelApiParams) {
        return this.patch<PatchBatchLabelItemsResponse>('/batch/label', { label, itemIds }, {
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    putItemNote(id: string, note: string, queueId?: string) {
        return this.put<never>(`/${id}/note`, { note }, {
            headers: {
                'Content-Type': 'application/json'
            },
            params: { queueId }
        });
    }

    getItem(id: string, queueId?: string) {
        return this.get<GetItemResponse>(`/${id}`, { params: { queueId } });
    }

    getLockedItems() {
        return this.get<GetLockedItemsResponse>('/locked', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    postLinkAnalysis(postLinkAnalysisBody: PostLinkAnalysisBody) {
        return this.post<never>('/link-analysis', postLinkAnalysisBody, {
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    /**
     * Get items form MR linked to the current item
     * @private id - search id
     */
    getLinkAnalysisMrItems(id:string, size: number, continuationToken?: string) {
        let manualParamsSerialized = `size=${size}`;

        /**
         * There is an issue with embedded axios encoding of the url params,
         * this is why here configuration token is encoded manually
         * if passed with axios config.params api will respond with 400
         */
        if (continuationToken) {
            manualParamsSerialized += `&continuation=${encodeURIComponent(continuationToken)}`;
        }

        return this.get<GetLinkAnalysisMrItemsResponse>(`/link-analysis/${id}/mr-items?${manualParamsSerialized}`);
    }

    /**
     * Get items form MR linked to the current item
     * @private id - search id
     */
    getLinkAnalysisDfpItems(id:string, size: number, continuationToken?: string) {
        let manualParamsSerialized = `size=${size}`;

        /**
         * There is an issue with embedded axios encoding of the url params,
         * this is why here configuration token is encoded manually
         * if passed with axios config.params api will respond with 400
         */
        if (continuationToken) {
            manualParamsSerialized += `&continuation=${encodeURIComponent(continuationToken)}`;
        }

        return this.get<GetLinkAnalysisDfpItemsResponse>(`/link-analysis/${id}/dfp-items?${manualParamsSerialized}`);
    }
}
