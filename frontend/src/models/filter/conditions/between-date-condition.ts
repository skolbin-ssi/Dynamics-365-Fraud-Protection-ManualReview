// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, computed } from 'mobx';
import { Condition } from '../condition';
import { formatToISOStringWithLocalTimeZone, formatToLocaleDateString } from '../../../utils/date';
import { ValidationResult } from '../validation-result';
import { FILTER_VALIDATOR_ERRORS, FILTER_VALIDATOR_TYPES } from '../../../constants';
import { getConditionDisplayNameFormatter } from '../factories';

export class BetweenDateCondition extends Condition {
    @action
    setMinimalValue(date: Date | undefined) {
        const maxDate = this.values[1];
        const minDateAsString = formatToISOStringWithLocalTimeZone(date);

        this.values = [minDateAsString, maxDate];
    }

    @action
    setMaximalValue(date: Date | undefined) {
        const minDate = this.values[0];
        const maxDateAsString = formatToISOStringWithLocalTimeZone(date);

        this.values = [minDate, maxDateAsString];
    }

    validate() {
        const [minDate, maxDate] = this.values;

        const minValidationResult: ValidationResult = {
            isValid: !!minDate,
            errorMessage: FILTER_VALIDATOR_ERRORS.get(FILTER_VALIDATOR_TYPES.MIN_EXISTS)
        };

        const maxValidationResult: ValidationResult = {
            isValid: !!maxDate,
            errorMessage: FILTER_VALIDATOR_ERRORS.get(FILTER_VALIDATOR_TYPES.MAX_EXISTS)
        };

        const validationsResult = [minValidationResult, maxValidationResult];
        this.setIsValidBasedOnValidationResult(validationsResult);

        return validationsResult;
    }

    @computed
    get asTextCondition() {
        const formatter = getConditionDisplayNameFormatter(this.id);
        const [min, max] = this.values;

        const minFormatted = formatToLocaleDateString(min, '') as string;
        const maxFormatted = formatToLocaleDateString(max, '') as string;

        if (minFormatted && maxFormatted) {
            return formatter([minFormatted, maxFormatted]);
        }

        return formatter(['', '']);
    }
}
