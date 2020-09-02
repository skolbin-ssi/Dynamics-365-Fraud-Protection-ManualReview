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
     * Ration between reviewed numbers to approved
     */
    approvedRatio: number,

    /**
     * Ration between reviewed numbers to watched
     */
    watchedRatio: number,

    /**
     * Ration between reviewed numbers to rejected
     */
    rejectedRatio: number

    /**
     * setIsChecked - indicates either this performance metric has been selected or not
     * @param isChecked
     */
    setIsChecked: (isChecked: boolean) => void;

    approvedApplied: number

    approvedOverturned: number

    approvedAccuracy: number

    rejectedApplied: number

    rejectedOverturned: number

    rejectedAccuracy: number

    accuracyAverage: number

    accuracyReport: {}

    totalReviewedEntityReport: {} | null

    entityPerformanceReport: {} | null
}
