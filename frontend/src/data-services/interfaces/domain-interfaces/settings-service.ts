// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { SETTING_TYPE } from '../../../constants';
import { Setting } from '../../../models';
import { FilterFieldDto } from '../../api-services/models/settings';
import { FilterField } from '../../../models/filter/filter-field';

export interface SettingsService {
    /**
     * Get settings by type
     * @param type
     */
    getSettings(type: SETTING_TYPE): Promise<Setting[]>

    /**
     * Get all available static filter fields settings
     * and cache them
     */
    getStaticFilterFieldsSettingsAndCache(): Promise<FilterFieldDto[] | null>

    /**
     * Get all available new Filter fields models
     */
    getFilters(): FilterField[];
}
