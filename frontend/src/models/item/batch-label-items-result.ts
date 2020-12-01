// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export class BatchLabelItemsResult {
    itemId: string;

    success: boolean;

    reason: string;

    constructor(itemId: string, success: boolean, reason: string) {
        this.itemId = itemId;
        this.success = success;
        this.reason = reason;
    }
}
