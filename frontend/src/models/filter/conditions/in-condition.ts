// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    action, computed
} from 'mobx';

import { ITag } from '@fluentui/react/lib/Pickers';

import {
    ACCEPTABLE_CONDITIONS,
    FILTER_VALIDATOR_TYPES,
} from '../../../constants';
import { Condition } from '../condition';
import { FilterValidatorFactory } from '../validator-factory';
import { ConditionConstraints } from '../condition-constraints';
import { getConditionDisplayNameFormatter } from '../factories';

export class InCondition extends Condition {
    conditionValidatorTypes = [
        FILTER_VALIDATOR_TYPES.AT_LEAST_ONE_VALUE
    ];

    constructor(
        validatorFactory: FilterValidatorFactory,
        condition: ACCEPTABLE_CONDITIONS,
        constraints: ConditionConstraints
    ) {
        super(validatorFactory, condition, constraints);
        this.createValidators();
    }

    @action
    setValue(value: string) {
        if (!this.values.includes(value)) {
            this.values = [...this.values, value];
        }
    }

    @action
    setValues(values: string[]) {
        this.values = [...values];
    }

    validate() {
        const validationResults = this.validators.map(validator => validator.validate(this.values));
        this.setIsValidBasedOnValidationResult(validationResults);

        return validationResults;
    }

    // TODO: Move to an abstract class
    @computed
    get asTextCondition() {
        const formatter = getConditionDisplayNameFormatter(this.id);

        if (formatter) {
            return formatter(this.values);
        }

        return '';
    }

    @computed
    get mappedValuesToTags(): ITag[] {
        if (this.values) {
            return this.values.map(value => ({ name: value, key: value }));
        }

        return [];
    }
}
