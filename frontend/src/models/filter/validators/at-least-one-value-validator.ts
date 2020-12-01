// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ConditionValidator } from '../condition-validator';
import { ValidationResult } from '../validation-result';

export class AtLeastOneValueValidator extends ConditionValidator {
    validate(values: string[]) {
        const result: ValidationResult = {
            isValid: false,
            errorMessage: this.errorMessage
        };

        const [leftValue, rightValue] = values;

        if (!rightValue) {
            result.isValid = this.validateSingleValue(leftValue);
            return result;
        }
        result.isValid = this.validateMultiValues(values);
        return result;
    }

    validateSingleValue(value: string) {
        return !!value && value.length >= 1;
    }

    validateMultiValues(values: string[]) {
        return values.length >= 1;
    }
}
