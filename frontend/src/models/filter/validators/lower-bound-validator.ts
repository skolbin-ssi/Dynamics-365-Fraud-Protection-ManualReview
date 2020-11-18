// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ConditionValidator } from '../condition-validator';

export class LowerBoundConstraintValidator extends ConditionValidator {
    validate([value]: string[]) {
        const bound = this.constraints!.lowerBound;

        const isValid = Number(value) >= Number(bound);

        return isValid
            ? { isValid }
            : {
                isValid,
                errorMessage: `${this.errorMessage} ${this.constraints!.lowerBound}`,
                value
            };
    }
}
