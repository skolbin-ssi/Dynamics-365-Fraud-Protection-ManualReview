// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export function roundNumberToDigit(num: number, fractionDigits: number) {
    return Number(num.toFixed(fractionDigits));
}
