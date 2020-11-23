// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ANALYSIS_FIELDS } from '../../../../constants/link-analysis';
import { FieldLinksDto } from './field-links-dto';

export interface LinkAnalysisDto {
    id: ANALYSIS_FIELDS;
    found: number;
    foundInMR: number;
    analysisFields: ANALYSIS_FIELDS[]
    fields: FieldLinksDto[]
}
