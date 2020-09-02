import { BaseQueueTransformer } from './base-queue-transformer';
import { DataTransformer } from '../../data-transformer';
import { QueuesOverview, OverviewItem } from '../../../models/queues';
import { GetQueuesOverviewResponse } from '../../api-services/queue-api-service/api-models';

export class GetQueuesOverviewTransformer extends BaseQueueTransformer implements DataTransformer {
    mapResponse(getQueuesOverviewResponse: GetQueuesOverviewResponse): QueuesOverview {
        return this.mapData(getQueuesOverviewResponse);
    }

    private mapData(getQueuesOverviewResponse: GetQueuesOverviewResponse): QueuesOverview {
        const queuesOverview = new Map<string, OverviewItem>();

        Object.entries(getQueuesOverviewResponse).forEach(([queueId, data]) => {
            if (queueId && data) {
                queuesOverview.set(queueId, data);
            }
        });

        return queuesOverview;
    }
}
