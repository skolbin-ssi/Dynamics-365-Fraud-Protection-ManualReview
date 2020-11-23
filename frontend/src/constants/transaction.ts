// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export enum VELOCITY_KEYS {
    transactionCount = 'transactionCount',
    transactionAmount = 'transactionAmount',
    rejectedTransactionCount = 'rejectedTransactionCount',
    rejectedTransactionAmount = 'rejectedTransactionAmount',
    failedTransactionCount = 'failedTransactionCount',
    failedTransactionAmount = 'failedTransactionAmount',
    successfulTransactionCount = 'successfulTransactionCount',
    successfulTransactionAmount = 'successfulTransactionAmount',
    currentPaymentInstrumentTransactionCount = 'currentPaymentInstrumentTransactionCount',
    currentPaymentInstrumentTransactionAmount = 'currentPaymentInstrumentTransactionAmount',
    uniquePaymentInstrumentCount = 'uniquePaymentInstrumentCount',
    uniqueIPCountries = 'uniqueIPCountries',
}

export const VELOCITY_NAMES: Record<VELOCITY_KEYS, string> = {
    [VELOCITY_KEYS.transactionAmount]: 'Sum of all purchases',
    [VELOCITY_KEYS.transactionCount]: 'Number of all purchases',
    [VELOCITY_KEYS.rejectedTransactionCount]: 'Number of rejected transactions',
    [VELOCITY_KEYS.rejectedTransactionAmount]: 'Sum of rejected transactions',
    [VELOCITY_KEYS.failedTransactionCount]: 'Number of failed transactions',
    [VELOCITY_KEYS.failedTransactionAmount]: 'Sum of failed transactions',
    [VELOCITY_KEYS.successfulTransactionCount]: 'Number of successful transactions',
    [VELOCITY_KEYS.successfulTransactionAmount]: 'Sum of successful transactions',
    [VELOCITY_KEYS.currentPaymentInstrumentTransactionCount]: 'Transactions with current payment instrument',
    [VELOCITY_KEYS.currentPaymentInstrumentTransactionAmount]: 'Sum of transactions with current payment instrument',
    [VELOCITY_KEYS.uniquePaymentInstrumentCount]: 'Unique payment instruments used',
    [VELOCITY_KEYS.uniqueIPCountries]: 'Number of unique IP countries',
};

// The order is important here, as it is used on the view
export const VELOCITIES = [
    {
        key: VELOCITY_KEYS.transactionCount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.transactionCount],
        isAmount: false,
    },
    {
        key: VELOCITY_KEYS.successfulTransactionCount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.successfulTransactionCount],
        isAmount: false,
    },
    {
        key: VELOCITY_KEYS.failedTransactionCount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.failedTransactionCount],
        isAmount: false,
    },
    {
        key: VELOCITY_KEYS.rejectedTransactionCount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.rejectedTransactionCount],
        isAmount: false,
    },
    {
        key: VELOCITY_KEYS.uniquePaymentInstrumentCount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.uniquePaymentInstrumentCount],
        isAmount: false,
    },
    {
        key: VELOCITY_KEYS.currentPaymentInstrumentTransactionCount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.currentPaymentInstrumentTransactionCount],
        isAmount: false,
    },
    {
        key: VELOCITY_KEYS.uniqueIPCountries,
        name: VELOCITY_NAMES[VELOCITY_KEYS.uniqueIPCountries],
        isAmount: false,
    },
    {
        key: VELOCITY_KEYS.transactionAmount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.transactionAmount],
        isAmount: true,
        customPlaceholder: '$0.00',
    },
    {
        key: VELOCITY_KEYS.failedTransactionAmount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.failedTransactionAmount],
        isAmount: true,
        customPlaceholder: '$0.00',
    },
    {
        key: VELOCITY_KEYS.rejectedTransactionAmount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.rejectedTransactionAmount],
        isAmount: true,
        customPlaceholder: '$0.00',
    },
    {
        key: VELOCITY_KEYS.successfulTransactionAmount,
        name: VELOCITY_NAMES[VELOCITY_KEYS.successfulTransactionAmount],
        isAmount: true,
        customPlaceholder: '$0.00',
    }
];
