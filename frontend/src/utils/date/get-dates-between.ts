// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CHART_AGGREGATION_PERIOD } from '../../constants';

/**
 * Returns number of weeks between two dates
 * @param start - Date
 * @param end - Date
 */
function getWeeksNumberBetweenDates(start: Date, end: Date) {
    const ONE_WEEK_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

    const START_DATE_IN_MILLISECONDS = start.getTime();
    const END_DATE_IN_MILLISECONDS = end.getTime();

    const DATES_DIFFERENCE = Math.abs(START_DATE_IN_MILLISECONDS - END_DATE_IN_MILLISECONDS);

    return Math.floor(DATES_DIFFERENCE / ONE_WEEK_IN_MILLISECONDS);
}

/**
 * Returns an array of dates by each day between two start and and date
 * @param startDate
 * @param endDate
 */
const getDayDatesRange = (startDate: Date, endDate:Date) => {
    let dates: Date[] = [];
    const theDate = new Date(startDate);
    while (theDate < endDate) {
        dates = [...dates, new Date(theDate)];
        theDate.setDate(theDate.getDate() + 1);
    }
    dates = [...dates, endDate];
    return dates;
};

/**
 * Returns an array of weeks dates by each week (inside start to end date) between two dates (start, end)
 * @param startDate
 * @param endDate
 */
const getWeeksDatesRange = (startDate: Date, endDate: Date) => {
    const ONE_WEEK_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;
    let weeksNumber = getWeeksNumberBetweenDates(startDate, endDate);
    let dates: Date[] = [];

    const startDateCopy = new Date(startDate);
    let startTime = startDateCopy.getTime();

    while (weeksNumber > 0) {
        startTime = new Date(startTime + ONE_WEEK_IN_MILLISECONDS).getTime();
        dates = [...dates, new Date(startTime)];
        weeksNumber -= 1;
    }

    return dates;
};

/**
 * Returns array of dates between two dates (start, end), depends on aggregation parameter
 *
 * @param start - start date
 * @param end - end date
 * @param period - aggregation period e.g: Day, Week
 */
export function getDatesBetween(start: Date, end: Date, period: CHART_AGGREGATION_PERIOD): Date[] {
    if (period === CHART_AGGREGATION_PERIOD.DAY) {
        return getDayDatesRange(start, end);
    }

    if (period === CHART_AGGREGATION_PERIOD.WEEK) {
        return getWeeksDatesRange(start, end);
    }

    return [];
}
