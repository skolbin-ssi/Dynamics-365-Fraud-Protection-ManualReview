// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed, observable } from 'mobx';

import { RiskScoreOverview } from '../../models/queues/risk-score-overview';
import { DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE } from '../../constants';
import { OverviewService } from '../../data-services/interfaces/domain-interfaces/overview-service';

export class FraudScoreDistributionStore {
    @observable
    riskScoreOverview: RiskScoreOverview | null = null;

    @observable
    isScoreDistributionLoading = false;

    constructor(
        private readonly overviewService: OverviewService
    ) {}

    @action
    async fetchRiskScoreOverview(queueId: string) {
        this.isScoreDistributionLoading = true;

        try {
            this.riskScoreOverview = await this.overviewService
                .getRiskScoreOverview(
                    { bucketSize: DEFAULT_RISK_SCORE_DISTRIBUTION_BUCKET_SIZE, queueId }
                );

            this.isScoreDistributionLoading = false;
        } catch (e) {
            this.isScoreDistributionLoading = false;

            throw e;
        }
    }

    @computed
    get pieChartData() {
        if (this.riskScoreOverview) {
            return this.riskScoreOverview.pieChartData;
        }

        return [];
    }

    @computed
    get riskScoreGroups() {
        if (this.riskScoreOverview) {
            return this.riskScoreOverview.riskScoreGroups;
        }

        return null;
    }
}
