import { LABEL } from '../../constants';
import { Item } from '../../models/item';
import { ApiServiceResponse } from '../base-api-service';
import { Queue } from '../../models';

export interface ItemService {
    /**
     * Get review item
     * @param queueId
     */
    getReviewItem(queueId: string): Promise<Item | null>;

    /**
     * label item
     * @param itemId
     * @param label
     */
    labelItem(itemId: string, label: LABEL): Promise<ApiServiceResponse<never>>;

    /**
     * Get item details
     * @param itemId
     * @param queueId
     */
    getItem(itemId: string, queueId?: string): Promise<Item | null>

    /**
     * Start review process for a locked or unlock queue
     * @param queue
     * @param item
     */
    startReview(queue: Queue, item: Item): any;

    /**
     * Unlock the specified item
     */
    finishReview(itemId: string): Promise<Item | null>;

    /**
     *  Returns item, lock the specified item from the specified queue
     * @param queueId
     * @param itemId
     */
    getUnorderedQueueReviewItem(queueId: string, itemId: string): Promise<Item | null>;

    /**
     * Adds a new note for an item
     * @param itemId
     * @param note
     */
    putItemNote(itemId: string, note: string): Promise<ApiServiceResponse<never>>;

    /**
     * Adds a tag for an item
     * @param itemId
     * @param tags
     */
    patchItemTags(itemId: string, tags: string[]): Promise<ApiServiceResponse<never>>;

    /**
     * Items locked on user
     */
    getLockedItems(): Promise<Item[] | null>;

    /**
     * Search for Tag to use in Tag picker
     * @param term - search term
     */
    searchTag(term: string): Promise<string[]>;

    /**
     * Add new tag to dictionary
     * @param term
     */
    putTag(term: string): Promise<unknown>;
}
