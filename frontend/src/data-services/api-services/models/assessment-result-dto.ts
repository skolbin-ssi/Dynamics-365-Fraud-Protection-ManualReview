// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { PurchaseStatusDTO } from './purchase-status-dto';

export interface AssessmentResultDTO {
    MerchantRuleDecision: string;
    MIDFlag: string;
    PolicyApplied: string;
    PurchaseStatusList: PurchaseStatusDTO[];
    ReasonCodes: string;
    RiskScore: number;
}
