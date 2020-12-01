// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { observable } from 'mobx';
import { PurchaseDTO } from '../../../data-services/api-services/models';
import { BaseModel } from '../../misc';
import { Address } from './address';
import { DeviceContext } from './device-context';
import { GeoAddress } from './geo-address';
import { PaymentInstrument } from './payment-instrument';
import { PreviousPurchase } from './previous-purchase';
import { Product } from './product';
import { PurchaseUser } from './purchase-user';
import { BankEvent } from './bank-event';
import { CalculatedFields } from './calculated-fields';

export class Purchase extends BaseModel {
    purchaseId: string = '';

    assessmentType: string = '';

    originalOrderId: string = '';

    merchantLocalDate: string = '';

    customerLocalDate: string = '';

    totalAmount: number = 0;

    totalAmountInUSD: number = 0;

    salesTax: number = 0;

    salesTaxInUSD: number = 0;

    currency: string = '';

    shippingMethod: string = '';

    user: PurchaseUser = new PurchaseUser();

    deviceContext: DeviceContext = new DeviceContext();

    paymentInstrumentList: PaymentInstrument[] = [];

    productList: Product[] = [];

    bankEventsList: BankEvent[] = [];

    addressList: Address[] = [];

    @observable
    geoAddressList: GeoAddress[] = [];

    currencyConversionFactor: number = 0;

    rawPurchase: PurchaseDTO | null = null;

    previousPurchaseList: PreviousPurchase[] = [];

    calculatedFields: CalculatedFields = new CalculatedFields();

    customData: { key: string, value: string }[] = [];

    fromDTO(purchase: PurchaseDTO) {
        const {
            PurchaseId: purchaseId,
            AssessmentType: assessmentType,
            OriginalOrderId: originalOrderId,
            CustomerLocalDate: customerLocalDate,
            MerchantLocalDate: merchantLocalDate,
            TotalAmount: totalAmount,
            TotalAmountInUSD: totalAmountInUSD,
            SalesTax: salesTax,
            SalesTaxInUSD: salesTaxInUSD,
            Currency: currency,
            CurrencyConversionFactor: currencyConversionFactor,
            ShippingMethod: shippingMethod,
            User: user,
            DeviceContext: deviceContext,
            PaymentInstrumentList: paymentInstrumentList,
            ProductList: productList,
            // AdditionalInfo,
            AddressList: addressList,
            BankEventsList: bankEventsList,
            CustomData: customData,
            PreviousPurchaseList: previousPurchaseList,
            CalculatedFields: calculatedFields,
        } = purchase;

        this.rawPurchase = purchase;
        this.purchaseId = purchaseId || '';
        this.assessmentType = assessmentType;
        this.originalOrderId = originalOrderId || '';
        this.customerLocalDate = customerLocalDate || '';
        this.merchantLocalDate = merchantLocalDate || '';
        this.totalAmount = totalAmount || 0;
        this.totalAmountInUSD = totalAmountInUSD || 0;
        this.salesTax = salesTax || 0;
        this.salesTaxInUSD = salesTaxInUSD || 0;
        this.currency = currency || '';
        this.shippingMethod = shippingMethod || '';
        this.currencyConversionFactor = currencyConversionFactor || 0;

        if (user) {
            this.user.fromDTO(user);
        }

        if (deviceContext) {
            this.deviceContext.fromDTO(deviceContext);
        }

        if (Array.isArray(paymentInstrumentList)) {
            this.paymentInstrumentList = paymentInstrumentList.map<PaymentInstrument>(pi => {
                const piModel = new PaymentInstrument();
                return piModel.fromDTO(pi);
            });
        }

        if (Array.isArray(productList)) {
            this.productList = productList.map<Product>(product => {
                const productModel = new Product();
                return productModel.fromDTO(product);
            });
        }

        if (Array.isArray(bankEventsList)) {
            this.bankEventsList = bankEventsList.map<BankEvent>(bankEvent => {
                const bankEventModel = new BankEvent();
                return bankEventModel.fromDTO(bankEvent);
            });
        }

        if (Array.isArray(addressList)) {
            this.addressList = addressList.map<Address>(address => {
                const addressModel = new Address();
                return addressModel.fromDTO(address);
            });
        }

        if (Array.isArray(previousPurchaseList)) {
            this.previousPurchaseList = previousPurchaseList.map<PreviousPurchase>(pp => {
                const ppModel = new PreviousPurchase();
                return ppModel.fromDTO(pp);
            });
        }

        if (calculatedFields) {
            this.calculatedFields.fromDTO(calculatedFields);
        }

        if (customData) {
            this.customData = Object.entries(customData).map(([key, value]) => ({ key, value }));
        }

        return this;
    }
}
