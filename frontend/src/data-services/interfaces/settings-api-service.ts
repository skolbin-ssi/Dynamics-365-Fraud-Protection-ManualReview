import { SETTING_TYPE } from '../../constants';
import { SettingDTO } from '../api-services/models';
import { ApiServiceResponse } from '../base-api-service';

export interface SettingsApiService {
    getSettingValues(type: SETTING_TYPE): Promise<ApiServiceResponse<SettingDTO[]>>;
}
