import { Queue } from '../../../models';
import { GetQueuesResponse } from '../../api-services/queue-api-service/api-models';
import { DataTransformer } from '../../data-transformer';
import { BaseQueueTransformer } from './base-queue-transformer';

export class GetQueuesTransformer extends BaseQueueTransformer implements DataTransformer {
    mapResponse(
        getQueuesResponse: GetQueuesResponse
    ): Queue[] {
        return getQueuesResponse.map(this.mapSingleQueue.bind(this));
    }
}
