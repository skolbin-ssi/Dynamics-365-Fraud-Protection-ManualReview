// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface ItemLockDTO {
    /* string($date-time) */
    locked: string;
    ownerId: string;
    queueId: string;
    queueViewId: string;
}
