// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ANALYSIS_FIELDS } from './analysis-fields';

export interface AnalysisFieldConfig {
    /**
     * id - uniq field identifier
     * @see ANALYSIS_FIELDS
     */
    id: ANALYSIS_FIELDS,

    /**
     * displayName - name to be displayed on the UI
     */
    displayName: string

    /**
     * tooltipContent - if content is provided, will render info icon
     * with honorable icon, and display this config
     */
    tooltipContent?: string;
}

export const ANALYSIS_FIELDS_CONFIG = new Map<ANALYSIS_FIELDS, AnalysisFieldConfig>([
    [ANALYSIS_FIELDS.DISCOVERED_IP_ADDRESS, {
        displayName: 'IP address',
        id: ANALYSIS_FIELDS.DISCOVERED_IP_ADDRESS,
    }],
    [ANALYSIS_FIELDS.MERCHANT_FUZZY_DEVICE_ID, {
        displayName: 'Device fingerprint',
        id: ANALYSIS_FIELDS.MERCHANT_FUZZY_DEVICE_ID,
    }],
    [ANALYSIS_FIELDS.MERCHANT_PAYMENT_INSTRUMENT_ID, {
        displayName: 'Internal Payment ID',
        id: ANALYSIS_FIELDS.MERCHANT_PAYMENT_INSTRUMENT_ID,
    }],
    [ANALYSIS_FIELDS.EMAIL, {
        displayName: 'Email',
        id: ANALYSIS_FIELDS.EMAIL,
    }],
    [ANALYSIS_FIELDS.BIN, {
        displayName: 'Credit card BIN',
        id: ANALYSIS_FIELDS.BIN,
    }],
    [ANALYSIS_FIELDS.HOLDER_NAME, {
        displayName: 'Credit card holder full name',
        id: ANALYSIS_FIELDS.HOLDER_NAME,
    }],
    [ANALYSIS_FIELDS.CREATION_DATE, {
        displayName: 'Account date creation',
        id: ANALYSIS_FIELDS.CREATION_DATE,
        tooltipContent: 'The search will be processed by Dynamics 365 Fraud Protection in terms of UTC time zone.\n'
            + 'Displayed account creation date can differ from account creation date on order details page.',
    }],
    [ANALYSIS_FIELDS.ZIPCODE, {
        displayName: 'Billing address (postal/Zip code)',
        id: ANALYSIS_FIELDS.ZIPCODE,
    }],
]);
