// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface PageableList<T> {
    data: T[],
    canLoadMore: boolean;
}
