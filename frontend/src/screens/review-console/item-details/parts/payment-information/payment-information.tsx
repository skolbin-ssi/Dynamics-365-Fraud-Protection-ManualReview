import cn from 'classnames';
import React from 'react';
import { Item } from '../../../../../models/item';
import { ItemDetailsTile } from '../../item-details-tile';
import { BaseTileRenderer, KeyValueItem } from '../base-tile-renderer';

const CN = 'item-details-payment-information';

interface PaymentInformationProps {
    className?: string;
    item: Item
}

export class PaymentInformation extends BaseTileRenderer<PaymentInformationProps, never> {
    renderPaymentInfo() {
        const { item } = this.props;

        const paymentInstrument = item.purchase.paymentInstrumentList[0];

        const renderingConfig: KeyValueItem[] = [
            { key: 'Payment instrument Id', value: paymentInstrument.paymentInstrumentId },
            { key: 'Payment method', value: paymentInstrument.type },
            { key: 'Card type', value: paymentInstrument.cardType },
            { key: 'Holder name', value: paymentInstrument.holderName },
            { key: 'BIN', value: paymentInstrument.BIN }

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
