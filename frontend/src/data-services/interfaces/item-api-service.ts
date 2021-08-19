// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LABEL } from '../../constants';
import { PostLinkAnalysisBody } from '../../models/item/link-analysis';
import {
    GetItemResponse,
    GetLinkAnalysisDfpItemsResponse,
    GetLinkAnalysisMrItemsResponse,
    GetLockedItemsResponse,
    PatchBatchLabelItemsResponse,
    PostLinkAnalysisResponse
} from '../api-services/item-api-service/api-models';
import { DeleteItemLockResponse } from '../api-services/item-api-service/api-models/delete-item-lock-response';
import { ApiServiceResponse } from '../base-api-service';
import { BatchItemsLabelApiParams } from './item-service';

export interface ItemApiService {
    /**
     * Add a tag to the specified item
     * @param id - item id
     * @param tags
     * @param queueId
     */
    patchItemTag(id: string, tags: string[], queueId?: string): Promise<ApiServiceResponse<never>>;

    /**
     * Unlock the specified item
     * @param id - item id
     * @param queueId
     */
    deleteItemLock(id: string, queueId?: string): Promise<ApiServiceResponse<DeleteItemLockResponse>>;

    /**
     * Apply label to the item
     * @param id
     * @param label
     * @param queueId
     */
    patchItemLabel(id: string, label: LABEL, queueId?: string): Promise<ApiServiceResponse<never>>;

    /**
     * Batch label items
     * @param params
     */
    patchBatchLabel(params: BatchItemsLabelApiParams): Promise<ApiServiceResponse<PatchBatchLabelItemsResponse>>

    /**
     * Apply note to the item
     * @param id
     * @param note
     * @param queueId
     */
    putItemNote(id: string, note: string, queueId?: string): Promise<ApiServiceResponse<never>>;

    /**
     * Get item details by id
     * @param id
     * @param queueId
     */
    getItem(id: string, queueId?: string): Promise<ApiServiceResponse<GetItemResponse>>;

    /**
     * Items locked on user
     */
    getLockedItems(): Promise<ApiServiceResponse<GetLockedItemsResponse>>;

    /**
     * Initiate link analysis for particular item
     */
    postLinkAnalysis(postLinkAnalysisBody: PostLinkAnalysisBody): Promise<ApiServiceResponse<PostLinkAnalysisResponse>>;

    /**
     * Get items from MR linked to the current item
     * @param id - search id
     * @param size - amount of items to load
     * @param continuationToken - unique id that will be same for first and subsequent calls
     */
    getLinkAnalysisMrItems(id: string, size: number, continuationToken?: string | null): Promise<ApiServiceResponse<GetLinkAnalysisMrItemsResponse>>;

    /**
     * Get items from MR linked to the current item
     * @param id - search id
     * @param size - amount of items to load
     * @param continuationToken - unique id that will be same for first and subsequent calls
     */
    getLinkAnalysisDfpItems(id: string, size: number, continuationToken?: string | null): Promise<ApiServiceResponse<GetLinkAnalysisDfpItemsResponse>>;
}
