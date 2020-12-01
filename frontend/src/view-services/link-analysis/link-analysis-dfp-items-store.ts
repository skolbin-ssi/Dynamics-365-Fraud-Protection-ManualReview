// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { action, observable } from 'mobx';

import { TYPES } from '../../types';
import { ItemsLoadable } from '../misc/items-loadable';
import { LinkAnalysisDfpItem } from '../../models/item/link-analysis';
import { ItemService } from '../../data-services/interfaces';
import { DEFAULT_LINK_ANALYSIS_ITEMS_PER_PAGE } from '../../constants';

@injectable()
export class LinkAnalysisDFPItemsStore implements ItemsLoadable<LinkAnalysisDfpItem> {
    @observable
    canLoadMore = false;

    @observable
    items: LinkAnalysisDfpItem[] = [];

    @observable
    loadingMoreItems = false;

    @observable
    wasFirstPageLoaded = false;

    constructor(
        @inject(TYPES.ITEM_SERVICE) private readonly itemsService: ItemService
    ) {}

    @action
    async fetchItems(searchId: string, loadMore: boolean = false) {
        if (loadMore) {
            this.loadingMoreItems = true;
        } else {
            this.wasFirstPageLoaded = false;
        }

        try {
            const { data, canLoadMore } = await this.itemsService.getLinkAnalysisDfpItems(
                'MRItemsStore.getLinkAnalysisMrItems',
                searchId,
                loadMore,
                DEFAULT_LINK_ANALYSIS_ITEMS_PER_PAGE
            );
            this.items = loadMore ? [...this.items, ...data] : data;
            this.canLoadMore = canLoadMore;
            this.wasFirstPageLoaded = true;
        } finally {
            this.loadingMoreItems = false;
            this.wasFirstPageLoaded = true;
        }
    }

    @action
    resetItems() {
        this.items = [];
    }

    @action
    resetWasFirstPageLoaded() {
        this.wasFirstPageLoaded = false;
    }

    @action
    resetCanLoadMore() {
        this.canLoadMore = false;
    }

    @action
    clearStore() {
        this.resetItems();
        this.resetWasFirstPageLoaded();
        this.resetCanLoadMore();
    }
}
