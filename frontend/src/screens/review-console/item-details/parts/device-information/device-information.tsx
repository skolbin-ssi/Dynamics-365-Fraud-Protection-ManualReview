// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import cn from 'classnames';
import React from 'react';
import { Item } from '../../../../../models/item';
import { ItemDetailsTile } from '../../item-details-tile';
import { BaseTileRenderer, KeyValueItem } from '../base-tile-renderer';

const CN = 'item-details-payment-information';

interface DeviceInformationProps {
    className?: string;
    item: Item
}

export class DeviceInformation extends BaseTileRenderer<DeviceInformationProps, never> {
    renderDeviceInfo() {
        const { item } = this.props;

        const { deviceContext } = item.purchase;

        const renderingConfig: KeyValueItem[] = [
            { key: 'User agent or browsing string', value: deviceContext.userAgent },
            { key: 'Browser language', value: deviceContext.browserLanguage },
            { key: 'Screen resolution', value: deviceContext.screenResolution },
            { key: 'Operating system', value: deviceContext.os },
            { key: 'Device type', value: deviceContext.deviceType },
            { key: 'Device context ID', value: deviceContext.deviceContextId, valueToCopy: deviceContext.deviceContextId },
            { key: 'External device ID', value: deviceContext.externalDeviceId, valueToCopy: deviceContext.externalDeviceId },
            { key: 'User agent', value: deviceContext.userAgent, valueToCopy: deviceContext.userAgent },
        ];

        return this.renderKeyValueConfig(renderingConfig, CN);
    }

    render() {
        const { className } = this.props;
        return (
            <ItemDetailsTile
                className={cn(CN, className)}
                title="Device information"
            >
                {this.renderDeviceInfo()}
            </ItemDetailsTile>
        );
    }
}
