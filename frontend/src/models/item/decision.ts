// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { computed, observable } from 'mobx';
import { DecisionDTO } from '../../data-services/api-services/models';

export class Decision {
    riskScore: number = 0;

    @observable
    reasonCodes: string = '';

    fromDTO(decision: DecisionDTO) {
        const {
            riskScore,
            reasonCodes
        } = decision;

        this.riskScore = riskScore;
        this.reasonCodes = reasonCodes;

        return this;
    }

    @computed
    get humanReadableCodes(): string[] {
        let r: string[];

        try {
            const results = Array.from(this.reasonCodes.matchAll(/-(\w*):/gi));

            r = results.map(part => {
                const str = part[1].split('_').join(' ').toLowerCase();

                return str[0].toUpperCase() + str.slice(1);
            });
        } catch (e) {
            r = [];
        }

        return r;
    }
}
