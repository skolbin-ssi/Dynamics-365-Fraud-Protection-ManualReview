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

        const { deviceContext } = item.purchase;

        const renderingConfig: KeyValueItem[] = [
            { key: 'IP (routing type)', value: deviceContext.ipAddress },
            { key: 'Routing type', value: deviceContext.routingType },
            { key: 'Connection type', value: deviceContext.connectionType }

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
