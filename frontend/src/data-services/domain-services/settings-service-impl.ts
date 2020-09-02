import { inject, injectable } from 'inversify';
import { SETTING_TYPE } from '../../constants';
import { TYPES } from '../../types';
import { Logger } from '../../utility-services/logger';
import { BaseDomainService } from '../base-domain-service';
import { GetSettingsTransformer } from '../data-transformers/settings-transformer';
import { SettingsApiService, SettingsService } from '../interfaces';

@injectable()
export class SettingsServiceImpl extends BaseDomainService implements SettingsService {
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
}
