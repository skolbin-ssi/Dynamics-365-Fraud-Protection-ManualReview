// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Converts given string to Start case string
 * @param {string} string
 * @return string - string in start case
 */
export function stringToStartCase(string?: string) {
    if (typeof string !== 'string') {
        return '';
    }

    const trimmedString = string
        .replace(/[_-]/g, ' ')
        .trim();

    const firstChar = trimmedString[0].toUpperCase();
    const trailing = trimmedString.slice(1);

    return `${firstChar}${trailing}`;
}
