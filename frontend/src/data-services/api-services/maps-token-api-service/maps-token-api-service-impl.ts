// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../types';
import { AuthenticationService, Configuration } from '../../../utility-services';
import { BaseApiService } from '../../base-api-service';
import { GetMapsTokenResponse } from './api-models';
import { MapsTokenApiService } from '../../interfaces';

@injectable()
export class MapsTokenApiServiceImpl extends BaseApiService implements MapsTokenApiService {
    /**
     * @param config
     * @param authService
     */
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(`${config.apiBaseUrl}/maps`, {
            request: {
                onFulfilled: authService.apiRequestInterceptor.bind(authService)
            },
            response: {
                onRejection: authService.apiResponseInterceptor.bind(authService)
            }
        });
    }

    getMapsToken() {
        return this.get<GetMapsTokenResponse>('/token/read');
    }
}
