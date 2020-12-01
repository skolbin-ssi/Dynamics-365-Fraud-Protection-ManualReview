// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface ItemsLoadable<T> {
    items: T[];
    loadingMoreItems: boolean;
    wasFirstPageLoaded: boolean;
    canLoadMore: boolean;
}
