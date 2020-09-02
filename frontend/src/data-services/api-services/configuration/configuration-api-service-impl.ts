import { BaseApiService } from '../../base-api-service';
import { ConfigurationApiService } from '../../interfaces';
import { GetConfigurationResponse } from './api-models';

export class ConfigurationApiServiceImpl extends BaseApiService implements ConfigurationApiService {
    constructor() {
        super('/');
    }

    async getConfiguration() {
        return this.get<GetConfigurationResponse>('config.json');
    }
}
