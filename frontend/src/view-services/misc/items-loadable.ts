// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Item } from '../../models/item';

export interface ItemsLoadable {
    items: Item[];
    loadingMoreItems: boolean;
    wasFirstPageLoaded: boolean;
    canLoadMore: boolean;
}
