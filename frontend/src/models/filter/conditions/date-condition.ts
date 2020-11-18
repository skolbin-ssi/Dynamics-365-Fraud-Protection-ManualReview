// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    action, computed
} from 'mobx';
import { Condition } from '../condition';
import { formatToISOStringWithLocalTimeZone, formatToLocaleDateString } from '../../../utils/date';
import {
    FILTER_VALIDATOR_ERRORS,
    FILTER_VALIDATOR_TYPES,
} from '../../../constants';
import { getConditionDisplayNameFormatter } from '../factories';

export class DateCondition extends Condition {
    @action
    setValue(date: Date) {
        this.values = [formatToISOStringWithLocalTimeZone(date)];
    }

    validate() {
        const [date] = this.values;
        const isValid = !!date;

        this.setIsValid(isValid);

        return [{
            isValid,
            errorMessage: FILTER_VALIDATOR_ERRORS.get(FILTER_VALIDATOR_TYPES.AT_LEAST_ONE_VALUE)
        }];
    }

    @computed
    get asTextCondition() {
        const formatter = getConditionDisplayNameFormatter(this.id);
        const [value] = this.values;

        const formattedValue = formatToLocaleDateString(value, '') as string;

        if (formattedValue) {
            return formatter([formattedValue]);
        }

        return formatter(['', '']);
    }
}
