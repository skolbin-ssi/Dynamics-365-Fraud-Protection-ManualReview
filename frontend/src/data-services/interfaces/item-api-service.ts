// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LABEL } from '../../constants';
import { ApiServiceResponse } from '../base-api-service';
import { GetItemResponse, GetLockedItemsResponse } from '../api-services/item-api-service/api-models';
import { DeleteItemLockResponse } from '../api-services/item-api-service/api-models/delete-item-lock-response';

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
}
