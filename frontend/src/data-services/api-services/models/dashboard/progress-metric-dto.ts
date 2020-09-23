// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { PerformanceMetricsDTO } from './performance-metrics-dto';

/**
 * ProgressMetricDto - Model, represents progress of total performance metrics
 */
export interface ProgressMetricDto {
    currentPeriod: PerformanceMetricsDTO;
    previousPeriod: PerformanceMetricsDTO;
    annualIncludingPeriod: PerformanceMetricsDTO;
    annualBeforePeriod: PerformanceMetricsDTO;
}
