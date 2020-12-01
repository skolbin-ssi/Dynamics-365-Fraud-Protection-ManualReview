// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import moment from 'moment';
/**
 * @param date
 * @return end of certain date including whole date's hours, minutes, seconds and milliseconds
 */
export function getEndOfDate(date: Date): Date {
    return moment(date).endOf('day').toDate();
}

/**
 * @param date
 * @return start of certain date (date's hours, minutes, seconds and milliseconds are set to 0)
 */
export function getStartOfDate(date: Date): Date {
    return moment(date).startOf('day').toDate();
}
