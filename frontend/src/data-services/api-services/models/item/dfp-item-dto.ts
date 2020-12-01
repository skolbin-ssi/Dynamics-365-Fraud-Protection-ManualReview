// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DeviceContextDTO } from '../device-context-dto';

export interface DfpItemDto {
    purchaseId: string;
    merchantLocalDate: string;
    totalAmount: number;
    totalAmountInUSD: number;
    salesTax: number;
    salesTaxInUSD: number;
    currency: string;
    riskScore: number;
    merchantRuleDecision: string;
    reasonCodes: string;
    user: {
        email:string,
        userIs: string;
    };
    deviceContext: DeviceContextDTO;
    userRestricted: boolean;
}
