// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject } from 'inversify';

import { OverviewApiService } from '../interfaces';
import { GetRiskScoreOverviewTransformer } from '../data-transformers/queue-transformer';
import { OverviewService, RiskScoreOverviewApiParams } from '../interfaces/domain-interfaces/overview-service';

import { TYPES } from '../../types';
import { Logger } from '../../utility-services/logger';
import { BaseDomainService } from '../base-domain-service';
import { FiltersBuilder, UserBuilder } from '../../utility-services';

export class OverviewServiceImpl extends BaseDomainService implements OverviewService {
    constructor(
        @inject(TYPES.OVERVIEW_API_SERVICE) private readonly overviewApiService: OverviewApiService,
        @inject(TYPES.USER_BUILDER) protected readonly userBuilder: UserBuilder,
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
        @inject(TYPES.FILTERS_BUILDER) protected readonly filtersBuilder: FiltersBuilder,
    ) {
        super(logger, 'OverviewService');
    }

    async getRiskScoreOverview(params: RiskScoreOverviewApiParams) {
        const dataTransformer = new GetRiskScoreOverviewTransformer(this.userBuilder, this.filtersBuilder);
        let response;

        try {
            response = await this.overviewApiService.getRiskScoreOverview(params);
        } catch (e) {
            throw this.handleApiException('getRiskScoreOverview', e, {
                500: 'Failed to get risk score distribution overview from the Api due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'getRiskScoreOverview',
                'Failed to parse response from API while getting get risk score distribution overview',
                e
            );
        }
    }
}
