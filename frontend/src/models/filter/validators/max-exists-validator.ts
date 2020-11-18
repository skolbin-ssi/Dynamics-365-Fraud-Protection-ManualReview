// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ConditionValidator } from '../condition-validator';

export class MaxExistsValidator extends ConditionValidator {
    validate([value]: string[]) {
        const isValid = value !== '';

        return isValid
            ? { isValid }
            : { isValid, errorMessage: this.errorMessage, value };
    }
}
