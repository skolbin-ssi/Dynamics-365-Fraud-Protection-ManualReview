// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AddressDTO } from './address-dto';
import { DeviceContextDTO } from './device-context-dto';
import { PaymentInstrumentDTO } from './payment-instrument-dto';
import { PreviousPurchaseDTO } from './previous-purchase-dto';
import { ProductDTO } from './product-dto';
import { PurchaseUserDTO } from './user-dto';
import { BankEventDTO } from './bank-event-dto';
import { CalculatedFieldsDTO } from './calculated-fields-dto';

export interface PurchaseDTO {
    PurchaseId: string;
    AssessmentType: string;
    OriginalOrderId: string;
    /* string($date-time) */
    CustomerLocalDate: string;
    /* string($date-time) */
    MerchantLocalDate: string;
    TotalAmount: number;
    SalesTax: number;
    Currency: string;
    ShippingMethod: string;
    User: PurchaseUserDTO;
    DeviceContext: DeviceContextDTO;
    PaymentInstrumentList: PaymentInstrumentDTO[];
    ProductList: ProductDTO[];
    AdditionalInfo: any;
    AddressList: AddressDTO[];
    BankEventsList: BankEventDTO[];
    CurrencyConversionFactor: number;
    CustomData: Record<string, string>;
    SalesTaxInUSD: number;
    TotalAmountInUSD: number;
    PreviousPurchaseList: PreviousPurchaseDTO[];
    CalculatedFields: CalculatedFieldsDTO;
}
