// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ACCEPTABLE_CONDITIONS } from '../../../../constants';

export interface FilterConditionDto {
    /**
     * condition - ACCEPTABLE_CONDITIONS
     */
    condition: ACCEPTABLE_CONDITIONS;

    /**
     * field - filter id
     */
    field: string

    /**
     * values - condition values
     */
    values: string[]
}
