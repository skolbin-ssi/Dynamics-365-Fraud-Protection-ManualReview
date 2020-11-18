// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ConditionValidator } from '../condition-validator';
import { ValidationResult } from '../validation-result';

export class UpperBoundConstraintValidator extends ConditionValidator {
    validate(values: string[]) {
        const bound = this.constraints!.upperBound;
        const result: ValidationResult = {
            isValid: false,
            errorMessage: `${this.errorMessage} ${this.constraints!.upperBound}`
        };

        if (!bound) {
            result.isValid = true;
            return result;
        }

        const [leftValue, rightValue] = values;

        if (!rightValue) {
            result.isValid = this.validateValue(leftValue, bound);
            return result;
        }

        result.isValid = this.validateValue(rightValue, bound);
        return result;
    }

    validateValue(value: string, bound: string | null) {
        if (Number.isNaN(Number(value)) || Number.isNaN(Number(bound))) {
            return false;
        }

        return Number(value) <= Number(bound);
    }
}
