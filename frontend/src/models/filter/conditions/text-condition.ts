// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    action
} from 'mobx';

import { Condition } from '../condition';
import { FilterValidatorFactory } from '../validator-factory';
import {
    ACCEPTABLE_CONDITIONS,
    FILTER_VALIDATOR_TYPES
} from '../../../constants';
import { ConditionConstraints } from '../condition-constraints';

export class TextCondition extends Condition {
    conditionValidatorTypes: FILTER_VALIDATOR_TYPES[] = [
        FILTER_VALIDATOR_TYPES.AT_LEAST_ONE_VALUE
    ];

    values = [''];

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
        const validationResults = this.validators.map(validator => validator.validate(this.values));

        this.setIsValidBasedOnValidationResult(validationResults);

        return validationResults;
    }
}
