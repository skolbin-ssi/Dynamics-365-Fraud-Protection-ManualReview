// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export class OverviewItem {
    lockedItemsCount = 0;

    nearToSlaCount = 0;

    nearToTimeoutCount = 0;
}

export type QueuesOverview = Map<string, OverviewItem>;
