// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Report - represents CSV report model
 */
export interface Report {
    /**
     * name - report name
     */
    name: string

    /**
     * data - CSV formatted data
     */
    data: string
}
