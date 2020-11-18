// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface FilterFieldDto {
    id: string,
    category: string,
    displayName: string,
    acceptableConditions: string[],
    description: string
    lowerBound: string | null;
    upperBound: string | null;
}
