import { DataTransformer } from '../../data-transformer';
import { BaseDashboardTransformer } from './base-dashboard-transformer';
import { ProcessingTimeMetric } from '../../../models/dashboard';
import { GetProcessingTimeMetricResponse } from '../../api-services/dashboard-api-service/processing-time-metric/api-models';

export class GetProcessingTimeTransformer extends BaseDashboardTransformer implements DataTransformer {
    mapResponse(getProcessingTimeMetricResponse: GetProcessingTimeMetricResponse): ProcessingTimeMetric {
        const processingTimeMetric = new ProcessingTimeMetric();
        return processingTimeMetric.fromDto(getProcessingTimeMetricResponse);
    }
}
