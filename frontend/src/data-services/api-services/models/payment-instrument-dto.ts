// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AddressDTO } from './address-dto';

export interface PaymentInstrumentDTO {
    PurchaseAmount: number;
    MerchantPaymentInstrumentId: string;
    Type: string;
    /* string($date-time) */
    CreationDate: string;
    /* string($date-time) */
    UpdateDate: string;
    State: string;
    CardType: string;
    HolderName: string;
    BIN: string;
    ExpirationDate: string;
    LastFourDigits: string;
    Email: string;
    BillingAgreementId: string;
    PayerId: string;
    PayerStatus: string;
    AddressStatus: string;
    IMEI: string;
    BillingAddress: AddressDTO;
    /* string($date-time) */
    MerchantLocalDate: string;
    PaymentInstrumentId: string;
    PurchaseAmountInUSD: number;
}
