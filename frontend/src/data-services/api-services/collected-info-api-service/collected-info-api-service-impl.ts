import { inject } from 'inversify';

import { BaseApiService } from '../../base-api-service';
import { CollectedInfoApiService } from '../../interfaces';
import { TYPES } from '../../../types';
import { Configuration } from '../../../utility-services/configuration';
import { AuthenticationService } from '../../../utility-services';
import { GetUserResponse } from './analyst/api-models';
import { GetUsersResponse } from '../user-api-service/api-models';
import { GetCollectedInfoQueueResponse, GetCollectedQueuesInfoResponse } from './collected-queue/api-models';

export class CollectedInfoApiServiceImpl extends BaseApiService implements CollectedInfoApiService {
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(
            `${config.apiBaseUrl}/collected-info`,
            {
                request: {
                    onFulfilled: authService.apiRequestInterceptor.bind(authService)
                },
                response: {
                    onRejection: authService.apiResponseInterceptor.bind(authService)
                }
            }
        );
    }

    getAnalystCollectedInfo(id: string) {
        return this.get<GetUserResponse>(`/analysts/${id}`);
    }

    getQueueCollectedInfo(id: string) {
        return this.get<GetCollectedInfoQueueResponse>(`/queues/${id}`);
    }

    getQueuesCollectedInfo() {
        return this.get<GetCollectedQueuesInfoResponse>('queues');
    }

    getAnalystsCollectedInfo() {
        return this.get<GetUsersResponse>('analysts');
    }
}
