import { Queue } from '../../../models';
import { GetQueueResponse } from '../../api-services/queue-api-service/api-models';
import { DataTransformer } from '../../data-transformer';
import { BaseQueueTransformer } from './base-queue-transformer';

export class GetQueueTransformer extends BaseQueueTransformer implements DataTransformer {
    mapResponse(
        getQueueResponse: GetQueueResponse
    ): Queue {
        return this.mapSingleQueue(getQueueResponse);
    }
}
