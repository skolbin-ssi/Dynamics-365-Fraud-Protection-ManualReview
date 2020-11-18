// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

import { CommandBarButton, IconButton } from '@fluentui/react/lib/Button';
import { FilterTile } from '../../../screens/queues/create-edit-queue/filter-tile';
import { FilterField } from '../../../models/filter/filter-field';
import { FilterContextualMenuItem } from '../../../models/filter/selectable-options';

import './filter-summary.scss';

interface FilterSummaryComponentProps {
    contextualMenuItems: FilterContextualMenuItem[];
    category: string;
    filters: FilterField[];
    isDisabled: boolean;
    onTileClick(id: string): void;
    onTileRemoveClick(id: string): void;
    onRemoveCategoryClick(category: string): void;
    onCriteriaDropdownChange(id: string): void;
}
const CN = 'filter-summary';

@observer
export class FilterSummary extends Component<FilterSummaryComponentProps, never> {
    @autobind
    handleRemoveCategoryClick() {
        const { category, onRemoveCategoryClick } = this.props;

        onRemoveCategoryClick(category);
    }

    @autobind
    handleCriteriaDropdownChange(item: FilterContextualMenuItem | undefined) {
        const { onCriteriaDropdownChange } = this.props;
        if (item) {
            onCriteriaDropdownChange(item.key);
        }
    }

    renderFilterTiles() {
        const {
            filters, onTileRemoveClick, onTileClick, isDisabled
        } = this.props;

        return filters.map(filter => (
            <FilterTile
                isDisabled={isDisabled}
                key={filter.id}
                filter={filter}
                onTileClick={onTileClick}
                onTileRemoveClick={onTileRemoveClick}
            />
        ));
    }

    render() {
        const { category, contextualMenuItems, isDisabled } = this.props;

        return (
            <div className={CN}>
                <div className={`${CN}__header`}>
                    <div className={`${CN}__header-title`}>{category}</div>
                    {!isDisabled && (
                        <IconButton
                            className={`${CN}__delete-button`}
                            onClick={this.handleRemoveCategoryClick}
                            iconProps={{
                                iconName: 'Delete'
                            }}
                        />
                    )}
                </div>
                <div className={`${CN}__filter-tiles`}>
                    {this.renderFilterTiles()}
                </div>
                {!isDisabled && (
                    <div>
                        <CommandBarButton
                            className={`${CN}__context-menu`}
                            text="Add criteria"
                            iconProps={{ iconName: 'Add' }}
                            menuProps={{
                                items: contextualMenuItems,
                                onItemClick: (_, item) => this.handleCriteriaDropdownChange(item as FilterContextualMenuItem)
                            }}
                        />
                    </div>
                )}
            </div>
        );
    }
}
