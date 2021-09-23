// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LABEL } from '../../../../../constants';

export interface AnalystPerformanceDetailsDTO {
    label: LABEL;
    merchantRuleDecision: string;
    id: string;
    analystId: string;
}
