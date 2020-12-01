// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export function isEmpty(value: any): boolean {
    return value === undefined
        || value === null
        || Number.isNaN(value)
        || (typeof value === 'object' && Object.keys(value).length === 0)
        || (typeof value === 'string' && value.trim().length === 0);
}
