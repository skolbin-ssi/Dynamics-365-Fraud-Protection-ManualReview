// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LABEL } from '../../constants';
import { BatchLabelItemsResult, Item } from '../../models/item';
import { ApiServiceResponse } from '../base-api-service';
import { PageableList, Queue } from '../../models';
import {
    LinkAnalysisMrItem,
    LinkAnalysis,
    PostLinkAnalysisBody,
    LinkAnalysisDfpItem
} from '../../models/item/link-analysis';

export interface BatchItemsLabelApiParams {
    label: LABEL;
    itemIds: string[],
    note?: string;
}

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
     * @param queueId
     */
    labelItem(itemId: string, label: LABEL, queueId?: string): Promise<ApiServiceResponse<never>>;

    batchLabelItems(params: BatchItemsLabelApiParams): Promise<BatchLabelItemsResult[] | null>;

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
     * @param itemId
     * @param queueId
     */
    finishReview(itemId: string, queueId?: string): Promise<Item | null>;

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
     * @param queueId
     */
    putItemNote(itemId: string, note: string, queueId?: string): Promise<ApiServiceResponse<never>>;

    /**
     * Adds a tag for an item
     * @param itemId
     * @param tags
     * @param queueId
     */
    patchItemTags(itemId: string, tags: string[], queueId?: string): Promise<ApiServiceResponse<never>>;

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

    /**
     * Initiate link analysis for particular item
     *
     * @param postLinkAnalysisBody
     */
    postLinkAnalysis(postLinkAnalysisBody: PostLinkAnalysisBody): Promise<LinkAnalysis | null>;

    /**
     * Get items by queue id
     * @param chainContinuationIdentifier - unique id that will be same for first and subsequent calls
     * @param id - search id
     * @param shouldLoadMore - should perform initial request or load more from last call
     * @param size - amount of items to load
     */
    getLinkAnalysisMrItems(chainContinuationIdentifier: string, id: string, shouldLoadMore: boolean, size?: number): Promise<PageableList<LinkAnalysisMrItem>>

    /**
     * Get items by queue id
     * @param chainContinuationIdentifier - unique id that will be same for first and subsequent calls
     * @param id - search id
     * @param shouldLoadMore - should perform initial request or load more from last call
     * @param size - amount of items to load
     */
    getLinkAnalysisDfpItems(chainContinuationIdentifier: string, id: string, shouldLoadMore: boolean, size?: number): Promise<PageableList<LinkAnalysisDfpItem>>
}
