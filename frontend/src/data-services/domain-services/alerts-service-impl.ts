// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { Alert } from '../../models';
import { TYPES } from '../../types';
import { Logger } from '../../utility-services/logger';
import { BaseDomainService } from '../base-domain-service';
import {
    DeleteAlertsTransformer,
    GetAlertsTransformer,
    PostAlertsTransformer,
    PutAlertsTransformer
} from '../data-transformers/alert-transformer';
import { AlertsApiService, UserService } from '../interfaces';
import { AlertsService } from '../interfaces/alerts-service';

@injectable()
export class AlertsServiceImpl extends BaseDomainService implements AlertsService {
    constructor(
        @inject(TYPES.ALERTS_API_SERVICE) private readonly alertsApiService: AlertsApiService,
        @inject(TYPES.USER_SERVICE) private readonly userService: UserService,
        @inject(TYPES.LOGGER) protected readonly logger: Logger
    ) {
        super(logger, 'AlertsService');
    }

    async getAlerts() {
        const dataTransformer = new GetAlertsTransformer();
        let response;

        try {
            response = await this.alertsApiService.getAlerts();
        } catch (e) {
            throw this.handleApiException('getAlerts', e, {
                500: 'Failed to get alerts from the Api due to internal server error'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data) as Alert[];
            } catch (e) {
                throw this.handleException(
                    'getAlerts',
                    'Failed to parse response from API while retrieving alerts',
                    e
                );
            }
        }

        return [] as Alert[];
    }

    async createAlert(alert: Alert) {
        const dataTransformer = new PostAlertsTransformer();
        let response;

        try {
            const alertToCreate = dataTransformer.mapRequest(alert);
            response = await this.alertsApiService.postAlert(alertToCreate);
        } catch (e) {
            throw this.handleApiException('createAlert', e, {
                500: 'Failed to create alert from the Api due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'getAlerts',
                'Failed to parse response from API while creating alert',
                e
            );
        }
    }

    async updateAlert(alert: Alert) {
        const dataTransformer = new PutAlertsTransformer();
        let response;

        try {
            const alertToUpdate = dataTransformer.mapRequest(alert);
            response = await this.alertsApiService.putAlert(alert.id, alertToUpdate);
        } catch (e) {
            throw this.handleApiException('updateAlert', e, {
                500: 'Failed to updating alert from the Api due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'getAlerts',
                'Failed to parse response from API while updating alert',
                e
            );
        }
    }

    async deleteAlert(alert: Alert) {
        const dataTransformer = new DeleteAlertsTransformer();
        let response;

        try {
            response = await this.alertsApiService.deleteAlert(alert.id);
        } catch (e) {
            throw this.handleApiException('updateAlert', e, {
                500: 'Failed to delete alert from the Api due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'getAlerts',
                'Failed to parse response from API while deleting alert',
                e
            );
        }
    }
}
