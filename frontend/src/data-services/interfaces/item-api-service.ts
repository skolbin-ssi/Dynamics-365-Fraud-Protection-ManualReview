import { LABEL } from '../../constants';
import { ApiServiceResponse } from '../base-api-service';
import { GetItemResponse, GetLockedItemsResponse } from '../api-services/item-api-service/api-models';
import { DeleteItemLockResponse } from '../api-services/item-api-service/api-models/delete-item-lock-response';

export interface ItemApiService {
    /**
     * Add a tag to the specified item
     * @param id - item id
     * @param tags
     */
    patchItemTag(id: string, tags: string[]): Promise<ApiServiceResponse<never>>;

    /**
     * Unlock the specified item
     * @param id - item id
     */
    deleteItemLock(id: string): Promise<ApiServiceResponse<DeleteItemLockResponse>>;

    /**
     * Apply label to the item
     * @param id
     * @param label
     */
    patchItemLabel(id: string, label: LABEL): Promise<ApiServiceResponse<never>>;

    /**
     * Apply note to the item
     * @param id
     * @param note
     */
    putItemNote(id: string, note: string): Promise<ApiServiceResponse<never>>;

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
