// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { FILTER_VALIDATOR_ERRORS, FILTER_VALIDATOR_TYPES } from '../../constants';
import { ConditionConstraints } from './condition-constraints';
import { ValidationResult } from './validation-result';

export abstract class ConditionValidator {
    type: FILTER_VALIDATOR_TYPES | null = null;

    protected constraints?: ConditionConstraints;

    errorMessage: string = '';

    abstract validate(values: string[]): ValidationResult;

    constructor(type: FILTER_VALIDATOR_TYPES, constrains?: ConditionConstraints) {
        this.type = type;
        this.constraints = constrains;
        this.errorMessage = FILTER_VALIDATOR_ERRORS.get(type)!;
    }
}
