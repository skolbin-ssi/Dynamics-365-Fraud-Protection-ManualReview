/**
 * Returns date excluding time zone difference
 * @param date
 */
export function excludeLocalTimeZoneDiff(date: Date) {
    const ONE_HOUR_IN_MILLISECONDS = 60000;
    const timeZoneOffset = date.getTimezoneOffset() * ONE_HOUR_IN_MILLISECONDS;
    return new Date(date.getTime() - timeZoneOffset).toISOString();
}
