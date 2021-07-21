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
            const allReasonCodes = this.reasonCodes.split(',');

            r = allReasonCodes.map(part => {
                const current = part.replace(/[0-9]*-/g, '');
                const words = current.split(':');
                const str = words[0].split('_').join(' ').toLowerCase();

                return `${str[0].toUpperCase()}${str.slice(1)}: ${words[1]}`;
            });
        } catch (e) {
            r = [];
        }

        return r;
    }
}
