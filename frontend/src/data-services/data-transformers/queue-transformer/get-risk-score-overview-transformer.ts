// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DataTransformer } from '../../data-transformer';
import { BaseQueueTransformer } from './base-queue-transformer';
import { GetRiskScoreOverviewResponse } from '../../api-services/queue-api-service/api-models';
import { RiskScoreOverview } from '../../../models/queues/risk-score-overview';

export class GetRiskScoreOverviewTransformer extends BaseQueueTransformer implements DataTransformer {
    mapResponse(getRiskScoreOverviewResponse: GetRiskScoreOverviewResponse): RiskScoreOverview {
        return new RiskScoreOverview().fromDto(getRiskScoreOverviewResponse);
    }
}
