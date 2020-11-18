// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action } from 'mobx';
import { Condition } from '../condition';
import {
    ACCEPTABLE_CONDITIONS,
    FILTER_VALIDATOR_TYPES,
} from '../../../constants';
import { FilterValidatorFactory } from '../validator-factory';
import { ConditionConstraints } from '../condition-constraints';

export class BetweenTextCondition extends Condition {
    conditionValidatorTypes: FILTER_VALIDATOR_TYPES[] = [
        FILTER_VALIDATOR_TYPES.MIN_EXISTS,
        FILTER_VALIDATOR_TYPES.MAX_EXISTS,
    ];

    values = ['', ''];

    constructor(
        validatorFactory: FilterValidatorFactory,
        condition: ACCEPTABLE_CONDITIONS,
        constraints: ConditionConstraints
    ) {
        super(validatorFactory, condition, constraints);
        this.createValidators();
    }

    @action
    setMinimalValue(minimalValue: string) {
        const maxValue = this.values[1] || '';

        this.values = [minimalValue, maxValue];
    }

    @action
    setMaximalValue(maximalValue: string) {
        const min = this.values[0] || '';

        this.values = [min, maximalValue];
    }

    validate() {
        const [min, max] = this.values;

        const validationResult = [];
        const minValidationResult = this.validateValue(FILTER_VALIDATOR_TYPES.MIN_EXISTS, min);
        const maxValidationResult = this.validateValue(FILTER_VALIDATOR_TYPES.MAX_EXISTS, max);

        if (minValidationResult) {
            validationResult.push(minValidationResult);
        }

        if (maxValidationResult) {
            validationResult.push(maxValidationResult);
        }

        this.setIsValidBasedOnValidationResult(validationResult);

        return validationResult;
    }

    private validateValue(type: FILTER_VALIDATOR_TYPES, value: string) {
        const validator = this.getValidator(type);
        if (validator) {
            return validator.validate([value]);
        }

        return null;
    }

    private getValidator(type: FILTER_VALIDATOR_TYPES) {
        return this.validators.find(validator => validator.type === type);
    }
}
