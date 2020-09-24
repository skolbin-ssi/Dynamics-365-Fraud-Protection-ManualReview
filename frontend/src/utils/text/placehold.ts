// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export function placeHold(value: any, placeholder: any = '-') {
    if (typeof value === 'undefined') {
        return placeholder;
    }

    return value;
}
