// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './results-data-table.scss';

import autobind from 'autobind-decorator';
import cx from 'classnames';
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import { IconButton } from '@fluentui/react/lib/Button';
import { FontIcon } from '@fluentui/react/lib/Icon';

import { BatchLabelItemsResult } from '../../../../../../models/item';

interface ResultsDataTableProps {
    items: BatchLabelItemsResult[]
}

const CN = 'results-data-table';

@observer
export class ResultsDataTable extends Component<ResultsDataTableProps, never> {
    static renderErrorIcon() {
        return (
            <FontIcon
                iconName="ErrorBadge"
                className={`${CN}__error-icon`}
            />
        );
    }

    static renderSuccessIcon() {
        return (
            <FontIcon
                iconName="Completed"
                className={`${CN}__success-icon`}
            />
        );
    }

    @autobind
    handleCopyButtonClick(orderId: string) {
        navigator.clipboard.writeText(orderId || '');
    }

    renderAnalysisResultRow(item: BatchLabelItemsResult) {
        const icon = item.success
            ? ResultsDataTable.renderSuccessIcon()
            : ResultsDataTable.renderErrorIcon();

        const messageClassNameModifier = item.success
            ? 'success'
            : 'error';

        return (
            <div className={`${CN}__row`}>
                <div className={`${CN}__row-icon`}>{icon}</div>
                <div className={`${CN}__row-wrap`}>
                    <div
                        title={item.reason}
                        className={cx(`${CN}__message`, `${CN}__message-${messageClassNameModifier}`)}
                    >
                        {item.reason}
                    </div>
                    <div className={`${CN}__result-item-id-cell`}>
                        <div className={`${CN}__result-item-id`}>{`#${item.itemId}`}</div>
                        <IconButton
                            className={`${CN}__copy-button`}
                            iconProps={{ iconName: 'Copy' }}
                            title="Copy"
                            onClick={() => this.handleCopyButtonClick(item.itemId)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { items } = this.props;

        return (
            <div className={CN}>
                <div className={`${CN}__header`}>
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
                    <div
                        className={cx(`${CN}__sort-column`, `${CN}__heading`)}
                        onClick={() => {}}
                    >
                        <div>Decisions status</div>
                        <FontIcon iconName="SortUp" />
                    </div>
                    <div className={`${CN}__heading`}>Purchase ID</div>
                </div>
                {items.map(item => this.renderAnalysisResultRow(item))}
            </div>
        );
    }
}
