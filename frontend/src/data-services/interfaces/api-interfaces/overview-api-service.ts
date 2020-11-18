// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ApiServiceResponse } from '../../base-api-service';
import { GetRiskScoreOverviewResponse } from '../../api-services/queue-api-service/api-models';
import { RiskScoreOverviewApiParams } from '../domain-interfaces/overview-service';

/**
 * API for retrieving overviews on queue micro service.
 */
export interface OverviewApiService {
    /**
     * Get queue items split by risk score
     * @param params
     */
    getRiskScoreOverview(params: RiskScoreOverviewApiParams): Promise<ApiServiceResponse<GetRiskScoreOverviewResponse>>;
}
