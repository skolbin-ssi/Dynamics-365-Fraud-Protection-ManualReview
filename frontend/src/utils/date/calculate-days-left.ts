// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { getCurrentTimeDiff } from './get-current-time-diff';
import { getProcessingDeadlineValues } from './duration-parcers';

export function calculateDaysLeft(importDate: Date, processingDeadline: string): number {
    const { days: currentDiffDays } = getCurrentTimeDiff(importDate);
    const { days: processingDeadlineDays } = getProcessingDeadlineValues(processingDeadline);

    return processingDeadlineDays - currentDiffDays;
}
