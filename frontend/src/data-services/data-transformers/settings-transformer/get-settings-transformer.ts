// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Setting } from '../../../models';
import { SettingDTO } from '../../api-services/models';
import { GetSettingValuesResponse } from '../../api-services/settings-api-service/api-models/get-setting-values-response';
import { DataTransformer } from '../../data-transformer';

export class GetSettingsTransformer implements DataTransformer {
    mapResponse(
        response: GetSettingValuesResponse
    ): Setting[] {
        return response.map(this.mapSetting.bind(this));
    }

    private mapSetting(setting: SettingDTO): Setting {
        const s = new Setting();
        return s.fromDTO(setting);
    }
}
