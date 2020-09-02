import { PerformanceMetricsDTO } from '../performance-metrics-dto';
import { PeriodPerformanceMetrics } from '../period-performance-metrics';

/**
 * QueuePerformanceDTO - DTO queue performance model from API
 */
export interface QueuePerformanceDTO {
    /**
     * id - queue id
     */
    id: string,

    /**
     * name - queue name
     */
    name: string,

    /**
     * data - aggregated performance metrics by dates
     */
    data: PeriodPerformanceMetrics;

    /**
     * total - total (aggregated) performance for a queue
     */
    total: PerformanceMetricsDTO
}
