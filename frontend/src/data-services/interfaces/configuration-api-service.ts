import { GetConfigurationResponse } from '../api-services/configuration/api-models';
import { ApiServiceResponse } from '../base-api-service';

export interface ConfigurationApiService {
    getConfiguration(): Promise<ApiServiceResponse<GetConfigurationResponse>>;
}
