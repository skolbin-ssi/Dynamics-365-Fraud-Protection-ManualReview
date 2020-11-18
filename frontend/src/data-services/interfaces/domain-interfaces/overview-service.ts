// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { RiskScoreOverview } from '../../../models/queues/risk-score-overview';

export interface RiskScoreOverviewApiParams {
    /**
     * bucketSize - size of the risk score buckets,
     * distributes queue items by a risk score
     *
     * e.g.: bucketSize = 100 then the items will be distributed by the risk score
     * as for example: 0, 5, 10,... ets, till the maximum risk score
     * defined by the queue itself risk score filter
     */
    bucketSize: number;

    /**
     * queueId - id of the queue
     */
    queueId?: string;
}

export interface OverviewService {
    /**
     * Get queue items split by risk score
     * @param params
     */
    getRiskScoreOverview(params: RiskScoreOverviewApiParams): Promise<RiskScoreOverview>;
}
