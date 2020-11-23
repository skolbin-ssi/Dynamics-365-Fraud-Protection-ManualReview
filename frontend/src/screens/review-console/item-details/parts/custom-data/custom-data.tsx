// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import cn from 'classnames';
import {
    ColumnActionsMode,
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    SelectionMode
} from '@fluentui/react/lib/DetailsList';
import { Text } from '@fluentui/react/lib/Text';
import { ItemDetailsTile } from '../../item-details-tile';
import { stringToStartCase } from '../../../../../utils/text';

import { Item } from '../../../../../models/item';
import './custom-data.scss';

const CN = 'custom-data';

interface CustomDataProps {
    className?: string;
    item: Item
}

export class CustomData extends Component<CustomDataProps, never> {
    private readonly valuePlaceholder = (<span className="placeholder">N/A</span>);

    private readonly customDataColumns: IColumn[] = [
        {
            key: 'category',
            name: 'Category',
            minWidth: 150,
            maxWidth: 500,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            className: `${CN}__category`,
            onRender: (data: { key: string, value: string }) => (
                <Text variant="medium">{stringToStartCase(data.key)}</Text>
            )
        },
        {
            key: 'value',
            name: 'Custom data',
            minWidth: 200,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            className: `${CN}__value`,
            onRender: (data: { key: string, value: string }) => (
                <Text variant="small">{data.value || this.valuePlaceholder}</Text>
            )
        },
    ];

    renderCustomData() {
        const { item } = this.props;

        return (
            <DetailsList
                items={item.purchase.customData}
                columns={this.customDataColumns}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
                isHeaderVisible
                cellStyleProps={{
                    cellExtraRightPadding: 5,
                    cellLeftPadding: 10,
                    cellRightPadding: 10
                }}
            />
        );
    }

    render() {
        const { className } = this.props;

        return (
            <ItemDetailsTile
                className={cn(CN, className)}
                title="Custom data"
            >
                {this.renderCustomData()}
            </ItemDetailsTile>
        );
    }
}
