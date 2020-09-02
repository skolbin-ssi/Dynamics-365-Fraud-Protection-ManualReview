/**
 * Returns past date
 * @param days - number of days to extract from today
 */
export function getPastDate(days: number) {
    // set hours to the beginning of the day
    const beginDate = new Date(new Date().setHours(0, 0, 0, 0));

    return new Date(beginDate.getTime() - (days * 24 * 60 * 60 * 1000));
}
