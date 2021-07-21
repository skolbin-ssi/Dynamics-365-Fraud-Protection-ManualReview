// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ANALYSIS_FIELDS } from '../../../constants/link-analysis';
import { FieldLinksDto } from '../../../data-services/api-services/models/item';

export class FieldLinks {
    id: ANALYSIS_FIELDS;

    value?: string;

    purchaseCounts: number;

    constructor(fieldLinksDto: FieldLinksDto) {
        const { id, value, purchaseCounts } = fieldLinksDto;

        this.id = id || null;
        this.value = value;
        this.purchaseCounts = purchaseCounts || 0;
    }
}
