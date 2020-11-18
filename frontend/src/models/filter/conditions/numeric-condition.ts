// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    action
} from 'mobx';
import {
    ACCEPTABLE_CONDITIONS,
    FILTER_VALIDATOR_TYPES,
} from '../../../constants';
import { FilterValidatorFactory } from '../validator-factory';
import { Condition } from '../condition';
import { ConditionConstraints } from '../condition-constraints';

export class NumericCondition extends Condition {
    conditionValidatorTypes: FILTER_VALIDATOR_TYPES[] = [
        FILTER_VALIDATOR_TYPES.AT_LEAST_ONE_VALUE,
        FILTER_VALIDATOR_TYPES.LOWER_BOUND_CONSTRAINT,
        FILTER_VALIDATOR_TYPES.UPPER_BOUND_CONSTRAINT
    ];

    values = ['0'];

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
            .map(validator => this.validatorFactory.createValidator(validator, this.constraints));
    }

    @action
    setValue(value: string) {
        this.values = [value];
    }

    validate() {
        const validationResults = this.validators
            .map(validator => validator.validate(this.values));

        this.setIsValidBasedOnValidationResult(validationResults);

        return validationResults;
    }
}
