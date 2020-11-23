// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { action, observable } from 'mobx';

import { ItemsLoadable } from '../misc/items-loadable';
import { LinkAnalysisMrItem } from '../../models/item/link-analysis';
import { TYPES } from '../../types';
import { ItemService } from '../../data-services/interfaces';
import { DEFAULT_LINK_ANALYSIS_ITEMS_PER_PAGE } from '../../constants';

@injectable()
export class LinkAnalysisMRItemsStore implements ItemsLoadable<LinkAnalysisMrItem> {
    @observable
    canLoadMore = false;

    @observable
    items: LinkAnalysisMrItem[] = [];

    @observable
    loadingMoreItems = false;

    @observable
    wasFirstPageLoaded = false;

    @observable
    selectedAnalysisItemsToLabeledIds: string[] = [];

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
            const { data, canLoadMore } = await this.itemsService.getLinkAnalysisMrItems(
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
    setSelectedAnalysisItems(ids: string[]) {
        this.selectedAnalysisItemsToLabeledIds = ids;
    }

    @action
    resetItems() {
        this.items = [];
    }

    @action
    resetSelectedItems() {
        this.selectedAnalysisItemsToLabeledIds = [];
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
