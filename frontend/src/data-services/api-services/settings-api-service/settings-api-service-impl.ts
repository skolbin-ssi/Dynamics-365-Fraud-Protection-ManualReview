// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject } from 'inversify';

import { SETTING_TYPE } from '../../../constants';
import { TYPES } from '../../../types';
import { AuthenticationService } from '../../../utility-services';
import { Configuration } from '../../../utility-services/configuration';
import { BaseApiService } from '../../base-api-service';
import { SettingsApiService } from '../../interfaces';
import { GetStaticFilterFieldsResponse, GetSettingValuesResponse } from './api-models';

export class SettingsApiServiceImpl extends BaseApiService implements SettingsApiService {
    /**
     * @param config
     * @param authService
     */
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(
            `${config.apiBaseUrl}/settings`,
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

    getSettingValues(type: SETTING_TYPE) {
        return this.get<GetSettingValuesResponse>(`/${type}`);
    }

    getStaticFilterFields() {
        return this.get<GetStaticFilterFieldsResponse>('/static/filter-fields');
    }
}
