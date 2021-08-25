// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { VELOCITIES, VELOCITY_KEYS } from '../../../constants/transaction';
import { CalculatedFieldsDTO } from '../../../data-services/api-services/models/calculated-fields-dto';
import { DisposabilityCheck } from './disposability-check';

export interface TransactionVelocity {
    key: VELOCITY_KEYS;
    name: string;
    isAmount: boolean;
    hour: number;
    day: number;
    week: number;
    lifetime: number | undefined;
    customPlaceholder?: string;
}

export class CalculatedFields {
    matchingOfCountriesForShippingAndIP: boolean = false;

    matchingOfCountriesForBillingAndShipping: boolean = false;

    matchingOfCountriesForBillingAndIP: boolean = false;

    billingCountries: string[] = [];

    billingZipCodes: string[] = [];

    billingAddresses: string[] = [];

    distanceToPreviousTransactionIP?: number;

    accountAgeInDays?: number;

    activityAgeInDays?: number;

    firstTransactionDateTime: string = '';

    firstTransactionDateTimeEpochSeconds: string = '';

    aggregatedEmailConfirmed: boolean = false;

    aggregatedEmailDomain: string = '';

    disposableEmailDomain: boolean = false;

    disposabilityChecks: DisposabilityCheck[] = [];

    authBankEventResultCodes: string[] = [];

    approveBankEventResultCodes: string[] = [];

    declineBankEventResultCodes: string[] = [];

    velocities: TransactionVelocity[] = [];

    fromDTO(calculatedFields: CalculatedFieldsDTO): CalculatedFields {
        const {
            matchingOfCountriesForShippingAndIP,
            matchingOfCountriesForBillingAndShipping,
            matchingOfCountriesForBillingAndIP,
            billingCountries,
            billingZipCodes,
            billingAddresses,
            distanceToPreviousTransactionIP,
            accountAgeInDays,
            activityAgeInDays,
            firstTransactionDateTime,
            firstTransactionDateTimeEpochSeconds,
            aggregatedEmailConfirmed,
            aggregatedEmailDomain,
            disposableEmailDomain,
            disposabilityChecks,
            authBankEventResultCodes,
            approveBankEventResultCodes,
            declineBankEventResultCodes
        } = calculatedFields;

        this.matchingOfCountriesForShippingAndIP = matchingOfCountriesForShippingAndIP;
        this.matchingOfCountriesForBillingAndShipping = matchingOfCountriesForBillingAndShipping;
        this.matchingOfCountriesForBillingAndIP = matchingOfCountriesForBillingAndIP;
        this.billingCountries = billingCountries;
        this.billingZipCodes = billingZipCodes;
        this.billingAddresses = billingAddresses;
        this.distanceToPreviousTransactionIP = distanceToPreviousTransactionIP;
        this.accountAgeInDays = accountAgeInDays;
        this.activityAgeInDays = activityAgeInDays;
        this.firstTransactionDateTime = firstTransactionDateTime;
        this.firstTransactionDateTimeEpochSeconds = firstTransactionDateTimeEpochSeconds;
        this.aggregatedEmailConfirmed = aggregatedEmailConfirmed;
        this.aggregatedEmailDomain = aggregatedEmailDomain;
        this.disposableEmailDomain = disposableEmailDomain;
        this.authBankEventResultCodes = authBankEventResultCodes;
        this.approveBankEventResultCodes = approveBankEventResultCodes;
        this.declineBankEventResultCodes = declineBankEventResultCodes;

        if (Array.isArray(disposabilityChecks)) {
            this.disposabilityChecks = disposabilityChecks.map<DisposabilityCheck>(dc => {
                const dcModel = new DisposabilityCheck();
                return dcModel.fromDTO(dc);
            });
        }

        VELOCITIES.forEach(({
            key, name, isAmount, customPlaceholder
        }) => {
            if (calculatedFields[key]) {
                this.velocities.push({
                    key,
                    name,
                    isAmount,
                    hour: calculatedFields[key].hour,
                    day: calculatedFields[key].day,
                    week: calculatedFields[key].week,
                    lifetime: calculatedFields[key].lifetime,
                    customPlaceholder
                });
            }
        });

        return this;
    }
}
