// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

interface _ProductDTO {
    ProductId: string;
    ProductName: string;
    Type: string;
    Sku: string;
    Category: string;
    Market: string;
    SalesPrice: number;
    Currency: string;
    COGS: number;
    IsRecurring: boolean;
    IsFree: boolean;
    Language: string;
    PurchasePrice: number;
    Margin: number;
    Quantity: number;
    IsPreorder: boolean;
    ShippingMethod: string;
    COGSInUSD: number;
    CurrencyConversionFactor: number;
    MarginInUSD: number;
    PurchasePriceInUSD: number;
    SalesPriceInUSD: number;
}

export type ProductDTO = Partial<_ProductDTO>;
