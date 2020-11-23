// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ConfigAuthentication, ConfigMaps, Configuration } from './configuration';
import { SEVERITY } from '../logger';

export class DevelopmentConfiguration implements Configuration {
    readonly apiBaseUrl = '/api';

    readonly appId = '';

    readonly logLevel: SEVERITY;

    readonly authentication: ConfigAuthentication;

    readonly maps: ConfigMaps;

    constructor(
        logLevel?: SEVERITY,
        baseAuthUrl?: string,
        clientId?: string,
        tenant?: string,
        TOKEN_PERSIST_KEY?: string,
        NONCE_PERSIST_KEY?: string,
        mapClientId?: string
    ) {
        this.logLevel = logLevel || SEVERITY.DEBUG;
        this.authentication = {
            baseAuthUrl: baseAuthUrl || 'https://login.microsoftonline.com',
            clientId: clientId || '94021731-2fa2-4ee1-a512-af52d3b7a552\n',
            tenant: tenant || '74143e14-36bb-4cd2-bdb9-65d0f8b5b360',
            TOKEN_PERSIST_KEY: TOKEN_PERSIST_KEY || 'MR_AUTH_TOKEN',
            NONCE_PERSIST_KEY: NONCE_PERSIST_KEY || 'MR_AUTH_TOKEN_NONCE',
        };
        this.maps = {
            clientId: mapClientId || '41faf592-fab8-445c-94d5-7259cc822fd6',
        };
    }
}
