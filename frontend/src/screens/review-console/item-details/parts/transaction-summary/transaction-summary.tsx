// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    ColumnActionsMode,
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    SelectionMode
} from '@fluentui/react/lib/DetailsList';
import { Text } from '@fluentui/react/lib/Text';
import autobind from 'autobind-decorator';
import cn from 'classnames';
import React, { Component } from 'react';

import { IconText, Price } from '../../../../../components';
import { Item } from '../../../../../models/item';
import { BankEvent } from '../../../../../models/item/purchase/bank-event';
import {
    formatToLocalStringWithPassedTimeZone,
    convertToUTCAndFormatToLocalString,
} from '../../../../../utils/date';
import { stringToKebabCase } from '../../../../../utils/text';
import { ItemDetailsTile } from '../../item-details-tile';
import { ItemDetailsKeyValue } from '../../item-details-key-value';
import './transaction-summary.scss';

const CN = 'item-details-transaction-summary';

interface TransactionSummaryProps {
    className?: string;
    item: Item
}

enum TRANSACTION_SUMMARY_VIEW {
    RECEIPT = 'receipt',
    CC_AUTH_RESULT = 'cc_auth_result'
}

interface TransactionSummaryState {
    selectedPivotKey: TRANSACTION_SUMMARY_VIEW;
}

export class TransactionSummary extends Component<TransactionSummaryProps, TransactionSummaryState> {
    private readonly valuePlaceholder = (<span className="placeholder">N/A</span>);

    private readonly bankEventsColumns: IColumn[] = [
        {
            key: 'bankEventTimestamp',
            name: 'Transaction date, UTC',
            minWidth: 150,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            className: `${CN}__transaction-date`,
            onRender: (bankEvent: BankEvent) => (
                <Text variant="medium">
                    {convertToUTCAndFormatToLocalString(bankEvent.bankEventTimestamp, this.valuePlaceholder)}
                </Text>
            )
        },
        {
            key: 'paymentProcessor',
            name: 'Payment gateway',
            fieldName: '',
            minWidth: 250,
            maxWidth: 300,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (bankEvent: BankEvent) => (
                <Text variant="small">{bankEvent.paymentProcessor}</Text>
            )
        },
        {
            key: 'type',
            name: 'Bank event type',
            fieldName: '',
            minWidth: 150,
            maxWidth: 250,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (bankEvent: BankEvent) => (
                <Text variant="small">{bankEvent.type}</Text>
            )
        },
        {
            key: 'bankResponseCode',
            name: 'Code',
            fieldName: '',
            minWidth: 100,
            maxWidth: 250,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (bankEvent: BankEvent) => (
                <Text variant="small">{bankEvent.bankResponseCode}</Text>
            )
        },
        {
            key: 'status',
            name: 'Status',
            fieldName: '',
            minWidth: 100,
            maxWidth: 250,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: this.renderBankStatus,
        },
    ];

    constructor(props: TransactionSummaryProps) {
        super(props);

        this.state = {
            selectedPivotKey: TRANSACTION_SUMMARY_VIEW.RECEIPT
        };
    }

    @autobind
    handlePivotChange(itemKey: TRANSACTION_SUMMARY_VIEW) {
        this.setState({ selectedPivotKey: itemKey });
    }

    renderBankStatus(bankEvent: BankEvent) {
        return (
            <IconText
                text={bankEvent.status}
                textVariant="small"
                placeholder="N/A"
                iconValue={bankEvent.status}
                icons={{
                    GOOD: {
                        value: 'Approved',
                        iconName: 'CompletedSolid'
                    },
                    BAD: {
                        value: 'Declined',
                        iconName: 'Blocked2Solid'
                    },
                    UNKNOWN: {
                        value: 'Unknown',
                        iconName: 'UnknownSolid'
                    }
                }}
            />
        );
    }

    renderGeneralInfo() {
        const { item } = this.props;
        const { purchase } = item;

        const renderingConfig = [
            {
                key: 'Original order ID',
                value: purchase.originalOrderId,
                valueToCopy: purchase.originalOrderId,
                className: `${CN}__id`,
            },
            { key: 'Customer local date', value: formatToLocalStringWithPassedTimeZone(purchase.customerLocalDate, this.valuePlaceholder) },
            { key: 'Merchant local date', value: formatToLocalStringWithPassedTimeZone(purchase.merchantLocalDate, this.valuePlaceholder) },
            { key: 'Shipping method', value: purchase.shippingMethod, valueToCopy: purchase.shippingMethod }
        ];

        return renderingConfig.map(({
            key,
            value,
            valueToCopy,
            className,
        }) => (
            <ItemDetailsKeyValue
                className={`${CN}__key-value`}
                contentClassName={className}
                key={stringToKebabCase(key)}
                label={key}
                value={value}
                valueToCopy={valueToCopy}
            />
        ));
    }

    renderProductsList() {
        const { item } = this.props;
        const { purchase } = item;
        if (!purchase || !purchase.productList) {
            return null;
        }
        const tableClassName = `${CN}__products-list`;
        const colClassName = `${CN}__products-list-col`;
        const rowClassName = `${CN}__products-list-row`;
        const headerClassName = `${CN}__products-list-row-header`;

        return (
            <div className={tableClassName}>
                <div className={cn(rowClassName, headerClassName)}>
                    <Text variant="medium" className={`${headerClassName}__name`}>Product description</Text>
                    <Text variant="medium" className={`${headerClassName}__quantity`}>Quantity</Text>
                    <div />
                    <Text variant="medium" className={`${headerClassName}__price`}>Unit price</Text>
                    <Text variant="medium" className={`${headerClassName}__amount`}>Amount</Text>
                </div>
                {
                    purchase.productList.map(product => (
                        <div
                            key={stringToKebabCase(product.productId)}
                            className={rowClassName}
                        >
                            <div className={cn(colClassName, `${colClassName}__name`)}>
                                <Text
                                    variant="medium"
                                    className={`${colClassName}__name-sku`}
                                >
                                    SKU:&nbsp;
                                    {product.sku}
                                </Text>
                                <div className={`${colClassName}__name-line`}>
                                    <Text
                                        variant="medium"
                                        className={`${colClassName}__name-value`}
                                    >
                                        {product.productName}
                                    </Text>
                                    <div className={cn(`${colClassName}__name-badge`, `${colClassName}__name-badge--type`)}>{product.type}</div>
                                    { product.isRecurring && <div className={`${colClassName}__name-badge`}>Recurring</div> }
                                    { product.isFree && <div className={`${colClassName}__name-badge`}>Free</div> }
                                    { product.isPreorder && <div className={`${colClassName}__name-badge`}>Pre-Order</div> }
                                </div>
                            </div>
                            <Text
                                variant="medium"
                                className={cn(colClassName, `${colClassName}__quantity`)}
                            >
                                {product.quantity}
                            </Text>
                            <div />
                            <Price
                                className={cn(colClassName, `${colClassName}__price`)}
                                value={product.salesPriceInUSD}
                            />
                            <Price
                                className={cn(colClassName, `${colClassName}__amount`)}
                                value={product.purchasePriceInUSD}
                            />
                        </div>
                    ))
                }
                <div className={cn(rowClassName, `${rowClassName}__tax`)}>
                    <div />
                    <div />
                    <div />
                    <Text
                        variant="medium"
                        className={cn(colClassName, `${colClassName}__tax-label`)}
                    >
                        TAX
                    </Text>
                    <Price
                        className={cn(colClassName, `${colClassName}__amount`)}
                        value={purchase.salesTaxInUSD}
                    />
                </div>
                <div className={cn(rowClassName, `${rowClassName}__total`)}>
                    <div />
                    <div />
                    <div />
                    <Text
                        variant="medium"
                        className={cn(colClassName, `${colClassName}__total-label`)}
                    >
                        TOTAL
                    </Text>
                    <Price
                        className={cn(colClassName, `${colClassName}__amount`)}
                        value={purchase.totalAmountInUSD}
                    />
                </div>
            </div>
        );
    }

    renderBankEventsList() {
        const { item } = this.props;

        return (
            <DetailsList
                items={item.purchase.bankEventsList}
                columns={this.bankEventsColumns}
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

    renderDetails() {
        const { selectedPivotKey } = this.state;

        switch (selectedPivotKey) {
            default:
            case TRANSACTION_SUMMARY_VIEW.RECEIPT:
                return (
                    <>
                        {this.renderGeneralInfo()}
                        {this.renderProductsList()}
                    </>
                );
            case TRANSACTION_SUMMARY_VIEW.CC_AUTH_RESULT:
                return this.renderBankEventsList();
        }
    }

    render() {
        const { className, item } = this.props;
        const { selectedPivotKey } = this.state;

        let pivots;

        if (Array.isArray(item.purchase.bankEventsList) && item.purchase.bankEventsList.length) {
            pivots = [
                { headerText: 'Receipt', itemKey: TRANSACTION_SUMMARY_VIEW.RECEIPT },
                { headerText: 'CC authentication result', itemKey: TRANSACTION_SUMMARY_VIEW.CC_AUTH_RESULT }
            ];
        }

        return (
            <ItemDetailsTile
                className={cn(className, CN, `${CN}--${selectedPivotKey}`)}
                title="Transaction summary"
                pivots={pivots}
                selectedPivotKey={selectedPivotKey}
                handlePivotChange={this.handlePivotChange}
            >
                { this.renderDetails() }
            </ItemDetailsTile>
        );
    }
}
