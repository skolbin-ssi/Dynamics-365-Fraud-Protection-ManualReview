// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface DisposabilityCheckServiceDTO {
    disposable: boolean;
    resource: string;
    /* string($date-time) */
    checked: string;
    rawResponse: string;
    /* string($date-time) */
    checkedEpochSeconds: string;
}

export interface VelocityDTO {
    hour: number;
    day: number;
    week: number;
    lifetime?: number;
}

export interface CalculatedFieldsDTO {
    matchingOfCountriesForShippingAndIP: boolean;
    matchingOfCountriesForBillingAndShipping: boolean;
    matchingOfCountriesForBillingAndIP: boolean;
    billingCountries: string[];
    billingZipCodes: string[];
    billingAddresses: string[];
    distanceToPreviousTransactionIP: number;
    accountAgeInDays: number;
    activityAgeInDays: number;
    /* string($date-time) */
    firstTransactionDateTime: string;
    /* string($date-time) */
    firstTransactionDateTimeEpochSeconds: string;
    aggregatedEmailConfirmed: boolean;
    aggregatedEmailDomain: string;
    disposableEmailDomain: boolean;
    disposabilityChecks: DisposabilityCheckServiceDTO[];
    authBankEventResultCodes: string[];
    approveBankEventResultCodes: string[];
    declineBankEventResultCodes: string[];
    transactionCount: VelocityDTO;
    transactionAmount: VelocityDTO;
    rejectedTransactionCount: VelocityDTO;
    rejectedTransactionAmount: VelocityDTO;
    failedTransactionCount: VelocityDTO;
    failedTransactionAmount: VelocityDTO;
    successfulTransactionCount: VelocityDTO;
    successfulTransactionAmount: VelocityDTO;
    currentPaymentInstrumentTransactionCount: VelocityDTO;
    currentPaymentInstrumentTransactionAmount: VelocityDTO;
    uniquePaymentInstrumentCount: VelocityDTO;
    uniqueIPCountries: VelocityDTO;
}
