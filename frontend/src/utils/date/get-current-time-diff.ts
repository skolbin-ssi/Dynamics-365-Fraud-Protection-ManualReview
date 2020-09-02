export function getCurrentTimeDiff(date: Date): { days: number, hours: number} {
    const SECONDS_PER_ONE_HOUR = 3600;
    const HOURS_PER_ONE_DAY = 24;

    let diffTimeInSeconds = Math.abs(new Date().getTime() - date.getTime()) / 1000;

    const days = Math.floor(diffTimeInSeconds / (SECONDS_PER_ONE_HOUR * HOURS_PER_ONE_DAY));
    diffTimeInSeconds -= days * 86400;

    const hours = Math.floor(diffTimeInSeconds / SECONDS_PER_ONE_HOUR) % HOURS_PER_ONE_DAY;
    diffTimeInSeconds -= hours * SECONDS_PER_ONE_HOUR;

    return {
        days,
        hours
    };
}
