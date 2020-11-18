// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';

import { FilterTile } from '../../queues/create-edit-queue/filter-tile';
import { FilterField } from '../../../models/filter/filter-field';

import './search-filters-summary.scss';

interface SearchFiltersSummaryComponentProps {
    filters: FilterField[];
    onTileClick(id: string): void;
    onTileRemoveClick(id: string): void;
}
const CN = 'search-filters-summary';

export class SearchFiltersSummary extends Component<SearchFiltersSummaryComponentProps, never> {
    renderFilterTiles() {
        const {
            filters, onTileRemoveClick, onTileClick
        } = this.props;

        return filters.map(filter => (
            <FilterTile
                key={filter.id}
                filter={filter}
                onTileClick={onTileClick}
                onTileRemoveClick={onTileRemoveClick}
            />
        ));
    }

    render() {
        return (
            <div className={CN}>
                {this.renderFilterTiles()}
            </div>
        );
    }
}
