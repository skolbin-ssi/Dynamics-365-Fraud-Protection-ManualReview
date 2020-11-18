// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import cx from 'classnames';

import { IconButton } from '@fluentui/react/lib/Button';

import { FilterField } from '../../../../models/filter/filter-field';

import './filter-tile.scss';

interface ConditionTileComponentProps {
    /**
     * isDisabled - Indicates whether tile is active,
     * if true, filter tile is not clickable
     * and background is changed
     */
    isDisabled?: boolean;
    filter: FilterField;
    onTileClick(id: string): void;
    onTileRemoveClick(is: string): void
}
const CN = 'filter-tile';

@observer
export class FilterTile extends Component<ConditionTileComponentProps, never> {
    @autobind
    handleTileClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const { filter: { id }, onTileClick, isDisabled } = this.props;

        if (isDisabled) {
            return;
        }

        onTileClick(id);
        event.stopPropagation();
    }

    @autobind
    handleTileRemoveClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const { filter: { id }, onTileRemoveClick, isDisabled } = this.props;

        if (isDisabled) {
            return;
        }

        onTileRemoveClick(id);
        event.stopPropagation();
    }

    renderSeparator() {
        return <span className={`${CN}__separator`}>,</span>;
    }

    renderConditions() {
        const { filter: { sortedUsedConditionsBySortIndex } } = this.props;

        return sortedUsedConditionsBySortIndex
            .map((condition, index, arr) => {
                const lastIndex = arr.length - 1;

                const separator = !(index === lastIndex)
                    && this.renderSeparator();

                return (
                    <div
                        key={condition.asTextCondition}
                        title={condition.asTextCondition}
                        className={`${CN}__condition`}
                    >
                        {condition.asTextCondition}
                        {separator}
                    </div>
                );
            });
    }

    render() {
        const { filter, isDisabled } = this.props;

        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
            <div
                key={filter.id}
                className={cx(CN, { [`${CN}--disabled`]: isDisabled })}
                onClick={this.handleTileClick}
            >
                <div className={`${CN}__container`}>
                    <div className={`${CN}__name`}>
                        {filter.displayName}
                    </div>
                    <div className={`${CN}__conditions`}>
                        {this.renderConditions()}
                    </div>
                </div>
                {!isDisabled && (
                    <IconButton
                        disabled={isDisabled}
                        className={`${CN}__delete-btn`}
                        onClick={this.handleTileRemoveClick}
                        iconProps={{
                            className: `${CN}__delete-icon`,
                            iconName: 'Cancel'
                        }}
                    />
                )}
            </div>
        );
    }
}
