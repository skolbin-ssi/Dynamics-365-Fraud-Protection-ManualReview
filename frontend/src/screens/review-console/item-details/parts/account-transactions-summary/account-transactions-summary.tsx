// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { Item } from '../../../../../models/item';
import { ItemDetailsTile } from '../../item-details-tile';
import { BaseTileRenderer, KeyValueItem } from '../base-tile-renderer';

import './account-transactions-summary.scss';

const CN = 'account-transactions-summary';

interface AccountTransactionsSummaryProps {
    className?: string;
    item: Item
}

export class AccountTransactionsSummary extends BaseTileRenderer<AccountTransactionsSummaryProps, never> {
    renderInfo() {
        const { item } = this.props;
        const { user } = item.purchase;

        const renderingConfig: KeyValueItem[] = [
            {
                key: 'Total spent', value: user.totalSpend, isPrice: true, customPlaceholder: '$0.00'
            },
            {
                key: 'Last 30 days spent', value: user.last30DaysSpend, isPrice: true, customPlaceholder: '$0.00'
            },
            {
                key: 'Monthly average spent', value: user.monthlyAverageSpend, isPrice: true, customPlaceholder: '$0.00'
            },
            { key: 'Total transactions', value: user.totalTransactions, customPlaceholder: '0' },
            { key: 'Last 30 days transactions', value: user.last30DaysTransactions, customPlaceholder: '0' },
            { key: 'Monthly average transactions', value: user.monthlyAverageTransactions, customPlaceholder: '0' },
            {
                key: 'Total refund amount', value: user.totalRefundAmount, isPrice: true, customPlaceholder: '$0.00'
            },
            {
                key: 'Last 30 days refund amount', value: user.last30DaysRefundAmount, isPrice: true, customPlaceholder: '$0.00'
            },
            {
                key: 'Monthly average refund amount', value: user.monthlyAverageRefundAmount, isPrice: true, customPlaceholder: '$0.00'
            },
            {
                key: 'Total chargeback amount', value: user.totalChargebackAmount, isPrice: true, customPlaceholder: '$0.00'
            },
            {
                key: 'Last 30 days chargeback amount', value: user.last30DaysChargebackAmount, isPrice: true, customPlaceholder: '$0.00'
            },
            {
                key: 'Monthly average chargeback amount', value: user.monthlyAverageChargebackAmount, isPrice: true, customPlaceholder: '$0.00'
            },
        ];

        return this.renderKeyValueConfig(renderingConfig, CN,);
    }

    render() {
        const { className } = this.props;
        return (
            <ItemDetailsTile
                className={className}
                title="Transaction/Refunding history"
            >
                <div className={`${CN}`}>
                    {this.renderInfo()}
                </div>
            </ItemDetailsTile>
        );
    }
}
