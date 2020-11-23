// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ItemDTO } from '../item-dto';

export interface LinkAnalysisMrItemDto {
    item: ItemDTO;
    availableForLabeling: boolean;
    userRestricted: boolean
}
