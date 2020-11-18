// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import cx from 'classnames';

import { Callout } from '@fluentui/react/lib/Callout';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { TextField } from '@fluentui/react/lib/TextField';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { ITag } from '@fluentui/react/lib/Pickers';
import { IPersonaProps } from '@fluentui/react/lib/Persona';

import { FilterContextMenu, UniqueTagPicker, UserPicker } from '../../../components';
import { FilterContextualMenuItem } from '../../../models/filter/selectable-options';
import { LABEL_NAMES } from '../../../constants';
import { ItemSearchQueryDTO } from '../../../data-services/api-services/models';

import { Queue } from '../../../models';
import './search-criteria-form.scss';

const CN = 'search-criteria-form';

export interface SearchCriteriaFormProps {
    filterContextualMenuItems: FilterContextualMenuItem[]
    searchQuery: ItemSearchQueryDTO,
    queueSuggestions: Queue[];
    tagSuggestions: string[];
    personaSuggestions: IPersonaProps[];
    handleSearchQueryUpdate: (searchQuery: ItemSearchQueryDTO | null) => void;
    handleSearchButtonClick: () => void;
    composeSearchSummary: (searchQuery: ItemSearchQueryDTO) => string;
    areSearchParametersSetToDefault: boolean;
}

interface SearchCriteriaFormState {
    isCriteriaCalloutVisible: boolean;
}

enum SEARCH_IN_OPTIONS {
    ALL = 'all',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

@observer
export class SearchCriteriaForm extends Component<SearchCriteriaFormProps, SearchCriteriaFormState> {
    private searchInOptions: IDropdownOption[] = [
        { text: 'All orders', key: SEARCH_IN_OPTIONS.ALL },
        { text: 'Only active', key: SEARCH_IN_OPTIONS.ACTIVE, data: true },
        { text: 'Only inactive', key: SEARCH_IN_OPTIONS.INACTIVE, data: false },
    ];

    private labelOptions: ITag[] = Object.entries(LABEL_NAMES)
        .map(([key, name]) => ({ key, name }));

    constructor(props: SearchCriteriaFormProps) {
        super(props);

        this.state = {
            isCriteriaCalloutVisible: false
        };
    }

    @autobind
    onSearchInChange(event: React.FormEvent, dropdownOption?: IDropdownOption) {
        const { searchQuery, handleSearchQueryUpdate } = this.props;

        const updatedSearchQueryObj = {
            ...searchQuery,
            active: dropdownOption?.data
        };

        if (dropdownOption?.key === SEARCH_IN_OPTIONS.ALL) {
            delete updatedSearchQueryObj.active;
        }

        handleSearchQueryUpdate(updatedSearchQueryObj);
    }

    @autobind
    onOrderIdsChange(event: React.FormEvent, newValue?: string) {
        const { searchQuery, handleSearchQueryUpdate } = this.props;

        const ids: string[] = [];
        newValue?.split(',').forEach(id => {
            const trimmedId = id.trim();
            if (trimmedId) {
                ids.push(trimmedId);
            }
        });

        const updatedSearchQueryObj = { ...searchQuery, ids };

        if (!ids.length) {
            delete updatedSearchQueryObj.ids;
        }

        handleSearchQueryUpdate(updatedSearchQueryObj);
    }

    @autobind
    onSelectionChange<T>(
        searchQueryKey: keyof ItemSearchQueryDTO,
        selectedItemKey: keyof T,
        selectedItems: T[],
    ) {
        const {
            searchQuery,
            handleSearchQueryUpdate,
        } = this.props;

        const value: string[] = selectedItems.map(item => `${item[selectedItemKey]}`);

        const updatedSearchQueryObj: ItemSearchQueryDTO = {
            ...searchQuery,
            [searchQueryKey]: value
        };

        if (!value.length) {
            delete updatedSearchQueryObj[searchQueryKey];
        }

        handleSearchQueryUpdate(updatedSearchQueryObj);
    }

    @autobind
    toggleSearchCriteria() {
        const { isCriteriaCalloutVisible } = this.state;
        this.setState({
            isCriteriaCalloutVisible: !isCriteriaCalloutVisible
        });
    }

    renderSearchCriteria() {
        const {
            searchQuery,
            queueSuggestions,
            tagSuggestions,
            personaSuggestions,
        } = this.props;
        const { isCriteriaCalloutVisible } = this.state;
        const {
            active,
            ids,
            queueIds,
            labels,
            labelAuthorIds,
            lockOwnerIds,
            holdOwnerIds,
            tags,
        } = searchQuery || {};
        const searchIn = this.searchInOptions.find(option => option.data === active);
        const orderIdsValue: string = (ids || []).join(', ');

        return isCriteriaCalloutVisible
            ? (
                <Callout
                    className={`${CN}__expandable-aria`}
                    target={`.${CN}__search-field`}
                    isBeakVisible={false}
                    gapSpace={9}
                    onDismiss={this.toggleSearchCriteria}
                >
                    <Dropdown
                        className={`${CN}__field`}
                        label="Search in"
                        options={this.searchInOptions}
                        defaultSelectedKey={searchIn?.key || SEARCH_IN_OPTIONS.ALL}
                        onChange={this.onSearchInChange}
                        dropdownWidth={367}
                    />
                    <TextField
                        className={`${CN}__field`}
                        label="Order IDs"
                        onChange={this.onOrderIdsChange}
                        defaultValue={orderIdsValue}
                        title="Order IDs should be separated with commas"
                        multiline
                        rows={1}
                        resizable={false}
                        autoAdjustHeight
                    />
                    <UniqueTagPicker
                        className={`${CN}__field`}
                        label="Queues"
                        suggestions={(queueSuggestions || []).map(queue => queue.asTag)}
                        selectedItemIds={queueIds || []}
                        onSelectionChange={updatedQueues => this.onSelectionChange<ITag>(
                            'queueIds',
                            'key',
                            updatedQueues
                        )}
                        suggestionsHeaderText="Suggested queues"
                        noResultsFoundText="No queues found"
                    />
                    <UserPicker
                        className={`${CN}__field`}
                        label="Lock owners"
                        suggestions={personaSuggestions}
                        selectedUserIds={lockOwnerIds || []}
                        onSelectionChange={updatedUsers => this.onSelectionChange<IPersonaProps>(
                            'lockOwnerIds',
                            'id',
                            updatedUsers
                        )}
                    />
                    <UserPicker
                        className={`${CN}__field`}
                        label="Hold owners"
                        suggestions={personaSuggestions}
                        selectedUserIds={holdOwnerIds || []}
                        onSelectionChange={updatedUsers => this.onSelectionChange<IPersonaProps>(
                            'holdOwnerIds',
                            'id',
                            updatedUsers
                        )}
                    />
                    <UniqueTagPicker
                        className={`${CN}__field`}
                        label="Decision labels"
                        suggestions={this.labelOptions}
                        selectedItemIds={labels || []}
                        suggestionsHeaderText="Suggested labels"
                        noResultsFoundText="No labels found"
                        onSelectionChange={updatedLabels => this.onSelectionChange<ITag>(
                            'labels',
                            'key',
                            updatedLabels
                        )}
                    />
                    <UserPicker
                        className={`${CN}__field`}
                        label="Decision authors"
                        suggestions={personaSuggestions}
                        selectedUserIds={labelAuthorIds || []}
                        onSelectionChange={updatedUsers => this.onSelectionChange<IPersonaProps>(
                            'labelAuthorIds',
                            'id',
                            updatedUsers
                        )}
                    />
                    <UniqueTagPicker
                        className={`${CN}__field`}
                        label="Tags"
                        suggestions={tagSuggestions.map(name => ({ name, key: name }))}
                        selectedItemIds={tags || []}
                        suggestionsHeaderText="Suggested tags"
                        noResultsFoundText="No tags found"
                        onSelectionChange={updatedTags => this.onSelectionChange<ITag>(
                            'tags',
                            'key',
                            updatedTags
                        )}
                    />
                </Callout>
            )
            : null;
    }

    render() {
        const {
            searchQuery,
            handleSearchQueryUpdate,
            handleSearchButtonClick,
            composeSearchSummary,
            areSearchParametersSetToDefault,
            filterContextualMenuItems
        } = this.props;

        const searchSummary = searchQuery ? composeSearchSummary(searchQuery) : 'Search';

        return (
            <div className={CN}>
                <TextField
                    className={`${CN}__search-field`}
                    placeholder="Search"
                    iconProps={{ iconName: 'ChevronDownMed' }}
                    onClick={this.toggleSearchCriteria}
                    value={searchSummary}
                    readOnly
                />
                <FilterContextMenu
                    items={filterContextualMenuItems}
                    className={cx(
                        `${CN}__filters-menu`,
                        `${CN}__button`
                    )}
                    buttonText="Add filters"
                />
                <PrimaryButton
                    className={`${CN}__button`}
                    text="Search"
                    onClick={() => handleSearchButtonClick()}
                />
                <DefaultButton
                    className={`${CN}__button`}
                    text="Reset"
                    iconProps={{ iconName: 'Cancel' }}
                    disabled={areSearchParametersSetToDefault}
                    onClick={() => handleSearchQueryUpdate(null)}
                />
                {this.renderSearchCriteria()}
            </div>
        );
    }
}
