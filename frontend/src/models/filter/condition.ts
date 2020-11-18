// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    action, computed, observable
} from 'mobx';

import {
    ACCEPTABLE_CONDITIONS,
    DISPLAY_ACCEPTABLE_CONDITIONS,
    FILTER_VALIDATOR_TYPES,
} from '../../constants';
import { FilterValidatorFactory } from './validator-factory';
import { ConditionValidator } from './condition-validator';
import { ValidationResult } from './validation-result';
import { ConditionConstraints } from './condition-constraints';
import { ConditionContextualMenuItem, ConditionDropdownOption } from './selectable-options';
import { FilterConditionDto } from '../../data-services/api-services/models/settings/filter-condition-dto';
import { getConditionDisplayNameFormatter } from './factories';

export abstract class Condition {
    conditionValidatorTypes: FILTER_VALIDATOR_TYPES[] = [];

    id: ACCEPTABLE_CONDITIONS;

    @observable
    values: string[] = [];

    displayName: string;

    @observable
    validators: ConditionValidator[] = [];

    validatorFactory: FilterValidatorFactory;

    @observable
    constraints: ConditionConstraints;

    @observable
    isConditionUsed = false;

    @observable
    isValid = false;

    @observable
    isDisabled = false;

    /**
     * Ordered index for condition
     *
     * Used when we need to save the order of
     * created conditions, (user defines the
     * order by selecting conditions from the dropdown)
     */
    @observable
    orderSortIndex = 0;

    abstract validate(): ValidationResult[];

    constructor(
        validatorFactory: FilterValidatorFactory,
        condition: ACCEPTABLE_CONDITIONS,
        constrains: ConditionConstraints
    ) {
        this.id = condition;
        this.constraints = constrains;
        this.validatorFactory = validatorFactory;
        this.displayName = this.getConditionDisplayText(condition);
    }

    @action
    createValidators() {
        this.validators = this
            .conditionValidatorTypes
            .map(validatorType => this.validatorFactory.createValidator(validatorType, this.constraints));
    }

    @action
    setIsConditionUsed(isUsed: boolean = true) {
        this.isConditionUsed = isUsed;
    }

    @action
    setIsValid(isValid: boolean) {
        this.isValid = isValid;
    }

    @action
    setIsValidBasedOnValidationResult(validationResult: ValidationResult[]) {
        this.isValid = validationResult.every(result => result.isValid);
    }

    @action
    setIsDisabled(isDisabled: boolean) {
        this.isDisabled = isDisabled;
        return this;
    }

    @action
    setSortIndex(index: number) {
        this.orderSortIndex = index;
    }

    @computed
    get asDropdownOption(): ConditionDropdownOption {
        return {
            key: this.id,
            text: this.displayName,
            disabled: this.isConditionUsed
        };
    }

    @computed
    get asContextualMenuItem(): ConditionContextualMenuItem {
        return {
            key: this.id,
            text: this.displayName,
            disabled: this.isConditionUsed
        };
    }

    @computed
    get asTextCondition() {
        const formatter = getConditionDisplayNameFormatter(this.id);

        if (formatter) {
            return formatter(this.values);
        }

        return '';
    }

    /**
     * Computed field with param
     * @param filterId
     */
    toDto(filterId: string) {
        return computed(() => ({
            values: this.values,
            field: filterId,
            condition: this.id
        } as FilterConditionDto),
        { name: 'toDto' })
            .get();
    }

    fromDto(conditionDTO: FilterConditionDto) {
        const {
            condition,
            values
        } = conditionDTO;
        this.id = condition;
        this.displayName = this.getConditionDisplayText(condition);
        this.values = values;

        return this;
    }

    private getConditionDisplayText(condition: ACCEPTABLE_CONDITIONS) {
        return DISPLAY_ACCEPTABLE_CONDITIONS[condition] || 'Unknown';
    }

    @action
    fromOld(condition: Condition) {
        return Object.assign(this, condition);
    }
}
