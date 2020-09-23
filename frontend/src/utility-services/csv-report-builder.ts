// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { injectable } from 'inversify';
import { convertToCSVString, UnparseTypes } from './convert-service';

import { Report } from '../models/misc';

interface Reportable {
    buildReport(name: string, rawData: UnparseTypes): Report
}

/**
 * Builds CSV Report
 */
@injectable()
export class CSVReportBuilder implements Reportable {
    /**
     * Creates report object
     *
     * @param name - name of the report to be displayed
     * @param rawData - raw report data
     * @returns Report - object that represents report
     */
    buildReport(name: string, rawData: UnparseTypes): Report {
        return {
            name,
            data: convertToCSVString(rawData)
        };
    }
}
