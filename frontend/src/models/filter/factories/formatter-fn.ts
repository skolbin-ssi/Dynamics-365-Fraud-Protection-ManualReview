// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Formatter function.
 *
 * Formats values of created conditions to equal string representation
 * in order to display this values on the tiles
 */
export type formatter = (values: string[]) => string;
