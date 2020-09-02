import { ApiServiceResponse } from '../../base-api-service';
import { GetUserResponse } from '../../api-services/collected-info-api-service/analyst/api-models';
import { GetUsersResponse } from '../../api-services/user-api-service/api-models';
import {
    GetCollectedInfoQueueResponse,
    GetCollectedQueuesInfoResponse
} from '../../api-services/collected-info-api-service/collected-queue/api-models';

export interface CollectedInfoApiService {

    /**
     * Get collected analyst info by id
     */
    getAnalystCollectedInfo(id: string): Promise<ApiServiceResponse<GetUserResponse>>

    /**
     * Get collected queue info by id
     */
    getQueueCollectedInfo(id: string): Promise<ApiServiceResponse<GetCollectedInfoQueueResponse>>

    /**
     * Get collected queues info by all historical queues
     */
    getQueuesCollectedInfo(): Promise<ApiServiceResponse<GetCollectedQueuesInfoResponse>>

    /**
     * Get collect info by all users
     */
    getAnalystsCollectedInfo(): Promise<ApiServiceResponse<GetUsersResponse>>
}
