// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { SEVERITY } from '../logger';
import { ConfigAuthentication, ConfigMaps, Configuration } from './configuration';

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
            clientId: clientId || 'input clientId here',
            tenant: tenant || 'input tenantId here',
            TOKEN_PERSIST_KEY: TOKEN_PERSIST_KEY || 'MR_AUTH_TOKEN',
            NONCE_PERSIST_KEY: NONCE_PERSIST_KEY || 'MR_AUTH_TOKEN_NONCE',
        };
        this.maps = {
            clientId: mapClientId || 'input mapCLientId here'
        };
    }
}
