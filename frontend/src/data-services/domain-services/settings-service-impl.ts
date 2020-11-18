// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';

import { SETTING_TYPE } from '../../constants';
import { TYPES } from '../../types';
import { Logger } from '../../utility-services/logger';
import { BaseDomainService } from '../base-domain-service';
import {
    GetSettingsTransformer,
    GetFilterFieldTransformer
} from '../data-transformers/settings-transformer';
import { SettingsApiService, SettingsService } from '../interfaces';
import { FilterFieldDto } from '../api-services/models/settings';
import { GetStaticFilterFieldsResponse } from '../api-services/settings-api-service/api-models';

@injectable()
export class SettingsServiceImpl extends BaseDomainService implements SettingsService {
    /**
     * In-memory cache for static filter fields
     */
    private staticFiltersFieldsCache: FilterFieldDto[] = [];

    constructor(
        @inject(TYPES.SETTINGS_API_SERVICE) private readonly settingsApiService: SettingsApiService,
        @inject(TYPES.LOGGER) protected readonly logger: Logger
    ) {
        super(logger, 'SettingsService');
    }

    async getSettings(type: SETTING_TYPE) {
        const dataTransformer = new GetSettingsTransformer();

        let response;

        try {
            response = await this.settingsApiService.getSettingValues(type);
        } catch (e) {
            throw this.handleApiException('getSettings', e, {
                500: 'Failed to get settings from the Api due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'getSettings',
                'Failed to parse response from API while getting settings list',
                e
            );
        }
    }

    async getStaticFilterFieldsSettingsAndCache() {
        try {
            const response = await this.settingsApiService.getStaticFilterFields();
            this.cacheStaticFiltersFieldsSettingsResponse(response.data);

            return response.data;
        } catch (e) {
            throw this.handleApiException('getStaticFilterFields', e, {
                500: 'Failed to get filter fields from the Api due to internal server error'
            });
        }
    }

    /**
     * Returns new Filter Fields models created from cached filters fields settings config
     *
     * Each time we need filters, we need to fill that object with appropriate conditions and
     * set additional values, (modify that object). Sine mob-x doesn't support immutable data structures
     * when modifying the object keeps the reference to the original, and we can't copy of existing
     * cached observable model, that's why we need to creat a new model each time in order to modify it.
     */
    getFilters() {
        const dataTransformer = new GetFilterFieldTransformer();

        try {
            return dataTransformer.mapResponse(this.staticFiltersFieldsCache);
        } catch (e) {
            throw this.handleException(
                'getFilters',
                'Failed to parse response from API while getting filter fields list',
                e
            );
        }
    }

    /**
     * Cache filters settings response
     *
     * @param filterFieldsResponse
     */
    private cacheStaticFiltersFieldsSettingsResponse(filterFieldsResponse: GetStaticFilterFieldsResponse) {
        this.staticFiltersFieldsCache = [...filterFieldsResponse];
    }
}
