// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Configuration } from './configuration';
import { SEVERITY } from '../logger/logger';

export class DevelopmentConfiguration implements Configuration {
    readonly apiBaseUrl = '/api';

    readonly logLevel = SEVERITY.DEBUG;

    readonly appId = '';

    readonly authentication = {
        baseAuthUrl: 'https://login.microsoftonline.com',
        clientId: '94021731-2fa2-4ee1-a512-af52d3b7a552\n',
        tenant: '74143e14-36bb-4cd2-bdb9-65d0f8b5b360',
        TOKEN_PERSIST_KEY: 'MR_AUTH_TOKEN',
        NONCE_PERSIST_KEY: 'MR_AUTH_TOKEN_NONCE'
    };

    readonly maps = {
        clientId: '41faf592-fab8-445c-94d5-7259cc822fd6'
    };
}
