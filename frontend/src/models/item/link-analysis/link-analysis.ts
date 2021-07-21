// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ANALYSIS_FIELDS } from '../../../constants/link-analysis';
import { LinkAnalysisDto } from '../../../data-services/api-services/models/item';
import { FieldLinks } from './field-links';

export class LinkAnalysis {
    id: ANALYSIS_FIELDS;

    found: number;

    foundInMR: number;

    analysisFields: ANALYSIS_FIELDS[];

    fields: FieldLinks[];

    constructor(linkAnalysisDto: LinkAnalysisDto) {
        const {
            id, analysisFields, fields, found, foundInMR
        } = linkAnalysisDto;

        this.id = id || null;
        this.found = found || 0;
        this.foundInMR = foundInMR || 0;
        this.analysisFields = analysisFields || [];
        this.fields = fields ? fields.map(fieldLinksDto => new FieldLinks(fieldLinksDto)) : [];
    }
}
