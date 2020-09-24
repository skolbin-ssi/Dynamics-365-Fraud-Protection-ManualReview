// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface PageableListDTO<T> {
    continuationToken: string;
    size: number;
    values: T[];
}
