// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* eslint-disable max-classes-per-file */
import { observable, computed } from 'mobx';
import {
    QUEUE_ITEMS_FIELD,
    FILTER_VALIDATOR_TYPES,
    FILTER_VALIDATOR_ERRORS,
    FILTER_VALUE_CONSTRAINTS
} from '../constants';

export abstract class FilterValidator {
    type: FILTER_VALIDATOR_TYPES | null = null;

    errorMessage: string = '';

    constraints: any = null;

    filterField: QUEUE_ITEMS_FIELD | null | string = null;

    @observable
    filterValues: string[] = [];

    abstract isPassed: boolean;

    constructor(type: FILTER_VALIDATOR_TYPES, field: QUEUE_ITEMS_FIELD | string, values: string[]) {
        this.type = type;
        this.filterField = field;
        this.filterValues = values;
        this.constraints = FILTER_VALUE_CONSTRAINTS.get(field as QUEUE_ITEMS_FIELD);
        this.errorMessage = FILTER_VALIDATOR_ERRORS.get(type) || '';
    }
}

class MinConstraintValidator extends FilterValidator {
    @computed
    get isPassed() {
        const value = this.filterValues[0];
        if (value === '' || !Array.isArray(this.constraints) || !this.constraints[0]) {
            return true;
        }
        return +value >= this.constraints[0];
    }
}

class MaxConstraintValidator extends FilterValidator {
    @computed
    get isPassed() {
        const value = this.filterValues[1];
        if (value === '' || !Array.isArray(this.constraints) || !this.constraints[1]) {
            return true;
        }
        return +value <= this.constraints[1];
    }
}

class MinExistsValidator extends FilterValidator {
    @computed
    get isPassed() {
        return this.filterValues[0] !== '';
    }
}

class MaxExistsValidator extends FilterValidator {
    @computed
    get isPassed() {
        return this.filterValues[1] !== '';
    }
}

class MinLessThanMaxValidator extends FilterValidator {
    @computed
    get isPassed() {
        const [min, max] = this.filterValues;
        if (min === '' || max === '') {
            return true;
        }
        return +min <= +max;
    }
}

class AtLeastOneValueValidator extends FilterValidator {
    @computed
    get isPassed() {
        return this.filterValues.length >= 1;
    }
}

class FilterValidatorFactory {
    create(type: FILTER_VALIDATOR_TYPES, field: QUEUE_ITEMS_FIELD | string, values: string[]): FilterValidator {
        switch (type) {
            case FILTER_VALIDATOR_TYPES.MIN_CONSTRAINT:
                return new MinConstraintValidator(type, field, values);
            case FILTER_VALIDATOR_TYPES.MAX_CONSTRAINT:
                return new MaxConstraintValidator(type, field, values);
            case FILTER_VALIDATOR_TYPES.MIN_EXISTS:
                return new MinExistsValidator(type, field, values);
            case FILTER_VALIDATOR_TYPES.MAX_EXISTS:
                return new MaxExistsValidator(type, field, values);
            case FILTER_VALIDATOR_TYPES.MIN_LESS_THAN_MAX:
                return new MinLessThanMaxValidator(type, field, values);
            case FILTER_VALIDATOR_TYPES.AT_LEAST_ONE_VALUE:
                return new AtLeastOneValueValidator(type, field, values);
            default:
                throw new Error(`Validator of type: ${type} doesn't exist`);
        }
    }
}

export const filterValidatorFactory = new FilterValidatorFactory();
/* eslint-disable max-classes-per-file */
