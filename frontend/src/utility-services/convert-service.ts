// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import papa, { UnparseConfig, UnparseObject } from 'papaparse';

export type UnparseTypes = Array<Object> | Array<Array<any>> | UnparseObject;

/**
 * Converts raw data to CSV string
 *
 * @param data - raw data for CSV file
 * @param config - configuration object
 */
export function convertToCSVString(data: UnparseTypes, config?: UnparseConfig): string {
    let unparsedData = '';
    try {
        unparsedData = papa.unparse(data, config);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
    }

    return unparsedData;
}
