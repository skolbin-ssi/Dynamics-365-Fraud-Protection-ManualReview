// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export function getQueueProcessingDeadline(nOfDays: number, nOfHours: number): string {
    return `P${+nOfDays}DT${nOfHours}H`;
}

export function getProcessingDeadlineValues(deadline: string): { days: number, hours: number } {
    const deadlineDaysMatch = deadline?.match(/\d+(?=D)/);
    const days = deadlineDaysMatch
        ? +deadlineDaysMatch[0]
        : 0;
    const deadlineHoursMatch = deadline?.match(/\d+(?=H)/);
    const hours = deadlineHoursMatch
        ? +deadlineHoursMatch[0]
        : 0;
    const fullDays = days + Math.floor(hours / 24);
    const lastingHours = hours % 24;
    return {
        days: fullDays,
        hours: lastingHours
    };
}
