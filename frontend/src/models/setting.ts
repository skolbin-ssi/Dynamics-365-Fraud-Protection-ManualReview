// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { SETTING_TYPE } from '../constants';
import { SettingDTO } from '../data-services/api-services/models';

export class Setting {
    id: string = '';

    type: SETTING_TYPE = SETTING_TYPE.REVIEW_CONSOLE_LINKS;

    template: string = '';

    fieldPath: string = '';

    name: string = '';

    fromDTO(setting: SettingDTO) {
        const {
            id,
            type,
            values
        } = setting;

        this.id = id;
        this.type = type;
        this.template = values.template;
        this.fieldPath = values.fieldPath;
        this.name = values.name;

        return this;
    }
}
