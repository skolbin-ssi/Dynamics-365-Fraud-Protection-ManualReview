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
import { Price } from '../../../../../components';
import { Item } from '../../../../../models/item';
import { PreviousPurchase } from '../../../../../models/item/purchase/previous-purchase';
import { formatISODateStringToLocaleString } from '../../../../../utils/date';
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
    TRANSACTION = 'transaction',
    HISTORY = 'history'
}

interface TransactionSummaryState {
    selectedPivotKey: TRANSACTION_SUMMARY_VIEW;
}

export class TransactionSummary extends Component<TransactionSummaryProps, TransactionSummaryState> {
    private readonly valuePlaceholder = (<span className={`${CN}__pl`}>N/A</span>);

    private readonly purchaseHistoryColumns: IColumn[] = [
        {
            key: 'merchantLocalDate',
            name: 'Transaction date',
            minWidth: 150,
            maxWidth: 150,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            className: `${CN}__score-cell`,
            onRender: (pp: PreviousPurchase) => (
                <Text variant="medium">
                    {formatISODateStringToLocaleString(pp.merchantLocalDate, this.valuePlaceholder)}
                </Text>
            )
        },
        {
            key: 'amount',
            name: 'Amount',
            minWidth: 100,
            maxWidth: 150,
            isPadded: true,
            fieldName: 'totalAmountInUSD',
            columnActionsMode: ColumnActionsMode.disabled,
            className: `${CN}__align-right`,
            onRender: (pp: PreviousPurchase) => (
                <Price value={pp.totalAmountInUSD} />
            )
        },
        {
            key: 'type',
            name: 'Type',
            fieldName: '',
            minWidth: 70,
            maxWidth: 250,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (pp: PreviousPurchase) => (
                <Text variant="medium" className={`${CN}__score-cell`}>
                    {pp.type}
                </Text>
            )
        },
        {
            key: 'currency',
            name: 'Currency',
            fieldName: '',
            minWidth: 70,
            maxWidth: 200,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (pp: PreviousPurchase) => (
                <Text variant="medium" className={`${CN}__score-cell`}>
                    {pp.currency}
                </Text>
            )
        },
        {
            key: 'shippingMethod',
            name: 'Shipping method',
            fieldName: 'shippingMethod',
            minWidth: 150,
            maxWidth: 600,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (pp: PreviousPurchase) => (
                <Text variant="medium" className={`${CN}__score-cell`}>
                    {pp.shippingMethod}
                </Text>
            )
        },
        {
            key: 'riskScore',
            name: 'Risk score',
            fieldName: '',
            minWidth: 80,
            maxWidth: 80,
            isPadded: true,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (pp: PreviousPurchase) => (
                <Text variant="medium" className={`${CN}__score-cell`}>
                    {pp.riskScore}
                </Text>
            )
        }
    ];

    constructor(props: TransactionSummaryProps) {
        super(props);

        this.state = {
            selectedPivotKey: TRANSACTION_SUMMARY_VIEW.TRANSACTION
        };
    }

    @autobind
    handlePivotChange(itemKey: TRANSACTION_SUMMARY_VIEW) {
        this.setState({ selectedPivotKey: itemKey });
    }

    renderGeneralInfo() {
        const { item } = this.props;
        const { purchase } = item;

        const renderingConfig = [
            { key: 'Original order ID', value: purchase.originalOrderId, className: `${CN}__id` },
            { key: 'Customer local date', value: formatISODateStringToLocaleString(purchase.customerLocalDate, this.valuePlaceholder) },
            { key: 'Merchant local date', value: formatISODateStringToLocaleString(purchase.merchantLocalDate, this.valuePlaceholder) },
            { key: 'Shipping Method', value: purchase.shippingMethod }
        ];

        return renderingConfig.map(({ key, value, className }) => (
            <ItemDetailsKeyValue
                className={`${CN}__key-value`}
                contentClassName={className}
                key={stringToKebabCase(key)}
                label={key}
                value={value}
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
                    {/*
                    <Text
                        variant="medium"
                        className={cn(colClassName, `${colClassName}__currency-conversion-factor`)}
                    >
                        {`Currency conversion factor: ${purchase.currencyConversionFactor}`}
                    </Text>
                    */}
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

    renderHistory() {
        const { item } = this.props;

        return (
            <DetailsList
                items={item.purchase.previousPurchaseList}
                columns={this.purchaseHistoryColumns}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
                isHeaderVisible
                // className={cn(CN, `${CN}--with-row-cursor-pointer`)}
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
            case TRANSACTION_SUMMARY_VIEW.TRANSACTION:
                return (
                    <>
                        {this.renderGeneralInfo()}
                        {this.renderProductsList()}
                    </>
                );
            case TRANSACTION_SUMMARY_VIEW.HISTORY:
                return this.renderHistory();
        }
    }

    render() {
        const { className, item } = this.props;
        const { selectedPivotKey } = this.state;

        let pivots;

        if (Array.isArray(item.purchase.previousPurchaseList) && item.purchase.previousPurchaseList.length) {
            pivots = [
                { headerText: 'Transaction', itemKey: TRANSACTION_SUMMARY_VIEW.TRANSACTION },
                { headerText: 'History', itemKey: TRANSACTION_SUMMARY_VIEW.HISTORY }
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
