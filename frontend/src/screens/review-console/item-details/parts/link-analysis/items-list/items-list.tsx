// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import cx from 'classnames';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

import {
    ColumnActionsMode,
    DetailsList,
    DetailsRow,
    IColumn,
    IDetailsListProps,
    IDetailsRowStyles,
    Selection,
    SelectionMode
} from '@fluentui/react/lib/DetailsList';
import { Text } from '@fluentui/react/lib/Text';
import { Spinner } from '@fluentui/react/lib/Spinner';

import { ITEM_STATUS } from '../../../../../../models/item';
import { DEFAULT_LINK_ANALYSIS_ITEMS_PER_PAGE, ITEM_LIST_COLUMN_KEYS } from '../../../../../../constants';

import './items-list.scss';
import { LinkAnalysisDfpItem, LinkAnalysisMrItem } from '../../../../../../models/item/link-analysis';
import { LinkAnalysisItem } from '../../../../../../view-services';
import { IconText } from '../../../../../../components/icon-text';

interface ItemsListComponentProps {
    data: LinkAnalysisItem[];
    isLoading: boolean;
    canLoadMore: boolean;
    onLoadMoreClick(): void;
    wasFirstPageLoaded: boolean;
    isSelectable?: boolean;
    onSelectionChanged(selectedItems: LinkAnalysisItem[]): void
}

const CN = 'items-list';

function isMrItem(item: LinkAnalysisMrItem | LinkAnalysisDfpItem): item is LinkAnalysisMrItem {
    return 'item' in (item as LinkAnalysisMrItem);
}

@observer
export class ItemsList extends Component<ItemsListComponentProps, never> {
    selection = new Selection({
        // eslint-disable-next-line react/destructuring-assignment
        selectionMode: SelectionMode.multiple,
        onSelectionChanged: this.handleSelectionChange,
    });

    private readonly columns: IColumn[] = [
        {
            key: ITEM_LIST_COLUMN_KEYS.FRAUD_SCORE,
            name: 'Fraud score',
            minWidth: 50,
            maxWidth: 80,
            className: `${CN}__cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: LinkAnalysisItem) => (
                <Text variant="medium" className={`${CN}__score-cell`}>
                    {
                        isMrItem(item)
                            ? item.item.decision?.riskScore
                            : item.riskScore
                    }
                </Text>
            ),
        },
        {
            key: ITEM_LIST_COLUMN_KEYS.ORDER_ID,
            name: 'Order ID',
            fieldName: 'id',
            minWidth: 50,
            maxWidth: 240,
            isCollapsible: true,
            isRowHeader: true,
            isPadded: true,
            className: `${CN}__cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: LinkAnalysisItem) => {
                const itemId = isMrItem(item)
                    ? item.item.id
                    : item.purchaseId;

                return (
                    <Text variant="smallPlus" className={`${CN}__order-id-cell`} title={itemId}>
                        {itemId}
                    </Text>
                );
            }
        },
        {
            key: ITEM_LIST_COLUMN_KEYS.IMPORT_DATE,
            name: 'Import date',
            fieldName: 'importDateTime',
            minWidth: 90,
            maxWidth: 90,
            isPadded: true,
            className: `${CN}__cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: LinkAnalysisItem) => (
                <Text variant="smallPlus">
                    {
                        isMrItem(item)
                            ? item.item.displayImportDateTime
                            : ''
                    }
                </Text>
            )
        },
        {
            key: ITEM_LIST_COLUMN_KEYS.AMOUNT,
            name: 'Amount',
            minWidth: 70,
            maxWidth: 70,
            isPadded: true,
            className: `${CN}__cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: LinkAnalysisItem) => (
                <Text variant="smallPlus">
                    {
                        isMrItem(item)
                            ? item.item.amount
                            : item.amount
                    }
                </Text>
            )
        },
        {
            key: ITEM_LIST_COLUMN_KEYS.STATUS,
            name: 'Status',
            minWidth: 60,
            maxWidth: 80,
            data: 'string',
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: LinkAnalysisItem) => {
                const status = isMrItem(item) ? item.item.status : item.merchantRuleDecision;

                return (
                    <Text
                        style={{ width: 'auto' }}
                        variant="smallPlus"
                        className={cx({
                            [`${CN}__good-status`]: status === ITEM_STATUS.GOOD,
                            [`${CN}__bad-status`]: status === ITEM_STATUS.BAD,
                            [`${CN}__escalated-status`]: status === ITEM_STATUS.ESCALATED,
                            [`${CN}__awaiting-status`]: status === ITEM_STATUS.AWAITING,
                        })}
                    >
                        {status}
                    </Text>
                );
            }
        },
        {
            key: 'EMAIL',
            name: 'Email',
            minWidth: 60,
            maxWidth: 80,
            data: 'string',
            className: `${CN}__cell-email`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: LinkAnalysisItem) => {
                const email = isMrItem(item)
                    ? item.item?.purchase?.user?.email
                    : item.email;

                return (
                    this.renderEmailWithIcon(email, item.userRestricted, `userRestricted:${item.userRestricted}`)
                );
            }
        }
    ];

    private onRenderRow: IDetailsListProps['onRenderRow'] = props => {
        const { isSelectable } = this.props;

        const customStyles: Partial<IDetailsRowStyles> = {};
        if (props) {
            let isDisabled = false;
            let selectionMode = SelectionMode.multiple;

            if (isMrItem(props.item)) {
                isDisabled = !props.item.availableForLabeling;
            }

            if (isDisabled) {
                customStyles.root = { backgroundColor: '#F3F2F1' };
                selectionMode = SelectionMode.none;
            }

            // eslint-disable-next-line react/jsx-props-no-spreading
            return <DetailsRow {...props} styles={customStyles} selectionMode={isSelectable ? selectionMode : SelectionMode.none} />;
        }
        return null;
    };

    @autobind
    handleSelectionChange() {
        const { onSelectionChanged } = this.props;

        onSelectionChanged(this.selection.getSelection() as LinkAnalysisItem[]);
    }

    @autobind
    handelLoadMoreClick() {
        const { onLoadMoreClick } = this.props;

        onLoadMoreClick();
    }

    renderEmailWithIcon(value: any, userRestricted?: boolean, tooltipText?: string | JSX.Element) {
        return (
            <IconText
                text={value || null}
                textVariant="smallPlus"
                title={value}
                placeholder="N/A"
                iconValue={userRestricted}
                icons={{
                    GOOD: {
                        value: false,
                        iconName: 'CompletedSolid',
                        tooltipText
                    },
                    BAD: {
                        value: true,
                        iconName: 'WarningSolid',
                        tooltipText
                    },
                }}
            />
        );
    }

    renderLoadMoreBtn() {
        const { canLoadMore, isLoading } = this.props;

        if (!canLoadMore) {
            return null;
        }

        return (
            <button
                type="button"
                className={`${CN}__load_more_orders`}
                onClick={() => this.handelLoadMoreClick()}
                disabled={isLoading}
            >
                {
                    isLoading
                        ? <Spinner />
                        : <Text variant="medium">{`Load ${DEFAULT_LINK_ANALYSIS_ITEMS_PER_PAGE} more orders`}</Text>
                }
            </button>
        );
    }

    renderLoader(): JSX.Element {
        return (
            <div className={`${CN}__center-aligned`}>
                <Spinner label="Loading items..." />
            </div>
        );
    }

    render() {
        const { data, wasFirstPageLoaded, isSelectable } = this.props;

        if (!data.length && !wasFirstPageLoaded) {
            this.selection.setAllSelected(false);
            return this.renderLoader();
        }

        if (isSelectable) {
            return (
                <>
                    <DetailsList
                        columns={this.columns}
                        className={cx(CN)}
                        selection={this.selection}
                        items={data || []}
                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                        onRenderRow={this.onRenderRow}
                    />
                    { data.length > 0 && this.renderLoadMoreBtn() }
                </>
            );
        }

        return (
            <>
                <DetailsList
                    columns={this.columns}
                    selectionMode={SelectionMode.none}
                    className={cx(CN)}
                    items={data || []}
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    onRenderRow={this.onRenderRow}
                />
                { data.length > 0 && this.renderLoadMoreBtn() }
            </>
        );
    }
}
