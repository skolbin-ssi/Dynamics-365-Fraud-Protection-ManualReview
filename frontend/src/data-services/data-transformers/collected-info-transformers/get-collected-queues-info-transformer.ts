import { BaseCollectedInfoTransformer } from './base-collected-info-transformer';
import { DataTransformer } from '../../data-transformer';
import {
    GetCollectedQueuesInfoResponse
} from '../../api-services/collected-info-api-service/collected-queue/api-models';
import { Queue } from '../../../models';

export class GetCollectedQueuesInfoTransformer extends BaseCollectedInfoTransformer implements DataTransformer {
    mapResponse(getCollectedQueuesInfoResponse: GetCollectedQueuesInfoResponse): Queue[] {
        return getCollectedQueuesInfoResponse.map(this.mapSingleCollectedQueueInfo.bind(this));
    }
}
