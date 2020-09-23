// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { SORTING_FIELD, SORTING_ORDER } from '../../../constants';

export interface QueueSortingSettingsDTO {
    order: SORTING_ORDER;
    field: SORTING_FIELD;
    locked: boolean;
}
