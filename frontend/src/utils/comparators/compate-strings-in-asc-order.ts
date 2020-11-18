// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Compares two string values in ascending order (alphabetical order)
 * This function should be mainly used by sort method for sorting arrays
 * of strings in alphabetical order
 *
 * @param prev - string value
 * @param next - string value
 * @return number - 1, -1, 0
 */
export function compareStringsInAscendingOrder(prev: string, next: string) {
    if (prev < next) {
        return -1;
    }

    if (prev > next) {
        return 1;
    }

    return 0;
}
