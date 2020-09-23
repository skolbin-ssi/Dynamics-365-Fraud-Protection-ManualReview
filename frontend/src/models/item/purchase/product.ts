// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ProductDTO } from '../../../data-services/api-services/models/product-dto';
import { BaseModel } from '../../misc';

export class Product extends BaseModel {
    productId: string = '';

    productName: string = '';

    type: string = '';

    sku: string = '';

    category: string = '';

    market: string = '';

    salesPrice: number = 0;

    salesPriceInUSD: number = 0;

    currency: string = '';

    COGS: number = 0;

    COGSInUSD: string = '';

    isRecurring: boolean = false;

    isFree: boolean = false;

    purchasePrice: number = 0;

    purchasePriceInUSD: number = 0;

    margin: number = 0;

    marginInUSD: number = 0;

    quantity: number = 0;

    isPreorder: boolean = false;

    shippingMethod: string = '';

    currencyConversionFactor: number = 0;

    language: string = '';

    fromDTO(product: ProductDTO) {
        const {
            ProductId,
            ProductName,
            Type,
            Sku,
            Category,
            Market,
            SalesPrice,
            Currency,
            COGS,
            IsRecurring,
            IsFree,
            Language,
            PurchasePrice,
            Margin,
            Quantity,
            IsPreorder,
            ShippingMethod,
            COGSInUSD,
            CurrencyConversionFactor,
            MarginInUSD,
            PurchasePriceInUSD,
            SalesPriceInUSD
        } = product;

        this.productId = this.define(this.productId, ProductId);
        this.productName = this.define(this.productName, ProductName);
        this.type = this.define(this.type, Type);
        this.sku = this.define(this.sku, Sku);
        this.category = this.define(this.category, Category);
        this.market = this.define(this.market, Market);
        this.salesPrice = this.define(this.salesPrice, SalesPrice);
        this.currency = this.define(this.currency, Currency);
        this.COGS = this.define(this.COGS, COGS);
        this.isRecurring = this.define(this.isRecurring, IsRecurring);
        this.isFree = this.define(this.isFree, IsFree);
        this.language = this.define(this.language, Language);
        this.purchasePrice = this.define(this.purchasePrice, PurchasePrice);
        this.margin = this.define(this.margin, Margin);
        this.quantity = this.define(this.quantity, Quantity);
        this.isPreorder = this.define(this.isPreorder, IsPreorder);
        this.shippingMethod = this.define(this.shippingMethod, ShippingMethod);
        this.COGSInUSD = this.define(this.COGSInUSD, COGSInUSD);
        this.currencyConversionFactor = this.define(this.currencyConversionFactor, CurrencyConversionFactor);
        this.marginInUSD = this.define(this.marginInUSD, MarginInUSD);
        this.purchasePriceInUSD = this.define(this.purchasePriceInUSD, PurchasePriceInUSD);
        this.salesPriceInUSD = this.define(this.salesPriceInUSD, SalesPriceInUSD);

        return this;
    }
}
