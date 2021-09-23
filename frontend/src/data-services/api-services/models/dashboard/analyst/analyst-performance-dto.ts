// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AnalystPerformanceDetailsDTO } from './analyst-performance-details-dto';
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
     * details - all orders and decisions for that analyst - not aggregated
     */
    details: AnalystPerformanceDetailsDTO[];

    /**
     * total -  total aggregated performance metrics for analyst
     */
    total: PerformanceMetricsDTO;
}
