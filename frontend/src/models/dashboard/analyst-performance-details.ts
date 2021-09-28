// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AnalystPerformanceDetailsDTO } from '../../data-services/api-services/models/dashboard';
import { LABEL } from '../../constants';

/**
 * AnalystPerformanceDetails - analyst performance details model
 */
export class AnalystPerformanceDetails {
    label!: LABEL;

    merchantRuleDecision!: string;

    id!: string;

    analystId!: string;

    public fromDto(entity: AnalystPerformanceDetailsDTO) {
        this.label = entity.label;
        this.merchantRuleDecision = entity.merchantRuleDecision;
        this.analystId = entity.analystId;
        // the id has the following format - GUID+UTC date. We need only the guid. Guid length is 36
        this.id = entity.id.substr(0, 36);

        return this;
    }
}
