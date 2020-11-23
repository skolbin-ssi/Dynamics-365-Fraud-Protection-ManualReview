// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AddressDTO } from './address-dto';
import { DeviceContextDTO } from './device-context-dto';
import { PaymentInstrumentDTO } from './payment-instrument-dto';

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
    LastMerchantStatus: string;
    LastMerchantStatusReason: string;
    /* string($date-time) */
    LastMerchantStatusDate: string;
    LastBankEventStatus: string;
    LastBankEventResponseCode: string;
    /* string($date-time) */
    LastBankEventDate: string;
    AddressList: AddressDTO[];
    DeviceContext: DeviceContextDTO;
    PaymentInstrumentList: PaymentInstrumentDTO[];
}
