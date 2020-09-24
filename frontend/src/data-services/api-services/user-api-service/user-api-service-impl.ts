// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../types';
import { AuthenticationService, Configuration } from '../../../utility-services';
import { BaseApiService } from '../../base-api-service';
import { GetCurrentUserResponse, GetUserPhotoResponse, GetUsersResponse } from './api-models';
import { UserApiService } from '../../interfaces/user-api-service';

@injectable()
export class UserApiServiceImpl extends BaseApiService implements UserApiService {
    /**
     * @param config
     * @param authService
     */
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(`${config.apiBaseUrl}/users`, {
            request: {
                onFulfilled: authService.apiRequestInterceptor.bind(authService)
            },
            response: {
                onRejection: authService.apiResponseInterceptor.bind(authService)
            }
        });
    }

    getUsers() {
        return this.get<GetUsersResponse>('');
    }

    getUserPhoto(userId: string) {
        return this.get<GetUserPhotoResponse>(`/${userId}/photo`, { responseType: 'arraybuffer' });
    }

    loadCurrentUser() {
        return this.get<GetCurrentUserResponse>('/me');
    }
}
