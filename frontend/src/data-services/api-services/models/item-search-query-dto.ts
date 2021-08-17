// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ITEM_SORTING_FIELD, LABEL, SORTING_ORDER } from '../../../constants';
import { FilterConditionDto } from './settings/filter-condition-dto';

export interface ItemSortSettingsDTO {
    order: SORTING_ORDER;
    field: ITEM_SORTING_FIELD;
}
export interface ItemSearchQueryDTO {
    ids?: string[];
    originalOrderIds?: string[];
    active?: boolean;
    queueIds?: string[];
    residual?: boolean;
    itemFilters?: FilterConditionDto[];
    lockOwnerIds?: string[];
    holdOwnerIds?: string[];
    labels?: LABEL[];
    tags?: string[];
    labelAuthorIds?: string[];
}
