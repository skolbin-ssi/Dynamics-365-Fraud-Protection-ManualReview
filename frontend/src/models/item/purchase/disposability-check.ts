// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DisposabilityCheckServiceDTO } from '../../../data-services/api-services/models/calculated-fields-dto';

export class DisposabilityCheck {
    disposable: boolean = false;

    resource: string = '';

    checked: string = '';

    rawResponse: string = '';

    checkedEpochSeconds: string = '';

    fromDTO(disposabilityCheckDTO: DisposabilityCheckServiceDTO): DisposabilityCheck {
        const {
            disposable,
            resource,
            checked,
            rawResponse,
            checkedEpochSeconds,
        } = disposabilityCheckDTO;

        this.disposable = disposable;
        this.resource = resource;
        this.checked = checked;
        this.rawResponse = rawResponse;
        this.checkedEpochSeconds = checkedEpochSeconds;

        return this;
    }
}
