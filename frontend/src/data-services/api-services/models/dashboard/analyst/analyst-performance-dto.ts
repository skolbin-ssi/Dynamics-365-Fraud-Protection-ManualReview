// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { PerformanceMetricsDTO } from '../performance-metrics-dto';
import { PeriodPerformanceMetrics } from '../period-performance-metrics';

export interface AnalystPerformanceDTO {

    /**
     * id - analyst id
     */
    id: string,

    /**
     * data - aggregated performance metrics by dates
     */
    data: PeriodPerformanceMetrics;

    /**
     * total -  total aggregated performance metrics for analyst
     */
    total: PerformanceMetricsDTO;
}
