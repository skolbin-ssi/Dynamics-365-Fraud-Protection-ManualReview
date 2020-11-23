// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { action, observable } from 'mobx';
import { Condition } from '../condition';

export class BooleanCondition extends Condition {
    @observable
    values = ['false'];

    @action
    setValue(isChecked: boolean) {
        this.values = [`${isChecked}`];
    }

    /**
     * This condition doesn't require validation
     * it can be only true/false, otherwise it must'nt be chosen
     */
    validate() {
        this.setIsValid(true);
        return [];
    }
}
