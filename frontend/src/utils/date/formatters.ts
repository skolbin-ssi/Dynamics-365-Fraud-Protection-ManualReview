function isValidDateString(d: string) {
    const timestamp = Date.parse(d);

    return !Number.isNaN(timestamp);
}

/**
 *  Returns date formatted to e.g.: January 2, 2020;
 * @param date - Date object
 */
export const formatDateToFullMonthDayYear = (date: Date) => {
    const fullMonthName = date.toLocaleString('default', { month: 'long' });
    return `${fullMonthName} ${date.getDate()}, ${date.getFullYear()}`;
};

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
 * Converts  ISO DateTime string to local date string
 *
 * e.g.: 2020-05-28T23:08:23.411Z  convert to => 05/28
 *
 * @param isoDateTimeString
 * @return {string} local date string in d/m format
 */
export function isoStringToLocalMothDayFormat(isoDateTimeString: string) {
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

    return `${month}/${day}`;
}

/**
 * Return date formatter to locale string e.g.: 10:23 AM, 06/06/2020
 * @param isoDateTimeString
 * @param placeholder
 */
export function formatISODateStringToLocaleString<T extends any>(isoDateTimeString: string, placeholder: T): string | T {
    if (!isValidDateString(isoDateTimeString)) {
        return placeholder;
    }

    const date = new Date(isoDateTimeString);
    return date.toLocaleString();
}

/**
 * Return date formatter to locale string e.g.: April 24, 2020
 * @param isoDateTimeString
 */
export function formatISODateStringToLocaleDateString(isoDateTimeString: string) {
    const date = new Date(isoDateTimeString);
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${shortMonthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
