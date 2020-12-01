// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import moment from 'moment';
/**
 * Returns the past date in the date range that includes today
 * @param days - number of days in the range
 */
export function getPastDate(days: number): Date | undefined {
    if (!Number.isFinite(days) || days < 1) return undefined;

    // We need to subtract 1 day less to receive the correct date
    return moment().startOf('day').subtract(days - 1, 'day').toDate();
}
