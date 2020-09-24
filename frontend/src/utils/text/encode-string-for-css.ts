// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * This function replaces all non-alphanumeric characters in the passed string
 * with underscore plus UTF-8 encoding of the character
 * and can be used for encoding strings to be used for CSS selectors.
 * @param str: string
 * @returns: string
 */
export function encodeStringForCSS(str: string): string {
    return str.replace(/[^\w_-]/gi, c => `_${c.charCodeAt(0).toString(16)}`);
}
