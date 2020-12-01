// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ConditionValidator } from '../condition-validator';

export class MinLessThanMaxValidator extends ConditionValidator {
    validate(values: string[]) {
        const [min, max] = values;
        const isValid = +min <= +max!;

        return {
            isValid,
            errorMessage: this.errorMessage
        };
    }
}
