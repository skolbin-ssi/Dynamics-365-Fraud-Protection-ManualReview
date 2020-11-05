// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import moment from 'moment-timezone';

/**
 * @return - string of client time zone offset and time zone name
 * e.g. GMT+03:00 EEST (Europe/Kiev)
 */
export function getClientTimeZoneString(): string {
    const clientTimeZoneName = moment.tz.guess(true);
    const clientTimeZoneOffset = moment().tz(clientTimeZoneName).format('Z z');

    return `GMT${clientTimeZoneOffset} (${clientTimeZoneName})`;
}
