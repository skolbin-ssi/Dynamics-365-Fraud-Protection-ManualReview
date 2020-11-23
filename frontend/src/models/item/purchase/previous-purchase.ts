// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Address } from './address';
import { DeviceContext } from './device-context';
import { PreviousPurchaseDTO } from '../../../data-services/api-services/models/previous-purchase-dto';
import { PaymentInstrument } from './payment-instrument';

export class PreviousPurchase {
    purchaseId: string = '';

    assessmentType: string = '';

    originalOrderId: string = '';

    customerLocalDate: string = '';

    // transaction date
    merchantLocalDate: string = '';

    totalAmount: number = 0;

    totalAmountInUSD: number = 0;

    salesTax: number = 0;

    salesTaxInUSD: number = 0;

    currency: string = '';

    currencyConversionFactor: number = 0;

    shippingMethod: string = '';

    bankName: string = '';

    hashedEvaluationId: string = '';

    riskScore: number = 0;

    reasonCodes: string = '';

    policyApplied: string = '';

    type: string = 'Purchase';

    lastMerchantStatus: string = '';

    lastMerchantStatusReason: string = '';

    lastMerchantStatusDate: string = '';

    lastBankEventStatus: string = '';

    lastBankEventResponseCode: string = '';

    lastBankEventDate: string = '';

    addressList: Address[] = [];

    deviceContext: DeviceContext = new DeviceContext();

    paymentInstrumentList: PaymentInstrument[] = [];

    fromDTO(pp: PreviousPurchaseDTO) {
        const {
            PurchaseId,
            AssessmentType,
            OriginalOrderId,
            CustomerLocalDate,
            MerchantLocalDate,
            TotalAmount,
            TotalAmountInUSD,
            SalesTax,
            SalesTaxInUSD,
            Currency,
            CurrencyConversionFactor,
            ShippingMethod,
            BankName,
            HashedEvaluationId,
            RiskScore,
            ReasonCodes,
            PolicyApplied,
            LastMerchantStatus,
            LastMerchantStatusReason,
            LastMerchantStatusDate,
            LastBankEventStatus,
            LastBankEventResponseCode,
            LastBankEventDate,
            AddressList,
            DeviceContext: deviceContext,
            PaymentInstrumentList
        } = pp;

        this.purchaseId = PurchaseId;
        this.assessmentType = AssessmentType;
        this.originalOrderId = OriginalOrderId;
        this.customerLocalDate = CustomerLocalDate;
        this.merchantLocalDate = MerchantLocalDate;
        this.totalAmount = TotalAmount;
        this.totalAmountInUSD = TotalAmountInUSD;
        this.salesTax = SalesTax;
        this.salesTaxInUSD = SalesTaxInUSD;
        this.currency = Currency;
        this.currencyConversionFactor = CurrencyConversionFactor;
        this.shippingMethod = ShippingMethod;
        this.bankName = BankName;
        this.hashedEvaluationId = HashedEvaluationId;
        this.riskScore = RiskScore;
        this.reasonCodes = ReasonCodes;
        this.policyApplied = PolicyApplied;
        this.lastMerchantStatus = LastMerchantStatus;
        this.lastMerchantStatusReason = LastMerchantStatusReason;
        this.lastMerchantStatusDate = LastMerchantStatusDate;
        this.lastBankEventStatus = LastBankEventStatus;
        this.lastBankEventResponseCode = LastBankEventResponseCode;
        this.lastBankEventDate = LastBankEventDate;

        if (deviceContext) {
            this.deviceContext.fromDTO(deviceContext);
        }

        if (Array.isArray(AddressList)) {
            this.addressList = AddressList.map<Address>(address => {
                const addressModel = new Address();
                return addressModel.fromDTO(address);
            });
        }

        if (Array.isArray(PaymentInstrumentList)) {
            this.paymentInstrumentList = PaymentInstrumentList.map<PaymentInstrument>(pi => {
                const piModel = new PaymentInstrument();
                return piModel.fromDTO(pi);
            });
        }

        return this;
    }
}
