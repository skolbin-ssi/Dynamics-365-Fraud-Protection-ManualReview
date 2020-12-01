// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed, observable } from 'mobx';
import { inject, injectable } from 'inversify';
import autobind from 'autobind-decorator';

import { SearchService } from '../../data-services/interfaces/domain-interfaces/search-service';
import { AppStore } from '../app-store';
import { QueueStore } from '../queues';
import { isEmpty } from '../../utils';

import { TYPES } from '../../types';
import { Item, User } from '../../models';
import { ItemsLoadable } from '../misc/items-loadable';
import { ItemSearchQueryDTO, ItemSortSettingsDTO } from '../../data-services/api-services/models';
import {
    DEFAULT_SORTING,
    LABEL_NAMES,
    NOTIFICATION_TYPE,
    QUEUE_VIEW_TYPE,
} from '../../constants';
import { ItemService, UserService } from '../../data-services/interfaces';
import { FiltersBuilder } from '../../utility-services';

@injectable()
export class SearchScreenStore implements ItemsLoadable<Item> {
    /**
     * Found items from API
     */
    @observable items: Item[] = [];

    /**
     * Indication that at least first page of items was already loaded
     */
    @observable wasFirstPageLoaded = false;

    /**
     * Indication that more items are loading
     */
    @observable loadingMoreItems = false;

    /**
     * Sets if there are more items can be loaded
     */
    @observable canLoadMore: boolean = false;

    /**
     * Search query object id
     */
    @observable searchId?: string | null;

    /**
     * Search query object
     */
    @observable searchQuery: ItemSearchQueryDTO = {};

    /**
     * Sorting object for searched items
     */
    @observable sorting: ItemSortSettingsDTO = DEFAULT_SORTING;

    @observable users?: User[];

    @observable tags?: string[];

    private residualQueueId?: string;

    constructor(
        @inject(TYPES.SEARCH_SERVICE) private searchService: SearchService,
        @inject(TYPES.USER_SERVICE) private userService: UserService,
        @inject(TYPES.ITEM_SERVICE) private itemService: ItemService,
        @inject(TYPES.APP_STORE) private appStore: AppStore,
        @inject(TYPES.QUEUE_STORE) public readonly queueStore: QueueStore,
        @inject(TYPES.FILTERS_BUILDER) public readonly filtersBuilder: FiltersBuilder
    ) {
        this.users = this.userService.getUsers();
    }

    @computed
    get personas() {
        return (this.users || [])
            .map(user => user.asPersona)
            .sort((userA, userB) => (userA.text || '').localeCompare(userB.text || ''));
    }

    @action
    setSearchId(searchId: string) {
        this.items = [];
        this.searchId = searchId;
    }

    @action
    clearSearchId() {
        this.searchId = null;
    }

    @action
    async loadSearchQueryParams() {
        if (!this.searchId) return;

        this.wasFirstPageLoaded = false;

        try {
            const data = await this.searchService.getSearchQuery(this.searchId);
            this.updateSearchQueryObject(data);
        } catch {
            this.appStore.showToast({
                type: NOTIFICATION_TYPE.GENERIC_ERROR,
                message: 'Saved before search criteria can not be loaded. Try adjusting them.'
            });
        } finally {
            this.wasFirstPageLoaded = true;
        }
    }

    @action
    async createSearchQuery() {
        if (!this.searchQuery) return;

        this.wasFirstPageLoaded = false;
        this.clearSearchId();

        try {
            const searchId = await this.searchService.createSearchQuery(this.searchQuery);
            this.setSearchId(searchId);
        } catch {
            this.appStore.showToast({
                type: NOTIFICATION_TYPE.GENERIC_ERROR,
                message: 'Search criteria were not saved. Try adjusting them.'
            });
        } finally {
            this.wasFirstPageLoaded = true;
        }
    }

    // If the residual queue is selected, we must additionally pass to BE parameter "residual" equal true
    @action
    updateSearchQueryObject(updatedSearchQuery: ItemSearchQueryDTO) {
        if (updatedSearchQuery?.queueIds?.length) {
            let residual = false;
            updatedSearchQuery.queueIds
                .forEach(queueId => {
                    if (this.queueStore.getQueueById(queueId)?.residual) {
                        residual = true;
                        this.residualQueueId = queueId;
                    }
                });

            this.searchQuery = { ...updatedSearchQuery, residual };
        } else {
            this.searchQuery = updatedSearchQuery;
            delete this.searchQuery.residual;
        }
    }

    /**
     * @param loadMore - whether or not we're loading new items an existing list
     */
    @action
    async searchItems(loadMore: boolean = false) {
        if (!this.searchId) return;

        if (loadMore) {
            this.loadingMoreItems = true;
        } else {
            this.wasFirstPageLoaded = false;
        }

        try {
            const { data, canLoadMore } = await this.searchService.searchItems(
                'SearchScreenStore.searchItems',
                this.searchId,
                loadMore,
                this.sorting
            );

            data.forEach(this.selectQueueForItem);
            this.items = loadMore ? [...this.items, ...data] : data;
            this.canLoadMore = canLoadMore;
        } finally {
            this.loadingMoreItems = false;
            this.wasFirstPageLoaded = true;
        }
    }

    @action
    clearItems() {
        this.items = [];
        this.wasFirstPageLoaded = false;
    }

    @action
    updateSorting(updatedSorting: ItemSortSettingsDTO) {
        this.items = [];
        this.sorting = updatedSorting;
    }

    @action
    resetSortingToDefault() {
        this.sorting = DEFAULT_SORTING;
    }

    @action
    async loadQueues() {
        if (!this.queueStore.queues && !this.queueStore.loadingQueues) {
            await this.queueStore.loadQueues();
            await this.queueStore.loadQueues(QUEUE_VIEW_TYPE.ESCALATION);
        }
    }

    @action
    async loadTags() {
        this.tags = await this.itemService.searchTag('');
    }

    @computed
    get areSearchParametersSetToDefault() {
        return isEmpty(this.searchQuery)
            && this.sorting.field === DEFAULT_SORTING.field
            && this.sorting.order === DEFAULT_SORTING.order;
    }

    // This logic defines the queue within which item has minimum time left before the deadline
    // and sets it as selected for the search results table
    @autobind
    selectQueueForItem(item: Item) {
        let selectedQueueId = item.queueIds[0] || this.residualQueueId;
        let minDaysLeft: number = Infinity;

        item.queueIds.forEach(queueId => {
            const queue = this.queueStore.getQueueById(queueId);
            const timeLeft = this.queueStore.getDaysLeft(item, queue);
            if (timeLeft !== null && timeLeft < minDaysLeft) {
                minDaysLeft = timeLeft;
                selectedQueueId = queueId;
            }
        });

        item.selectQueueId(selectedQueueId);
    }

    @autobind
    composeSearchSummary(searchQueryObj: ItemSearchQueryDTO) {
        let summary = '';

        if (searchQueryObj.active === true) {
            summary += 'Only active';
        }

        if (searchQueryObj.active === false) {
            summary += 'Only inactive';
        }

        if (searchQueryObj.ids?.length) {
            summary += summary ? ', by IDs: ' : 'By IDs: ';
            searchQueryObj.ids.forEach((id, index) => {
                summary += id && index ? `, ${id}` : id;
            });
        }

        if (searchQueryObj.queueIds?.length) {
            summary += summary ? ', by queues: ' : 'By queues: ';
            searchQueryObj.queueIds.forEach((queueId, index) => {
                const add = this.queueStore.getQueueById(queueId)?.name || '';
                summary += add && index ? `, ${add}` : add;
            });
        }

        if (searchQueryObj.lockOwnerIds?.length) {
            summary += summary ? ', by lock owners: ' : 'By lock owners: ';
            searchQueryObj.lockOwnerIds.forEach((userId, index) => {
                const add = this.userService.getUser(userId)?.name;
                summary += add && index ? `, ${add}` : add;
            });
        }

        if (searchQueryObj.holdOwnerIds?.length) {
            summary += summary ? ', by hold owners: ' : 'By hold owners: ';
            searchQueryObj.holdOwnerIds.forEach((userId, index) => {
                const add = this.userService.getUser(userId)?.name;
                summary += add && index ? `, ${add}` : add;
            });
        }

        if (searchQueryObj.labels?.length) {
            summary += summary ? ', by labels: ' : 'By labels: ';
            searchQueryObj.labels.forEach((label, index) => {
                const add = (LABEL_NAMES[label] || '');
                summary += add && index ? `, ${add}` : add;
            });
        }

        if (searchQueryObj.labelAuthorIds?.length) {
            summary += summary ? ', by decision authors: ' : 'By decision authors: ';
            searchQueryObj.labelAuthorIds.forEach((userId, index) => {
                const add = this.userService.getUser(userId)?.name;
                summary += add && index ? `, ${add}` : add;
            });
        }

        if (searchQueryObj.tags?.length) {
            summary += summary ? ', by tags: ' : 'By tags: ';
            searchQueryObj.tags.forEach((tag, index) => {
                summary += tag && index ? `, ${tag}` : tag;
            });
        }

        if (summary.length > 80) {
            summary = this.composeSortSearchSummary(searchQueryObj);
        }

        return summary || 'Search';
    }

    composeSortSearchSummary(searchQueryObj: ItemSearchQueryDTO) {
        let summary = '';

        if (searchQueryObj.active === true) {
            summary += 'Only active';
        }

        if (searchQueryObj.active === false) {
            summary += 'Only inactive';
        }

        if (searchQueryObj.ids?.length) {
            summary += summary ? ', by IDs' : 'By IDs';
        }

        if (searchQueryObj.queueIds?.length) {
            summary += summary ? ', by queues' : 'By queues';
        }

        if (searchQueryObj.lockOwnerIds?.length) {
            summary += summary ? ', by lock owners' : 'By lock owners';
        }

        if (searchQueryObj.holdOwnerIds?.length) {
            summary += summary ? ', by hold owners' : 'By hold owners';
        }

        if (searchQueryObj.labels?.length) {
            summary += summary ? ', by labels' : 'By labels';
        }

        if (searchQueryObj.labelAuthorIds?.length) {
            summary += summary ? ', by decision authors' : 'By decision authors';
        }

        if (searchQueryObj.tags?.length) {
            summary += summary ? ', by tags' : 'By tags';
        }

        return summary || 'Search';
    }
}
