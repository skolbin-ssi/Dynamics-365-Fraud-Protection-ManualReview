import { DashboardRequestApiParams } from './dashboard-api-service';

import { QueueSizeHistory, ItemPlacementMetrics } from '../../models/dashboard/deman-supply';
import { ProgressPerformanceMetric } from '../../models/dashboard/progress-performance-metric';
import {
    AnalystPerformance,
    PerformanceMetrics,
    ProcessingTimeMetric,
    QueuePerformance
} from '../../models';

export interface DashboardService {
    /**
     * Returns demand supply metrics for list of queues
     * @param params
     */
    getItemPlacementMetrics(params: DashboardRequestApiParams): Promise<ItemPlacementMetrics[] | null>

    getItemPlacementMetricsOverall(params: DashboardRequestApiParams): Promise<ItemPlacementMetrics | null>

    getQueuesSizeHistory(params: DashboardRequestApiParams): Promise<QueueSizeHistory[] | null>

    getQueueSizeHistoryOverall(params: DashboardRequestApiParams): Promise<QueueSizeHistory | null>

    /**
     * Returns performance metrics for all queues
     * @param params - api params
     */
    getQueuesPerformance(params: DashboardRequestApiParams): Promise<QueuePerformance[] | null>

    /**
     * Returns performance metrics for a specific queue for all analysts
     * @param params - API endpoint params
     */
    getAnalystsPerformance(params: DashboardRequestApiParams): Promise<AnalystPerformance[] | null>

    /**
     * Returns total performance metrics for the specified queue or analyst
     * @param params -  API endpoint params
     */
    getTotalPerformanceMetrics(params: DashboardRequestApiParams): Promise<PerformanceMetrics | null>

    /**
     * Returns processing time performance metrics for specified queue of analyst
     * @param params - API endpoint params
     */
    getProcessingTimePerformanceMetrics(params: DashboardRequestApiParams): Promise<ProcessingTimeMetric | null>

    /**
     * Returns progress of total performance metrics
     * @param params
     */
    getProgressPerformanceMetric(params: DashboardRequestApiParams): Promise<ProgressPerformanceMetric | null>
}
