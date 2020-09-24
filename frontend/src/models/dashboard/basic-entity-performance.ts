// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { PerformanceMetrics } from './performance-metrics';

import { PeriodPerformanceMetrics } from '../../data-services/api-services/models/dashboard';

/**
 * Basic model (interface) for entity performance
 */
export interface BasicEntityPerformance {
    /**
     * id - entity id
     */
    id: string;

    /**
     * name - entity name
     */
    name: string;

    /**
     * data - entity performance metrics
     */
    data: PeriodPerformanceMetrics;

    /**
     * total - total (aggregated) performance for an entity
     */
    total: PerformanceMetrics;

    /**
     * color - calculated color for an entity (for charts display)
     */
    color: string,

    /**
     * isChecked - indicates whether an entity has been checked and
     * its statistics should be displayed in the chart
     */
    isChecked: boolean,

    /**
     * Ratio of good decisions to all reviewed items
     */
    goodDecisionsRatio: number,

    /**
     * Ratio of watch decisions to all reviewed items
     */
    watchDecisionsRatio: number,

    /**
     * Ratio of bad decisions to all reviewed items
     */
    badDecisionsRatio: number

    /**
     * setIsChecked - indicates either this performance metric has been selected or not
     * @param isChecked
     */
    setIsChecked: (isChecked: boolean) => void;

    goodApplied: number

    goodOverturned: number

    goodOverturnRate: number

    badApplied: number

    badOverturned: number

    badOverturnRate: number

    averageOverturnRate: number

    accuracyReport: {}

    totalReviewedEntityReport: {} | null

    entityPerformanceReport: {} | null
}
