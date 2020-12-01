// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import cn from 'classnames';
import React from 'react';
import { Item } from '../../../../../models/item';
import { ItemDetailsTile } from '../../item-details-tile';
import { BaseTileRenderer, KeyValueItem } from '../base-tile-renderer';

const CN = 'item-details-payment-information';

interface IpInformationProps {
    className?: string;
    item: Item
}

export class IPInformation extends BaseTileRenderer<IpInformationProps, never> {
    renderInfo() {
        const { item } = this.props;

        const { deviceContext, calculatedFields } = item.purchase;

        const renderingConfig: KeyValueItem[] = [
            { key: 'IP (routing type)', value: deviceContext.ipAddress, valueToCopy: deviceContext.ipAddress },
            { key: 'Routing type', value: deviceContext.routingType },
            { key: 'Connection type', value: deviceContext.connectionType },
            {
                key: 'Distance to IP in previous transaction',
                value: typeof calculatedFields.distanceToPreviousTransactionIP === 'number'
                    ? `${calculatedFields.distanceToPreviousTransactionIP} mi`
                    : calculatedFields.distanceToPreviousTransactionIP,
            },
        ];

        return this.renderKeyValueConfig(renderingConfig, CN);
    }

    render() {
        const { className } = this.props;
        return (
            <ItemDetailsTile
                className={cn(CN, className)}
                title="IP information"
            >
                {this.renderInfo()}
            </ItemDetailsTile>
        );
    }
}
