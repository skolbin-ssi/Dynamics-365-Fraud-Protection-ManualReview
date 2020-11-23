// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { FieldLinksDto } from '../../../data-services/api-services/models/item';
import { ANALYSIS_FIELDS } from '../../../constants/link-analysis';

export class FieldLinks {
    id: ANALYSIS_FIELDS;

    value?: string;

    purchaseCounts: number;

    constructor(fieldLinksDto: FieldLinksDto) {
        const { id, value, purchaseCounts } = fieldLinksDto;

        this.id = id || '';
        this.value = value;
        this.purchaseCounts = purchaseCounts || 0;
    }
}
