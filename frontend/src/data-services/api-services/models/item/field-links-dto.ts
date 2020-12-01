// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ANALYSIS_FIELDS } from '../../../../constants/link-analysis';

export interface FieldLinksDto {
    id: ANALYSIS_FIELDS;
    value: string;
    purchaseCounts: number;
}
