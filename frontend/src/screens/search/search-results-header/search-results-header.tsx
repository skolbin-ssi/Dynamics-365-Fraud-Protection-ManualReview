// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';

import { Text } from '@fluentui/react/lib/Text';
import { Pivot, PivotItem, PivotLinkFormat, } from '@fluentui/react/lib/Pivot';

import { CSVLink } from 'react-csv';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { ITEM_SORTING_FIELD, SORTING_ORDER } from '../../../constants';
import { ItemSortSettingsDTO } from '../../../data-services/api-services/models';
import './search-results-header.scss';
import { CSVData } from '../../../utility-services/csv-data-builder';

const CN = 'search-results-header';

export interface QueueHeaderProps {
    searchResultsCount: number;
    sortingObject?: ItemSortSettingsDTO;
    handleSortingUpdate?: (sortingObject: ItemSortSettingsDTO) => void;
    wasFirstPageLoaded: boolean;
    csvData: CSVData[];
}

@observer
export class SearchResultsHeader extends Component<QueueHeaderProps, never> {
    private sortFieldOptions: IDropdownOption[] = [
        { text: 'Fraud score', key: ITEM_SORTING_FIELD.SCORE },
        { text: 'Import date', key: ITEM_SORTING_FIELD.IMPORT_DATE },
        { text: 'Amount', key: ITEM_SORTING_FIELD.TOTAL_AMOUNT },
        { text: 'Analyst', key: ITEM_SORTING_FIELD.LABEL_AUTHOR_ID },
    ];

    @autobind
    onSortOrderChange(option?: PivotItem) {
        const { sortingObject, handleSortingUpdate } = this.props;
        if (!handleSortingUpdate) return;

        const key = option?.props.itemKey;
        const updatedSorting = {
            field: sortingObject?.field || ITEM_SORTING_FIELD.IMPORT_DATE,
            order: key === SORTING_ORDER.ASC
                ? SORTING_ORDER.ASC
                : SORTING_ORDER.DESC,
        };

        handleSortingUpdate(updatedSorting);
    }

    @autobind
    onSortFieldChange(event: React.FormEvent, option?: IDropdownOption) {
        const { sortingObject, handleSortingUpdate } = this.props;
        if (!handleSortingUpdate) return;

        const key = option?.key as ITEM_SORTING_FIELD;

        if (key) {
            const updatedSorting = {
                field: key,
                order: sortingObject?.order || SORTING_ORDER.DESC
            };

            handleSortingUpdate(updatedSorting);
        }
    }

    renderSorting() {
        const { searchResultsCount, sortingObject } = this.props;

        if (!searchResultsCount) return null;

        return (
            <div className={`${CN}__sorting`}>
                <Dropdown
                    className={`${CN}__sort-field`}
                    dropdownWidth={100}
                    label="Sort by:"
                    options={this.sortFieldOptions}
                    defaultSelectedKey={sortingObject?.field || ITEM_SORTING_FIELD.IMPORT_DATE}
                    onChange={this.onSortFieldChange}
                />
                <Pivot
                    className={`${CN}__sort-order`}
                    linkFormat={PivotLinkFormat.tabs}
                    defaultSelectedKey={sortingObject?.order || SORTING_ORDER.DESC}
                    onLinkClick={this.onSortOrderChange}
                >
                    <PivotItem
                        itemKey={SORTING_ORDER.ASC}
                        itemIcon="GroupedAscending"
                    />
                    <PivotItem
                        itemKey={SORTING_ORDER.DESC}
                        itemIcon="GroupedDescending"
                    />
                </Pivot>
            </div>
        );
    }

    render() {
        const {
            handleSortingUpdate,
            searchResultsCount,
            wasFirstPageLoaded,
            csvData
        } = this.props;

        if (!wasFirstPageLoaded) return null;

        return (
            <div className={CN}>
                <div className={`${CN}__title-wrapper`}>
                    <Text variant="large" className={`${CN}__title`}>Search results</Text>
                    <Text variant="large" className={`${CN}__count`}>
                        {' '}
                        (
                        {searchResultsCount}
                        )
                    </Text>
                </div>
                {handleSortingUpdate ? this.renderSorting() : null}
                { csvData?.length > 0
                    && (
                        <CSVLink
                            filename="searchResult.csv"
                            data={csvData}
                        >
                            <DefaultButton
                                className={`${CN}__button`}
                                text="Download"
                                iconProps={{ iconName: 'DownloadDocument' }}
                            />
                        </CSVLink>
                    )}
            </div>
        );
    }
}
