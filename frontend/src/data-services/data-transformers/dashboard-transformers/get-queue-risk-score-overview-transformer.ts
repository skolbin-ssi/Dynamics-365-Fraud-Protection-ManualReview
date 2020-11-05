// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { BaseDashboardTransformer } from './base-dashboard-transformer';
import { DataTransformer } from '../../data-transformer';
import { GetQueueRiskScoreOverviewResponse } from '../../api-services/dashboard-api-service/risk-score-overview/api-models';
import { QueueRiskScoreOverview } from '../../../models/dashboard';

export class GetQueueRiskScoreOverviewTransformer extends BaseDashboardTransformer implements DataTransformer {
    mapResponse(getQueueRiskScoreOverviewResponse: GetQueueRiskScoreOverviewResponse): QueueRiskScoreOverview {
        return new QueueRiskScoreOverview().fromDto(getQueueRiskScoreOverviewResponse);
    }
}
