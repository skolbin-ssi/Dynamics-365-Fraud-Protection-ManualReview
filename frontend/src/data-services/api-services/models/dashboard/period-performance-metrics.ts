import { PerformanceMetricsDTO } from './performance-metrics-dto';

export interface PeriodPerformanceMetrics {
    /**
     * key - date string
     */
    [key: string] : PerformanceMetricsDTO
}
