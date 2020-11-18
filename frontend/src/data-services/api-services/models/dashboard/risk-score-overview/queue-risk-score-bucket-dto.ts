// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface QueueRiskScoreBucketDto {
    [key: string]: {
        good: number,
        bad: number,
        watched: number
    }
}
