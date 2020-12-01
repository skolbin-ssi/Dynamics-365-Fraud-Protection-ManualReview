// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import {
    action, computed, observable, reaction
} from 'mobx';

import { TYPES } from '../../types';
import { DictionaryApiService, QueueService, SettingsService } from '../../data-services/interfaces';
import { DICTIONARY_TYPE } from '../../constants';
import { FILTER_MUTATION_TYPE, FilterField } from '../../models/filter/filter-field';
import { ConcreteConditionFactory } from '../../models/filter/condition-factory';
import { compareStringsInAscendingOrder } from '../../utils/comparators';
import { FilterContextualMenuItem } from '../../models/filter/selectable-options';
import { FilterConditionDto } from '../../data-services/api-services/models/settings/filter-condition-dto';

export enum FILTER_MUTATION_STATE {
    UPDATE = 'UPDATE',
    CREATE = 'CREATE'
}

/**
 * Describes entity interface for categorized filters,
 * collected (distributed) by its category.
 */
export interface CategoryFilters {
    /**
     * category - name of the category
     */
    category: string;

    /**
     * filters - filters belonging to the category
     */
    filters: FilterField[];

    /**
     * contextualMenuItems - contextual menu items,
     * for displaying available filters in category
     */
    contextualMenuItems: FilterContextualMenuItem[];
}

@injectable()
export class FiltersStore {
    /**
     * selectedFilter - selected filter from the dropdown
     * main categories menu options(sub-items) or
     * selected filter from filter summary section,
     * that is display in modal window
     */
    @observable
    selectedFilter: FilterField | null = null;

    @observable
    filterFields: FilterField[] | null = null;

    @observable
    mutatedFilters: FilterField[] = [];

    @observable
    isCriteriaModalOpen = false;

    conditionsFactory = new ConcreteConditionFactory();

    constructor(
        @inject(TYPES.SETTINGS_SERVICE) private settingsService: SettingsService,
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService,
        @inject(TYPES.DICTIONARY_API_SERVICE) private readonly dictionaryApiService: DictionaryApiService,
    ) {
        this.filterFields = settingsService.getFilters();
    }

    /**
     * Subscribes passed callback function to changes into mutated filters array.
     *
     * @param callbackFn - subscriber callback function that will be
     * executed each time when any change happens to the mutated filter array.
     *
     * @returns - IReaction disposer function, that should be disposed
     * when callback triggering in not needed any more.
     */
    subscribeToMutationFiltersChanges(callbackFn: (mutatedFilters: FilterConditionDto[]) => void) {
        return reaction(() => this.filtersDTOs, callbackFn);
    }

    selectFilter(id: string, filterAction: FILTER_MUTATION_STATE) {
        let selectedFilter: FilterField | null = null;

        if (filterAction === FILTER_MUTATION_STATE.CREATE) {
            selectedFilter = this.createFilter(id);

            if (selectedFilter) {
                selectedFilter.setSortIndex(this.highestFilterSortIndex);
            }
        }

        if (filterAction === FILTER_MUTATION_STATE.UPDATE) {
            selectedFilter = this.selectFilterFromMutatedFilters(id);

            if (selectedFilter) {
                selectedFilter.setMutationType(FILTER_MUTATION_TYPE.UPDATE);
            }
        }

        if (selectedFilter) {
            this.setSelectedFilter(selectedFilter);
            this.openCriteriaModal();
        }
    }

    handleSelectedMenuFilterFromSubMenu(filterId: string | undefined) {
        if (filterId) {
            this.selectFilter(filterId, FILTER_MUTATION_STATE.CREATE);
        }
    }

    @action
    createUpdateFilter() {
        if (this.selectedFilter) {
            const isFilterNotUsed = !this.selectedFilter.isFilterUsed;

            if (isFilterNotUsed) {
                this.selectedFilter.setIsFilterUsed(true);
                this.mutatedFilters = [...this.mutatedFilters, this.selectedFilter];
            }

            if (this.selectedFilter.mutationType === FILTER_MUTATION_TYPE.UPDATE) {
                if (this.isFilterHasUsedConditions(this.selectedFilter)) {
                    const updatedFilters = this.getUpdatedFilters(this.selectedFilter);
                    this.mutatedFilters = [...updatedFilters];
                } else {
                    this.removeFilter(this.selectedFilter.id);
                }
            }
        }

        this.closeCriteriaModal();
        this.clearSelectedFilter();
    }

    /**
     * Replace modified selected filter in mutated filters
     *
     * @param selectedFiler - filter that is currently selected
     */
    getUpdatedFilters(selectedFiler: FilterField) {
        const searchedFilter = this.getFilter(selectedFiler.id, this.mutatedFilters);

        return this.mutatedFilters.map(mutatedFilter => {
            if (searchedFilter) {
                if (mutatedFilter.id === searchedFilter.id) {
                    return selectedFiler;
                }
            }

            return mutatedFilter;
        });
    }

    @action
    updateFilter(id: string) {
        this.selectFilter(id, FILTER_MUTATION_STATE.UPDATE);
    }

    @action
    removeFilter(id: string) {
        this.markFilterAsUnUsed(id);
        const filteredResult = this.mutatedFilters.filter(filter => filter.id !== id);

        this.mutatedFilters = [...filteredResult];
    }

    @action
    removeCategory(category: string) {
        const filteredResult = this.mutatedFilters.filter(filter => {
            if (filter.category !== category) {
                return true;
            }

            this.markFilterAsUnUsed(filter.id);
            return false;
        });

        this.mutatedFilters = [...filteredResult];
    }

    @computed
    get highestFilterSortIndex() {
        let incrementedIndex = 0;

        const filterWithHighestSortIndex = this.sortedMutatedFiltersBySortIndex
            .slice()
            .pop();

        if (filterWithHighestSortIndex) {
            incrementedIndex = filterWithHighestSortIndex.sortIndex + 1;
        }

        return incrementedIndex;
    }

    @computed
    get sortedMutatedFiltersBySortIndex() {
        return this.mutatedFilters
            .sort((prev, next) => prev.sortIndex - next.sortIndex);
    }

    @computed
    get categorizedMutatedFilters(): CategoryFilters[] {
        return this.getUniqCategoryList(this.mutatedFilters)
            .map(category => {
                const createdFilters = this
                    .mutatedFilters
                    .filter(mutatedFilter => mutatedFilter.category === category);

                const contextualMenuItems = this
                    .getFiltersByCategory(category)
                    .map(filter => filter.asContextualMenuItem)
                    .slice()
                    .sort((prev, next) => compareStringsInAscendingOrder(prev.text, next.text));

                return {
                    category,
                    filters: createdFilters,
                    contextualMenuItems
                };
            });
    }

    /**
     * @returns FilterField[] - filters array without its related category
     * sorted by sort index
     */
    @computed
    get unCategorizedSortedMutatedFilters() {
        return this.categorizedMutatedFilters
            .map(filterGroup => filterGroup.filters)
            .flat()
            .slice()
            .sort((prev, next) => prev.sortIndex - next.sortIndex);
    }

    /**
     * Get all available categories for filter fields and filter fields
     * as a sub-menu items for each category
     */
    @computed
    get categoriesFiltersListAsContextualMenuItems(): FilterContextualMenuItem[] {
        if (this.filterFields) {
            const uniqCategoryList = this.getUniqCategoryList(this.filterFields);

            return uniqCategoryList.map(category => {
                const subFilters = this.getFiltersByCategory(category);
                const subItems = this.getAllFiltersAsContextualMenuItems(subFilters);

                return {
                    key: category,
                    text: category,
                    disabled: this.isAllFiltersUsed(subFilters),
                    subMenuProps: {
                        items: subItems,
                        onItemClick: (e, item) => {
                            if (item) {
                                this.handleSelectedMenuFilterFromSubMenu(item.key);
                            }
                        }
                    }
                };
            });
        }

        return [];
    }

    async getDictionaryValues(filterId: string, query: string) {
        try {
            const response = await this.dictionaryApiService.getDictionaryValues(filterId, query);
            return response.data;
        } catch (e) {
            return [];
        }
    }

    /**
     * Filters store has a filterFields separately from mutated filter fields array,
     * that why when mutated filters are set to the filters store externally
     * it is needed to update filters fields in order to indicate what filter has been used,
     * for the reason of correct disabling contextual menu item and sub-items.
     *
     * @see categoriesFiltersListAsContextualMenuItems
     */
    @action
    setUsedFilterFields(filterField: FilterField[]) {
        if (this.filterFields) {
            filterField.forEach(filter => {
                const searchedFilter = this.getFilter(filter.id, this.filterFields!);

                if (searchedFilter) {
                    searchedFilter.setIsFilterUsed(true);
                }
            });
        }
    }

    postDictionaryValues(filterId: string, value: string) {
        return this.dictionaryApiService.postDictionaryValues(DICTIONARY_TYPE.USER_COUNTRY, value);
    }

    @action
    setSelectedFilter(filter: FilterField) {
        this.selectedFilter = filter;
    }

    @action
    closeCriteriaModal() {
        this.isCriteriaModalOpen = false;
    }

    @action
    openCriteriaModal() {
        this.isCriteriaModalOpen = true;
    }

    /**
     * STORE CLEARING ACTIONS
     */
    @action
    clearStore() {
        this.clearMutatedFilters();
        this.clearSelectedFilter();
    }

    @action
    clearMutatedFilters() {
        this.mutatedFilters = [];
    }

    @action
    clearSelectedFilter() {
        this.selectedFilter = null;
    }

    @action
    resetFilterFields() {
        this.filterFields = [...this.settingsService.getFilters()];
    }

    @action
    setMutatedFilters(filterFields: FilterField[]) {
        this.mutatedFilters = [...filterFields];
    }

    @action
    setMutatedFiltersWithSortIndex(filterFields: FilterField[]) {
        this.mutatedFilters = [...filterFields].map((filter, index) => {
            filter.setSortIndex(index);
            return filter;
        });
    }

    private markFilterAsUnUsed(id: string) {
        if (this.filterFields) {
            const filter = this.getFilter(id, this.filterFields);

            if (filter) {
                filter.setIsFilterUsed(false);
                filter.setSortIndex(0);
            }
        }
    }

    private createFilter(id: string) {
        const selectedFilter = this.selectFilterFromFilterFields(id);

        if (selectedFilter) {
            selectedFilter.setMutationType(FILTER_MUTATION_TYPE.CREATE);
            selectedFilter.createConditions(this.conditionsFactory);

            return selectedFilter;
        }

        return null;
    }

    private selectFilterFromFilterFields(id: string) {
        if (this.filterFields) {
            return this.filterFields.find(filter => filter.id === id) || null;
        }

        return null;
    }

    private selectFilterFromMutatedFilters(id: string) {
        const mutatedFilter = this.mutatedFilters.find(filter => filter.id === id) || null;

        if (mutatedFilter) {
            return new FilterField()
                .fromOld(mutatedFilter, this.conditionsFactory);
        }

        return null;
    }

    private getFiltersByCategory(category: string) {
        if (this.filterFields) {
            return this.filterFields.filter(filterField => filterField.category === category);
        }

        return [];
    }

    /**
     * Returns array of contextual menu items from passed filters
     * sorted in alphabetical order
     *
     * @param filters
     */
    private getAllFiltersAsContextualMenuItems(filters: FilterField[]) {
        return filters.map(filter => filter.asContextualMenuItem)
            .slice()
            .sort((prev, next) => compareStringsInAscendingOrder(prev.text, next.text));
    }

    /**
     * Returns uniq categories among all passed filter fields
     * sorted in alphabetical order
     *
     * @param filterFields - filter fields
     */
    private getUniqCategoryList(filterFields: FilterField[]): string[] {
        const uniqCategoriesList = new Set(filterFields.map(filterField => filterField.category));

        return Array.from(uniqCategoriesList)
            .slice()
            .sort(compareStringsInAscendingOrder.bind(this));
    }

    /**
     * Checks if all filters has been created and field.
     *
     * If all filter has been created and field, then filter's
     * top category should be disabled
     *
     * @param filters
     */
    private isAllFiltersUsed(filters: FilterField[]) {
        return filters.every(filter => filter.isFilterUsed);
    }

    private isFilterHasUsedConditions(filter: FilterField) {
        return !!filter.usedFilterConditions.length;
    }

    private getFilter(id: string, filters: FilterField[]) {
        return filters.find(filter => filter.id === id);
    }

    /**
     * Converts in-memory filters to filters condition DTOs
     *
     * @returns - array of FilterConditionDTO
     */
    @computed
    private get filtersDTOs() {
        return this.mutatedFilters
            .filter(filter => filter.isFilterUsed)
            .map(filter => filter.filterConditionsToDTOs)
            .flat();
    }
}
