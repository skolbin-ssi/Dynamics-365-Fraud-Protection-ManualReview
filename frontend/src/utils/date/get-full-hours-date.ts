// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Returns date including whole date's hours of the passed date
 * @param date
 */
export function getFullHoursDate(date: Date) {
    return new Date(date.setHours(23, 59, 59, 999));
}
