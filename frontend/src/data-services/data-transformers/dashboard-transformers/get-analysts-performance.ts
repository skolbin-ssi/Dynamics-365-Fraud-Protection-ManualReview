// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { BaseDashboardTransformer } from './base-dashboard-transformer';
import { DataTransformer } from '../../data-transformer';
import { AnalystPerformance } from '../../../models/dashboard';
import { GetAnalystsPerformanceResponse } from '../../api-services/dashboard-api-service/analyst/api-models';
import { CollectedInfoService, UserService } from '../../interfaces';
import { AnalystPerformanceDTO } from '../../api-services/models/dashboard/analyst';
import { UserBuilder } from '../../../utility-services';

export class GetAnalystsPerformanceTransformer extends BaseDashboardTransformer implements DataTransformer {
    constructor(
        private readonly collectedInfoService: CollectedInfoService,
        private readonly userBuilder: UserBuilder,
        private readonly userService: UserService
    ) {
        super();
    }

    mapResponse(
        getAnalystsPerformanceResponse: GetAnalystsPerformanceResponse
    ): AnalystPerformance[] {
        return getAnalystsPerformanceResponse.map(analyst => this.mapAnalystModel(analyst));
    }

    private mapAnalystModel(analystDTO: AnalystPerformanceDTO) {
        const analystModel = new AnalystPerformance().fromDto(analystDTO);
        const user = this.userBuilder.buildById(analystDTO.id);

        if (user) {
            analystModel.setName(user.name);
            analystModel.populateUser(user);
            return analystModel;
        }

        this.collectedInfoService.getHistoricalUser(analystDTO.id)
            .then(historicUser => {
                this.userService.getUserPhoto(historicUser?.id || '')
                    .then(imageUrl => {
                        if (historicUser) {
                            historicUser.setImageUrl(imageUrl);
                        }
                    });

                analystModel.setName(historicUser?.name || '');
                analystModel.populateUser(historicUser);
            });

        return analystModel;
    }
}
