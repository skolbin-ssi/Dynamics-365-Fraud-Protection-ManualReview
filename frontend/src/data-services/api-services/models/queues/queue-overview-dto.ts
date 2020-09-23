// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface QueueOverviewDto {
    /**
     * Queue id
     */
    [key: string] : {
        lockedItemsCount: number,
        nearToSlaCount: number,
        nearToTimeoutCount: number
    }
}
