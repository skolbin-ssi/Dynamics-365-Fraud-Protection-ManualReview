import { TimeMetricDto } from './time-metric-dto';

/**
 * ProcessingTimeMetricDto - Model, represents processing time performance metrics
 */
export interface ProcessingTimeMetricDto {
    currentPeriod: TimeMetricDto;
    previousPeriod: TimeMetricDto;

}
