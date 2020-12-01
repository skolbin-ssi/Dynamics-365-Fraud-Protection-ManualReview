// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DATE_RANGE, DATE_RANGE_DAYS } from '../../constants';
import { getEndOfDate } from './get-start-or-end-of-date';
import { getPastDate } from './get-past-date';

export function calculateDateRange(fromDate: Date | null, toDate: Date | null): DATE_RANGE {
    let dateRange = DATE_RANGE.CUSTOM;

    if (!fromDate || !toDate) {
        dateRange = DATE_RANGE.SIX_WEEKS;
    }

    const nowDate = getEndOfDate(new Date());

    if (fromDate && toDate && toDate.getTime() === nowDate.getTime()) {
        Object.entries(DATE_RANGE_DAYS).forEach(([key, value]) => {
            if (fromDate?.getTime() === getPastDate(value)?.getTime()) {
                dateRange = key as DATE_RANGE;
            }
        });
    }

    return dateRange;
}
