// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Converts given string to kebab-case string
 * @param {string} string
 * @return string - string in kebab case
 */
export function stringToKebabCase(string?: string) {
    if (typeof string !== 'string') {
        return '';
    }

    return string
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase();
}
