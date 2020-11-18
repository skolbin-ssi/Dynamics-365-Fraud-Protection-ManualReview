// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface RiskScoreOverviewBucketItemDto {
    [key: string]: {
        count: number;
    }
}

export type RiskScoreOverviewBucketItem = RiskScoreOverviewBucketItemDto;
