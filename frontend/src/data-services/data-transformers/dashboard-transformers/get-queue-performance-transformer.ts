import { DataTransformer } from '../../data-transformer';
import { BaseDashboardTransformer } from './base-dashboard-transformer';
import { GetQueuesPerformanceResponse } from '../../api-services/dashboard-api-service/queues/api-models';
import { QueuePerformance } from '../../../models/dashboard';

export class GetQueuePerformanceTransformer extends BaseDashboardTransformer implements DataTransformer {
    mapResponse(
        getQueuesPerformanceResponse: GetQueuesPerformanceResponse
    ): QueuePerformance[] {
        return getQueuesPerformanceResponse.map(queue => new QueuePerformance().fromDto(queue));
    }
}
