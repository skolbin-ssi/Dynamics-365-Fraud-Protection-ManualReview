// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import cn from 'classnames';
import React from 'react';
import { Item } from '../../../../../models/item';
import { ItemDetailsTile } from '../../item-details-tile';
import { BaseTileRenderer, KeyValueItem } from '../base-tile-renderer';
import { BankEvent } from '../../../../../models/item/purchase/bank-event';

const CN = 'item-details-payment-information';
const CC_HASH_KEY = 'cc_hash';

interface PaymentInformationProps {
    className?: string;
    item: Item
}

export class PaymentInformation extends BaseTileRenderer<PaymentInformationProps, never> {
    composeUniquePaymentProcessors(bankEventsList: BankEvent[]): string {
        const paymentProcessorSet = new Set(bankEventsList.map(bankEvent => bankEvent.paymentProcessor));

        return [...paymentProcessorSet.values()].join(', ');
    }

    renderPaymentInfo() {
        const { item } = this.props;
        const { bankEventsList, customData, paymentInstrumentList } = item.purchase || {};

        const paymentProcessors = this.composeUniquePaymentProcessors(bankEventsList) || undefined;
        const paymentInstrument = paymentInstrumentList[0];
        const ccHash = customData.find(record => record.key === CC_HASH_KEY)?.value;

        const renderingConfig: KeyValueItem[] = [
            { key: 'Payment instrument Id', value: paymentInstrument?.paymentInstrumentId, valueToCopy: paymentInstrument?.paymentInstrumentId },
            { key: 'Payment method', value: paymentInstrument?.type },
            { key: 'Payment instrument type', value: paymentInstrument?.cardType, valueToCopy: paymentInstrument?.cardType },
            { key: 'Holder name', value: paymentInstrument?.holderName, valueToCopy: paymentInstrument?.holderName },
            { key: 'BIN', value: paymentInstrument?.BIN, valueToCopy: paymentInstrument?.BIN },
            { key: 'Merchant payment instrument ID', value: paymentInstrument?.merchantPaymentInstrumentId, valueToCopy: paymentInstrument?.merchantPaymentInstrumentId },
            { key: 'CC hash', value: ccHash, valueToCopy: ccHash },
            { key: 'Payment gateway(s)', value: paymentProcessors, valueToCopy: paymentProcessors }
        ];

        return this.renderKeyValueConfig(renderingConfig, CN);
    }

    render() {
        const { className } = this.props;
        return (
            <ItemDetailsTile
                className={cn(CN, className)}
                title="Payment information"
            >
                {this.renderPaymentInfo()}
            </ItemDetailsTile>
        );
    }
}
