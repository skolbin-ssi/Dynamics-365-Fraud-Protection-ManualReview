// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { BankEventDTO } from '../../../data-services/api-services/models/bank-event-dto';

export class BankEvent {
    bankEventId: string = '';

    bankEventTimestamp: string = '';

    bankResponseCode: string = '';

    MID: string = '';

    MRN: string = '';

    paymentProcessor: string = '';

    status: string = '';

    type: string = '';

    fromDTO(bankEvent: BankEventDTO): BankEvent {
        const {
            BankEventId,
            BankEventTimestamp,
            BankResponseCode,
            MID,
            MRN,
            PaymentProcessor,
            Status,
            Type
        } = bankEvent;

        this.bankEventId = BankEventId;
        this.bankEventTimestamp = BankEventTimestamp;
        this.bankResponseCode = BankResponseCode;
        this.MID = MID;
        this.MRN = MRN;
        this.paymentProcessor = PaymentProcessor;
        this.status = Status;
        this.type = Type;

        return this;
    }
}
