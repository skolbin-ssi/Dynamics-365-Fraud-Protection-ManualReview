// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { parse, Duration } from 'iso8601-duration';
import { computed, observable } from 'mobx';

import { TimeMetricDto } from '../../data-services/api-services/models/dashboard';

export class TimeMetric implements TimeMetricDto {
    internalDecisionsAmount = 0;

    internalDecisionsApplyingDuration = '';

    notWastedAmount = 0;

    notWastedDuration = '';

    resolutionAmount = 0;

    resolutionApplyingDuration = '';

    wastedAmount = 0;

    /**
     * wastedDuration - time format in ISO 8601 duration format (PnYnMnDTnHnMnS)
     */
    @observable wastedDuration = '';

    constructor(timeMetricDto?: TimeMetricDto) {
        Object.assign(this, timeMetricDto);
    }

    @computed
    get parsedWastedDuration(): Duration {
        return parse(this.wastedDuration);
    }
}
