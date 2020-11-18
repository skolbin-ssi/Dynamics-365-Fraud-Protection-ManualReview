// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action } from 'mobx';
import {
    ACCEPTABLE_CONDITIONS,
    FILTER_VALIDATOR_TYPES,
} from '../../../constants';
import { Condition } from '../condition';
import { FilterValidatorFactory } from '../validator-factory';
import { ConditionConstraints } from '../condition-constraints';
import { ValidationResult } from '../validation-result';

export enum BETWEEN_CONDITION_FIELD_TYPES {
    MIN = 'MIN',
    MAX = 'MAX'
}

export class BetweenNumericCondition extends Condition {
    conditionValidatorTypes = [
        FILTER_VALIDATOR_TYPES.MIN_EXISTS,
        FILTER_VALIDATOR_TYPES.MAX_EXISTS,
        FILTER_VALIDATOR_TYPES.MIN_LESS_THAN_MAX,
        FILTER_VALIDATOR_TYPES.LOWER_BOUND_CONSTRAINT,
        FILTER_VALIDATOR_TYPES.UPPER_BOUND_CONSTRAINT
    ];

    values = ['0', '0'];

    constructor(
        validatorFactory: FilterValidatorFactory,
        condition: ACCEPTABLE_CONDITIONS,
        constraints: ConditionConstraints
    ) {
        super(validatorFactory, condition, constraints);
        this.createValidators();
    }

    @action
    createValidators() {
        this.validators = this
            .conditionValidatorTypes
            .map(validatorType => this.validatorFactory
                .createValidator(validatorType, this.constraints));
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

        const validationResult: ValidationResult[] = [];
        const minValidationResult = this.validateValue(FILTER_VALIDATOR_TYPES.MIN_EXISTS, min);
        const maxValidationResult = this.validateValue(FILTER_VALIDATOR_TYPES.MAX_EXISTS, max);
        const minLessThanMaxResult = this
            .validateValue(FILTER_VALIDATOR_TYPES.MIN_LESS_THAN_MAX, this.values);
        const lowerBoundValidationResult = this.validateValue(FILTER_VALIDATOR_TYPES.LOWER_BOUND_CONSTRAINT, min);
        const upperBoundValidationResult = this.validateValue(FILTER_VALIDATOR_TYPES.UPPER_BOUND_CONSTRAINT, max);

        [
            minValidationResult,
            maxValidationResult,
            minLessThanMaxResult,
            lowerBoundValidationResult,
            upperBoundValidationResult
        ]
            .forEach(result => {
                if (result) {
                    validationResult.push(result);
                }
            });

        this.setIsValidBasedOnValidationResult(validationResult);

        return validationResult;
    }

    private validateValue(type: FILTER_VALIDATOR_TYPES, values: string | string[]) {
        const validator = this.getValidator(type);
        const valueToValidate = Array.isArray(values) ? values : [values];

        if (validator) {
            return validator.validate(valueToValidate);
        }

        return null;
    }

    private getValidator(type: FILTER_VALIDATOR_TYPES) {
        return this.validators.find(validator => validator.type === type);
    }
}
