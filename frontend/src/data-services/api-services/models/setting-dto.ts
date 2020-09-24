// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { SETTING_TYPE } from '../../../constants';

export interface SettingValueDTO {
    template: string;
    fieldPath: string;
    name: string;
}

export interface SettingDTO {
    id: string;
    type: SETTING_TYPE;
    values: SettingValueDTO;
}
