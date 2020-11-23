// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import autobind from 'autobind-decorator';
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
import { Item } from '../../../../../models/item';

import { TransactionVelocity } from '../../../../../models/item/purchase/calculated-fields';
import './velocities.scss';
import { Price } from '../../../../../components/price';

const CN = 'velocities';

interface VelocitiesProps {
    className?: string;
    item: Item
}

export class Velocities extends Component<VelocitiesProps, never> {
    private readonly velocityColumns: IColumn[] = [
        {
            key: 'name',
            name: 'Category',
            minWidth: 200,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            className: `${CN}__category`,
            onRender: (data: TransactionVelocity) => (
                <Text variant="medium">{data.name}</Text>
            )
        },
        {
            key: 'hour',
            name: 'Hour',
            minWidth: 100,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            className: `${CN}__value`,
            onRender: (data: TransactionVelocity) => this.renderValue(data.isAmount, data.hour, data.customPlaceholder),
        },
        {
            key: 'day',
            name: 'Day',
            minWidth: 100,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            className: `${CN}__value`,
            onRender: (data: TransactionVelocity) => this.renderValue(data.isAmount, data.day, data.customPlaceholder),
        },
        {
            key: 'week',
            name: 'Week',
            minWidth: 100,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            className: `${CN}__value`,
            onRender: (data: TransactionVelocity) => this.renderValue(data.isAmount, data.week, data.customPlaceholder),
        },
    ];

    private readonly valuePlaceholder = (value = 'N/A') => (<span className="placeholder">{value}</span>);

    @autobind
    renderValue(isAmount: boolean, value: number, customPlaceholder?: string) {
        if (!Number.isFinite(value)) return this.valuePlaceholder(customPlaceholder);

        return (
            isAmount
                ? <Price value={value} />
                : <Text variant="medium">{value}</Text>
        );
    }

    renderTable() {
        const { item } = this.props;

        return (
            <DetailsList
                items={item.purchase.calculatedFields.velocities}
                columns={this.velocityColumns}
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
                title="Velocities"
            >
                {this.renderTable()}
            </ItemDetailsTile>
        );
    }
}
