// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import moment from 'moment-timezone';
import { MomentInput } from 'moment';

const LOCAL_DATE_STRING_FORMAT = 'M/D/YYYY';
const LOCAL_TIME_STRING_FORMAT = 'h:mm:ss A';
const LOCAL_STRING_FORMAT = `${LOCAL_DATE_STRING_FORMAT}, ${LOCAL_TIME_STRING_FORMAT}`;
const LOCAL_STRING_FORMAT_WITH_TIMEZONE = `${LOCAL_DATE_STRING_FORMAT}, ${LOCAL_TIME_STRING_FORMAT} Z`;

/**
 * Formats any MomentInput to a string e.g.: January 2, 2020;
 * @param date - MomentInput
 * @return - string
 */
export const formatDateToFullMonthDayYear = (date: MomentInput): string => moment(date).format('MMMM D, YYYY');

/**
 * Converts ISO DateTime string to local date string
 *
 * e.g.: 2020-03-31T00:00:00 => 2020-03-31
 *
 * @param {string} isoDateTimeString
 * @return {string} local date string
 */
export function isoStringToDateString(isoDateTimeString: string) {
    const timestamp = Date.parse(isoDateTimeString);

    // not a date string
    if (Number.isNaN(timestamp)) {
        return isoDateTimeString;
    }

    const dateObj = new Date(isoDateTimeString);

    let month: number | string = dateObj.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;

    let day: number| string = dateObj.getDate();
    day = day < 10 ? `0${day}` : day;

    return `${dateObj.getFullYear()}-${month}-${day}`;
}

/**
 * Converts DateTime string to MM/DD format
 * e.g.: 2020-05-28T23:08:23.411Z  convert to => 05/28
 *
 * @param dateString - DateTime string
 * @return {string} string in MM/DD format
 */
export function formatToLocaleMonthDayFormat(dateString: string): string {
    const dateMoment = moment(dateString);

    if (!dateMoment.isValid()) {
        return dateString;
    }

    return dateMoment.format('MM/DD');
}

/**
 * Format any MomentInput to a date object in a default moment format (ISO 8601 with local time zone)
 * e.g.: 2020-09-08T12:15:30+03:00 => Tue Sep 08 2020 12:15:30 GMT+0300 (Eastern European Summer Time)
 *
 * @param date - MomentInput
 * @returns date - JS Date object with a time
 */
export function formatDateStringToJSDate(date: MomentInput) {
    const dateMoment = moment(date);

    if (!dateMoment.isValid()) {
        return undefined;
    }

    return moment(date, moment.defaultFormat).toDate();
}

/**
 * If date is valid formats MomentInput to a local date string format,
 * otherwise it returns a passed placeholder
 * e.g.: Tue Sep 08 2020 12:15:30 GMT+0300 (Eastern European Summer Time) ==> 9/8/2020
 *
 * @param date - MomentInput
 * @param placeholder - string | JSX.Element
 * @return - string | JSX.Element
 */
export function formatToLocaleDateString(date: MomentInput, placeholder: string | JSX.Element | null): string | JSX.Element | null {
    const dateMoment = moment(date);

    if (!dateMoment.isValid()) {
        return placeholder;
    }

    return dateMoment.format(LOCAL_DATE_STRING_FORMAT);
}

/**
 * If date is valid formats MomentInput to a local time string format,
 * otherwise it returns a passed placeholder
 * e.g.: Tue Sep 08 2020 12:15:30 GMT+0300 (Eastern European Summer Time) ==> 12:15:30 AM
 *
 * @param date - MomentInput
 * @param placeholder - string | JSX.Element
 * @return - string | JSX.Element
 */
export function formatToLocaleTimeString(date: MomentInput, placeholder: string | JSX.Element): string | JSX.Element {
    const dateMoment = moment(date);

    if (!dateMoment.isValid()) {
        return placeholder;
    }

    return dateMoment.format(LOCAL_TIME_STRING_FORMAT);
}

/**
 * If date is valid formats MomentInput to a local string format,
 * otherwise it returns a passed placeholder
 * e.g.: Tue Sep 08 2020 12:15:30 GMT+0300 (Eastern European Summer Time) ==> 9/8/2020, 12:15:30 AM
 *
 * @param date - MomentInput
 * @param placeholder - string | JSX.Element
 * @return - string | JSX.Element
 */
export function formatToLocaleString(date: MomentInput, placeholder: string | JSX.Element): string | JSX.Element {
    const dateMoment = moment(date);

    if (!dateMoment.isValid()) {
        return placeholder;
    }

    return dateMoment.format(LOCAL_STRING_FORMAT);
}

/**
 * If date is valid formats MomentInput to a local string format,
 * otherwise it returns a passed placeholder
 * e.g.: Tue Sep 08 2020 12:15:30 GMT+0300 (Eastern European Summer Time) ==> 9/8/2020, 12:15:30 AM
 *
 * @param date - MomentInput
 * @param placeholder - string | JSX.Element
 * @return - string | JSX.Element
 */
export function formatForNotes(date: MomentInput, placeholder: string | JSX.Element): string | JSX.Element {
    const dateMoment = moment(date);

    if (!dateMoment.isValid()) {
        return placeholder;
    }

    return dateMoment.format(`${LOCAL_DATE_STRING_FORMAT} [at] ${LOCAL_TIME_STRING_FORMAT}`);
}

/**
 * Converts date to UTC and if date is valid formats it to a local string,
 * otherwise it returns a passed placeholder
 * e.g.: Tue Sep 08 2020 12:15:30 GMT+0300 (Eastern European Summer Time) ==> 9/8/2020, 9:15:30 AM
 *
 * @param date - MomentInput
 * @param placeholder - string | JSX.Element
 * @return - string | JSX.Element
 */
export function convertToUTCAndFormatToLocalString(date: MomentInput, placeholder: string | JSX.Element): string | JSX.Element {
    const dateMoment = moment(date);

    if (!dateMoment.isValid()) {
        return placeholder;
    }

    return dateMoment.utc().format(LOCAL_STRING_FORMAT);
}

/**
 * Parses MomentInput keeping the time zone
 * and if date is valid formats it to a local string with shown time zone,
 * otherwise it returns a passed placeholder
 * e.g.: Tue Sep 08 2020 12:15:30 GMT+0300 (Eastern European Summer Time) ==> 9/8/2020, 12:15:30 AM +03:00
 *
 * @param date - MomentInput
 * @param placeholder - string | JSX.Element
 * @return - string | JSX.Element
 */
export function formatToLocalStringWithPassedTimeZone(date: MomentInput, placeholder: string | JSX.Element): string | JSX.Element {
    const dateMoment = moment.parseZone(date);

    if (!dateMoment.isValid()) {
        return placeholder;
    }

    return dateMoment.format(LOCAL_STRING_FORMAT_WITH_TIMEZONE);
}

/**
 * Formats any MomentInput to a string e.g.: Apr 24, 2020
 * @param date - MomentInput
 * @return - string
 */
export function formatToMMMDYYY(date: MomentInput): string {
    return moment(date).format('MMM D, YYYY');
}

/**
 * Format any MomentInput to a string in a format of: {ddd MMM DD YYYY}
 * e.g.: Tue Sep 08 2020 12:15:30 GMT+0300 (Eastern European Summer Time) ==> Tue Sep 08 2020
 *
 * @param date - MomentInput
 * @return - string
 */
export function formatTodddMMMDDYYYY(date: MomentInput): string {
    return moment(date).format('ddd MMM DD YYYY');
}

/**
 * Format any MomentInput to a string in a default moment format (ISO 8601 with local time zone)
 * e.g.: Tue Sep 08 2020 12:15:30 GMT+0300 (Eastern European Summer Time) ==> 2020-09-08T12:15:30+03:00
 *
 * @param date - MomentInput
 * @return - string
 */
export function formatToISOStringWithLocalTimeZone(date: MomentInput): string {
    return moment(date).format();
}
