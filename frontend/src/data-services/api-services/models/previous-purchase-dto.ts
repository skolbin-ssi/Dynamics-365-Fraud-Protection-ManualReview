// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface PreviousPurchaseDTO {
    PurchaseId: string;
    AssessmentType: string;
    OriginalOrderId: string;
    CustomerLocalDate: string;
    MerchantLocalDate: string;
    TotalAmount: number;
    TotalAmountInUSD: number;
    SalesTax: number;
    SalesTaxInUSD: number;
    Currency: string;
    CurrencyConversionFactor: number;
    ShippingMethod: string;
    BankName: string;
    HashedEvaluationId: string;
    RiskScore: number;
    ReasonCodes: string;
    PolicyApplied: string;
}
