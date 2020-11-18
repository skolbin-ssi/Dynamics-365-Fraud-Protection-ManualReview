// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed, observable } from 'mobx';
import { ACCEPTABLE_CONDITIONS } from '../../constants';
import { ConditionsFactory } from './condition-factory';
import { Condition } from './condition';
import { ConditionConstraints } from './condition-constraints';
import { FilterFieldDto } from '../../data-services/api-services/models/settings';
import { FilterConditionDto } from '../../data-services/api-services/models/settings/filter-condition-dto';
import { compareStringsInAscendingOrder } from '../../utils/comparators';
import { ConditionContextualMenuItem, FilterContextualMenuItem } from './selectable-options';

export enum FILTER_MUTATION_TYPE {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE'
}

export class FilterField {
    id = '';

    category = '';

    displayName = '';

    @observable
    acceptableConditions: ACCEPTABLE_CONDITIONS[] = [];

    description = '';

    lowerBound: string | null = null;

    upperBound: string | null = null;

    @observable
    conditions: Condition[] = [];

    @observable
    mutatedConditions: Condition[] = [];

    /**
     * isFilterUsed - indicates whether some of filter's
     * conditions has been field
     */
    @observable
    isFilterUsed = false;

    @observable
    mutationType: FILTER_MUTATION_TYPE | null = null;

    @observable
    isFilterDisabled = false;

    @observable
    sortIndex = 0;

    @action
    fromOld(filter: FilterField, conditionFactory: ConditionsFactory) {
        const newFilter = Object.assign(this, filter);

        const conditions = this.createConditionFromOld(filter.conditions, conditionFactory);
        newFilter.setConditions(conditions);

        return newFilter;
    }

    fromDto(filterFieldDto: FilterFieldDto) {
        const {
            id,
            displayName,
            acceptableConditions,
            category,
            description,
            lowerBound,
            upperBound
        } = filterFieldDto;

        this.id = id;
        this.category = category;
        this.displayName = displayName;
        this.acceptableConditions = acceptableConditions as Array<ACCEPTABLE_CONDITIONS>;
        this.description = description;
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;

        return this;
    }

    @action
    createConditions(conditionsFactory: ConditionsFactory) {
        const createdConditions: Condition[] = [];

        if (this.acceptableConditions.length) {
            this.acceptableConditions.forEach(condition => {
                const newCondition = conditionsFactory
                    .createCondition(condition, this.validationConstraints);

                if (newCondition) {
                    createdConditions.push(newCondition);
                }
            });

            const sortedConditions = createdConditions
                .slice()
                .sort((prev, next) => compareStringsInAscendingOrder(prev.displayName, next.displayName));

            this.conditions = this.useFirstConditionByDefault(sortedConditions);
        }
    }

    @action
    createConditionFromOld(conditions: Condition[], conditionsFactory: ConditionsFactory) {
        return conditions.map(condition => conditionsFactory
            .createCondition(condition.id, this.validationConstraints)
            .fromOld(condition));
    }

    @action
    private useFirstConditionByDefault(conditions: Condition[]) {
        const modifiedConditions = [...conditions];
        const FIRST_CONDITION_INDEX = 0;
        const DEFAULT_CONDITION_SORT_ORDER_INDEX = 0;

        if (conditions.length > 0) {
            const firstCondition = modifiedConditions[FIRST_CONDITION_INDEX] || null;

            if (firstCondition) {
                firstCondition.setSortIndex(DEFAULT_CONDITION_SORT_ORDER_INDEX);
                firstCondition.setIsConditionUsed(true);
            }
        }

        return modifiedConditions;
    }

    @computed
    get highestConditionOrderSortIndex() {
        let incrementedIndex: number | undefined;

        const conditionWithHighestOrderIndex = this.sortedUsedConditionsBySortIndex
            .slice()
            .pop();

        if (conditionWithHighestOrderIndex) {
            incrementedIndex = conditionWithHighestOrderIndex.orderSortIndex + 1;
        }

        return incrementedIndex;
    }

    @computed
    get sortedConditionsByDisplayName() {
        return this.conditions
            .slice()
            .sort((prev, next) => compareStringsInAscendingOrder(prev.displayName, next.displayName));
    }

    /**
     * Returns used conditions for the filter
     * sorted by condition's order index
     * (in order defined by a user)
     */
    @computed
    get sortedUsedConditionsBySortIndex() {
        return this.conditions
            .filter(condition => condition.isConditionUsed)
            .slice()
            .sort((prev, next) => prev.orderSortIndex - next.orderSortIndex);
    }

    @computed
    get conditionsAsDropdownOptions() {
        return this.sortedConditionsByDisplayName
            .map(condition => condition.asDropdownOption);
    }

    @computed
    get conditionsAsContextualMenuItems(): ConditionContextualMenuItem[] {
        return this.sortedConditionsByDisplayName
            .map(condition => condition.asContextualMenuItem);
    }

    @computed
    get asContextualMenuItem(): FilterContextualMenuItem {
        return {
            key: this.id,
            text: this.displayName,
            disabled: this.isFilterUsed
        };
    }

    @computed
    private get validationConstraints(): ConditionConstraints {
        return {
            lowerBound: this.lowerBound,
            upperBound: this.upperBound,
        };
    }

    @action
    setIsFilterUsed(isUsed: boolean) {
        this.isFilterUsed = isUsed;
    }

    /**
     * Checks whether filter used conditions are valid
     * - if there are any of used conditions returns false
     *
     * @returns - true/false
     */
    @computed
    get isFilterUsedConditionsAreValid() {
        const usedConditions = this.conditions.filter(condition => condition.isConditionUsed);

        if (this.mutationType === FILTER_MUTATION_TYPE.CREATE) {
            if (!usedConditions.length) {
                return false;
            }
        }

        return usedConditions.every(usedCondition => usedCondition.isValid);
    }

    getFilterCondition(conditionId: string) {
        return this.conditions.find(condition => condition.id === conditionId);
    }

    /**
     * Returns all used filter's conditions
     */
    @computed
    get usedFilterConditions() {
        return this.sortedConditionsByDisplayName
            .filter(condition => condition.isConditionUsed);
    }

    /**
     * Mutates filter conditions
     *
     * @param conditions - conditions to mutate
     * @param isConditionEnabled - toggle state for condition true / false
     * @returns - Condition[] - mutated conditions with disabled state
     */
    @action
    setFilterConditionsEnableState(conditions: Condition[], isConditionEnabled: boolean) {
        return conditions.map(condition => condition.setIsDisabled(isConditionEnabled));
    }

    @action
    setMutationType(type: FILTER_MUTATION_TYPE) {
        this.mutationType = type;
    }

    @computed
    get filterConditionsToDTOs(): FilterConditionDto[] {
        return this.conditions
            .filter(condition => condition.isConditionUsed && condition.isValid)
            .map(condition => condition.toDto(this.id));
    }

    /**
     * Checks if every used condition in filter is valid
     */
    @computed
    get areUsedConditionsValid() {
        return this.conditions
            .filter(condition => condition.isConditionUsed)
            .every(condition => condition.isValid);
    }

    @action
    setConditions(conditions: Condition[]) {
        this.conditions = conditions;
    }

    @action
    setIsFilterDisabled(isDisabled: boolean) {
        this.isFilterDisabled = isDisabled;
    }

    @action
    setSortIndex(index: number) {
        this.sortIndex = index;
    }
}
