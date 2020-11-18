// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * The Settings API for configuration of usage experience
 */
import { ApiServiceResponse } from '../../base-api-service';
import { SETTING_TYPE } from '../../../constants';
import { SettingDTO } from '../../api-services/models';
import { GetStaticFilterFieldsResponse } from '../../api-services/settings-api-service/api-models';

/**
 * The Settings API for configuration of usage experience
 */
export interface SettingsApiService {

    /**
     * Get all available static fields for filters
     */
    getStaticFilterFields(): Promise<ApiServiceResponse<GetStaticFilterFieldsResponse>>

    /**
     * Get all settings by specified type
     * @param type - type of required settings
     */
    getSettingValues(type: SETTING_TYPE): Promise<ApiServiceResponse<SettingDTO[]>>;
}
