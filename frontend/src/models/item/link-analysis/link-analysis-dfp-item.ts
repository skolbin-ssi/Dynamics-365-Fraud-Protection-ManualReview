// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// eslint-disable-next-line max-classes-per-file
import { action, computed, observable } from 'mobx';
import { IFacepilePersona } from '@fluentui/react/lib/Facepile';

import { DfpItemDto } from '../../../data-services/api-services/models/item';
import { DeviceContext } from '../purchase';
import { User } from '../../user';

class LaUser {
    email: string = '';

    userId: string = '';

    fromDto(email: string, userId:string) {
        this.email = email || '';
        this.userId = userId || '';
    }
}
export class LinkAnalysisDfpItem {
    currency: string = '';

    @observable
    deviceContext: DeviceContext = new DeviceContext();

    merchantLocalDate: string = '';

    merchantRuleDecision: string = '';

    purchaseId: string = '';

    totalAmount: number = 0;

    @observable
    totalAmountInUSD: number = 0;

    @observable
    riskScore: number = 0;

    salesTax: number = 0;

    salesTaxInUSD: number = 0;

    @observable
    user = new LaUser();

    @observable
    userRestricted = false;

    @observable
    reasonCodes: string = '';

    @observable
    analyst: User | null = null;

    fromDto(dfpItemDto: DfpItemDto) {
        const {
            currency,
            deviceContext,
            merchantLocalDate,
            merchantRuleDecision,
            purchaseId,
            totalAmount,
            totalAmountInUSD,
            reasonCodes,
            riskScore,
            salesTax,
            salesTaxInUSD,
            user,
            userRestricted,
        } = dfpItemDto;

        this.currency = currency || '';

        if (deviceContext) {
            this.deviceContext.fromDTO(deviceContext);
        }

        this.merchantLocalDate = merchantLocalDate || '';
        this.merchantRuleDecision = merchantRuleDecision || '';
        this.purchaseId = purchaseId || '';
        this.totalAmount = totalAmount || 0;
        this.totalAmountInUSD = totalAmountInUSD || 0;
        this.reasonCodes = reasonCodes || '';
        this.riskScore = riskScore;
        this.salesTax = salesTax || 0;
        this.salesTaxInUSD = salesTaxInUSD || 0;

        if (user) {
            this.user.fromDto(user.email, user.userIs);
        }

        this.userRestricted = userRestricted;

        return this;
    }

    @computed
    get amount() {
        if (this.totalAmountInUSD) {
            return `$${this.totalAmountInUSD.toFixed(2)}`;
        }

        return '';
    }

    @action
    setAnalyst(user: User) {
        this.analyst = user;
    }

    @computed
    get analystAsPersons(): IFacepilePersona[] {
        if (this.analyst) {
            return [{
                personaName: this.analyst.name,
                imageUrl: this.analyst.imageUrl,
                data: this.analyst
            }];
        }

        return [];
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

    @computed
    get email() {
        if (this.user.email) {
            return this.user.email;
        }

        return '';
    }
}
