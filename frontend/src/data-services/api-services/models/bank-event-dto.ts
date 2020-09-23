// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface BankEventDTO {
    BankEventId: string;
    /* string($date-time) */
    BankEventTimestamp: string;
    BankResponseCode: string;
    MID: string;
    MRN: string;
    PaymentProcessor: string;
    Status: string;
    Type: string;
}
