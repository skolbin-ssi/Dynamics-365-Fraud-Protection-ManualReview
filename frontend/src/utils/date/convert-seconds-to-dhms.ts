// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Duration } from 'iso8601-duration';

export function convertSecondsToDhms(timeInSeconds: number): Duration {
    const result: Duration = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    const days = Math.floor(timeInSeconds / (3600 * 24));
    const hours = Math.floor((timeInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    if (days > 0) {
        result.days = days;
    }

    if (hours > 0) {
        result.hours = hours;
    }

    if (minutes > 0) {
        result.minutes = minutes;
    }

    if (seconds > 0) {
        result.seconds = seconds;
    }

    return result;
}
