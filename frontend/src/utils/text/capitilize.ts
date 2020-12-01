// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Capitalizes first letters of words in string.
 */
export function capitalize(str: string, lower = false) {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
}
