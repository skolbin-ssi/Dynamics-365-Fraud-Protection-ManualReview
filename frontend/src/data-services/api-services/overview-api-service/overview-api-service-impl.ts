// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject } from 'inversify';

import { BaseApiService } from '../../base-api-service';
import { TYPES } from '../../../types';
import { Configuration } from '../../../utility-services/configuration';
import { AuthenticationService } from '../../../utility-services';
import { OverviewApiService } from '../../interfaces/api-interfaces';
import { GetRiskScoreOverviewResponse } from '../queue-api-service/api-models';
import { RiskScoreOverviewApiParams } from '../../interfaces/domain-interfaces/overview-service';

export class OverviewApiServiceImpl extends BaseApiService implements OverviewApiService {
    /**
     * @param config
     * @param authService
     */
    constructor(
        @inject(TYPES.CONFIGURATION) private readonly config: Configuration,
        @inject(TYPES.AUTHENTICATION) private readonly authService: AuthenticationService
    ) {
        super(
            `${config.apiBaseUrl}/overview`,
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

    getRiskScoreOverview(params: RiskScoreOverviewApiParams) {
        return this.get<GetRiskScoreOverviewResponse>('/risk-score', { params });
    }
}
