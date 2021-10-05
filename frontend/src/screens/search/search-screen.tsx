// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './search-screen.scss';

import autobind from 'autobind-decorator';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { disposeOnUnmount, observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Spinner } from '@fluentui/react/lib/Spinner';

import SearchIllustrationSvg from '../../assets/search-illustration.svg';
import { ErrorContent } from '../../components/error-content';
import { CriteriaModal } from '../../components/filters';
import { ItemsDetailsList } from '../../components/items-details-list';
import {
    ITEM_SORTING_FIELD,
    ROUTES,
    SORTING_ORDER,
} from '../../constants';
import { ItemSearchQueryDTO, ItemSortSettingsDTO } from '../../data-services/api-services/models';
import { FilterConditionDto } from '../../data-services/api-services/models/settings/filter-condition-dto';
import { TYPES } from '../../types';
import { readUrlSearchQueryOptions, stringifyIntoUrlQueryString } from '../../utility-services';
import { FiltersStore } from '../../view-services/essence-mutation-services/filters-store';
import { SearchScreenStore } from '../../view-services/search';
import { SearchCriteriaForm } from './search-criteria-form';
import { SearchFiltersSummary } from './search-filters-summary';
import { SearchResultsHeader } from './search-results-header';
import { getFormattedData } from '../../utility-services/csv-data-builder';

export interface SearchScreenRouteParams {
    searchId?: string;
}

export type SearchScreenProps = RouteComponentProps<SearchScreenRouteParams>;

const CN = 'search-screen';

@observer
export class SearchScreen extends Component<SearchScreenProps, never> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.SEARCH_SCREEN_STORE)
    private searchScreenStore!: SearchScreenStore;

    @resolve(TYPES.FILTERS_STORE)
    private filtersStore!: FiltersStore;

    async componentDidMount() {
        this.parseURLAndUpdateStore();

        await this.searchScreenStore.loadQueues();
        await this.searchScreenStore.loadTags();

        if (this.searchScreenStore.searchId) {
            await this.searchScreenStore.loadSearchQueryParams();
            this.setFiltersToFilterStore();
        }

        if (this.searchScreenStore.searchId && this.searchScreenStore.searchQuery) {
            await this.searchScreenStore.searchItems();
        }

        disposeOnUnmount(
            this,
            this.filtersStore.subscribeToMutationFiltersChanges(this.updateFiltersSearchQueryObject)
        );
    }

    componentWillUnmount() {
        this.searchScreenStore.clearSearchId();
        this.searchScreenStore.updateSearchQueryObject({});
        this.searchScreenStore.clearItems();
        this.searchScreenStore.resetSortingToDefault();
    }

    @autobind
    async onSearchButtonClick() {
        await this.searchScreenStore.createSearchQuery();

        if (this.searchScreenStore.searchId && this.searchScreenStore.searchQuery) {
            this.updateURL();
            await this.searchScreenStore.searchItems();
        }
    }

    @autobind
    onLoadMoreRows() {
        this.searchScreenStore.searchItems(true);
    }

    /**
     * Set search query object existing filters into filters store
     * mutated filters, initialing applied filters to the search
     */
    @autobind
    setFiltersToFilterStore() {
        const { searchQuery, filtersBuilder } = this.searchScreenStore;

        if (searchQuery.itemFilters?.length) {
            const buildFiltersField = filtersBuilder.getPopulatedFilterFields(searchQuery.itemFilters);

            this.filtersStore.setUsedFilterFields(buildFiltersField);
            this.filtersStore.setMutatedFiltersWithSortIndex([...buildFiltersField]);
        }
    }

    @autobind
    handleCloseModal() {
        this.filtersStore.closeCriteriaModal();
    }

    @autobind
    handleOnCreateUpdateFilter() {
        this.filtersStore.createUpdateFilter();
    }

    @autobind
    handleFilterTileClick(filterId: string) {
        this.filtersStore.updateFilter(filterId);
    }

    @autobind
    handleRemoveFilterClick(filterId: string) {
        this.filtersStore.removeFilter(filterId);
    }

    @autobind
    updateSearchQueryObject(updatedSearchQuery: ItemSearchQueryDTO | null) {
        if (updatedSearchQuery) {
            this.searchScreenStore.updateSearchQueryObject(updatedSearchQuery);
        } else {
            this.searchScreenStore.updateSearchQueryObject({});
            this.searchScreenStore.resetSortingToDefault();
            this.filtersStore.clearStore();
            this.filtersStore.resetFilterFields();
        }

        this.searchScreenStore.clearSearchId();
        this.searchScreenStore.clearItems();
        this.updateURL();
    }

    /**
     * Updates search query object, when any mutations is performed on
     * mutated filters in filters store
     *
     * @param itemFilters - mutated filters as DTO conditions from filters store
     */
    @autobind
    updateFiltersSearchQueryObject(itemFilters: FilterConditionDto[]) {
        const { searchQuery } = this.searchScreenStore;

        const updatedSearchQuery: ItemSearchQueryDTO = {
            ...searchQuery,
            itemFilters
        };

        if (!itemFilters.length) {
            delete updatedSearchQuery.itemFilters;
        }

        this.updateSearchQueryObject(updatedSearchQuery);
    }

    @autobind
    updateSorting(updatedSorting: ItemSortSettingsDTO) {
        this.searchScreenStore.updateSorting(updatedSorting);
        this.updateURL();
        this.searchScreenStore.searchItems();
    }

    parseURLAndUpdateStore() {
        const { match: { params }, location: { search: query } } = this.props;

        const { searchId } = params;

        if (searchId) {
            this.searchScreenStore.setSearchId(searchId);
        }

        const queryObj = readUrlSearchQueryOptions(query, { sortingField: true, sortingOrder: true });

        if (queryObj.sortingField) {
            this.searchScreenStore.updateSorting({
                field: queryObj.sortingField as ITEM_SORTING_FIELD,
                order: queryObj.sortingOrder as SORTING_ORDER || SORTING_ORDER.DESC,
            });
        }
    }

    updateURL() {
        const { searchId, sorting } = this.searchScreenStore;
        const { field, order } = sorting;

        let path: string = searchId
            ? ROUTES.build.search(searchId)
            : ROUTES.SEARCH_NEW;

        const queryString = field
            ? stringifyIntoUrlQueryString({
                sortingField: field,
                sortingOrder: order || SORTING_ORDER.DESC,
            })
            : null;

        if (queryString) {
            path += `?${queryString}`;
        }

        this.history.replace(path);
    }

    renderCriteriaModal() {
        const { isCriteriaModalOpen, selectedFilter } = this.filtersStore;

        return selectedFilter && (
            <CriteriaModal
                filter={selectedFilter}
                onCreateUpdateFilter={this.handleOnCreateUpdateFilter}
                onModalClose={this.handleCloseModal}
                isModalOpen={isCriteriaModalOpen}
            />
        );
    }

    renderPlaceholder(): JSX.Element | null {
        const { tags, queueStore } = this.searchScreenStore;

        if (!(tags && queueStore.queues)) {
            return null;
        }

        return (
            <div className={`${CN}__center-aligned`}>
                <ErrorContent
                    illustrationSvg={SearchIllustrationSvg}
                    message=""
                />
            </div>
        );
    }

    renderSearchFiltersSummary() {
        const { unCategorizedSortedMutatedFilters } = this.filtersStore;
        const isMutatedFiltersExists = !!unCategorizedSortedMutatedFilters.length;

        return isMutatedFiltersExists && (
            <SearchFiltersSummary
                filters={unCategorizedSortedMutatedFilters}
                onTileClick={this.handleFilterTileClick}
                onTileRemoveClick={this.handleRemoveFilterClick}
            />
        );
    }

    renderSearchCriteriaForm(): JSX.Element | null {
        const {
            tags, queueStore
        } = this.searchScreenStore;
        const { categoriesFiltersListAsContextualMenuItems } = this.filtersStore;

        return tags && queueStore.queues
            ? (
                <div className={`${CN}__search-form`}>
                    <SearchCriteriaForm
                        filterContextualMenuItems={categoriesFiltersListAsContextualMenuItems}
                        searchQuery={this.searchScreenStore.searchQuery}
                        queueSuggestions={this.searchScreenStore.queueStore.queues || []}
                        tagSuggestions={this.searchScreenStore.tags || []}
                        personaSuggestions={this.searchScreenStore.personas}
                        handleSearchQueryUpdate={this.updateSearchQueryObject}
                        handleSearchButtonClick={this.onSearchButtonClick}
                        composeSearchSummary={this.searchScreenStore.composeSearchSummary}
                        areSearchParametersSetToDefault={this.searchScreenStore.areSearchParametersSetToDefault}
                    />
                    {this.renderSearchFiltersSummary()}
                </div>
            )
            : (this.renderLoader());
    }

    renderLoader() {
        const { items, wasFirstPageLoaded } = this.searchScreenStore;

        if (!items.length && !wasFirstPageLoaded) {
            return null;
        }

        return (
            <div className={`${CN}__center-aligned`}>
                <Spinner label="Loading..." />
            </div>
        );
    }

    renderSearchResults(): JSX.Element | null {
        const { searchId, searchQuery } = this.searchScreenStore;
        return searchId && searchQuery
            ? (
                <div
                    className={`${CN}__search-results`}
                    data-is-scrollable="true"
                >
                    <SearchResultsHeader
                        searchResultsCount={this.searchScreenStore.items.length}
                        wasFirstPageLoaded={this.searchScreenStore.wasFirstPageLoaded}
                        csvData={this.searchScreenStore ? getFormattedData(this.searchScreenStore, this.searchScreenStore.queueStore) : []}
                    />
                    <div className={`${CN}__item-details-wrapper`}>
                        <ItemsDetailsList
                            queueStore={this.searchScreenStore.queueStore}
                            storeForItemsLoading={this.searchScreenStore}
                            handleLoadMoreRowsClick={this.onLoadMoreRows}
                            sortingObject={this.searchScreenStore.sorting}
                            searchId={searchId}
                            handleSortingUpdate={this.updateSorting}
                            loadingMessage="Searching the orders..."
                            noItemsMessage="No results found. Try adjusting your search or filters to find what you are looking for."
                        />
                    </div>
                </div>
            )
            : this.renderPlaceholder();
    }

    render() {
        return (
            <>
                <div className={CN}>
                    {this.renderSearchCriteriaForm()}
                    {this.renderSearchResults()}
                </div>
                {this.renderCriteriaModal()}
            </>
        );
    }
}
