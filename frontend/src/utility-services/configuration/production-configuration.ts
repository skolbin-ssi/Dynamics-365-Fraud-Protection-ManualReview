// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { GetConfigurationResponse } from '../../data-services/api-services/configuration/api-models';
import { SEVERITY } from '../logger';
import { ConfigAuthentication, ConfigMaps, Configuration } from './configuration';

export class ProductionConfiguration implements Configuration {
    apiBaseUrl = '/api';

    logLevel = SEVERITY.INFO;

    authentication: ConfigAuthentication;

    maps: ConfigMaps;

    constructor(config: GetConfigurationResponse) {
        this.apiBaseUrl = config.apiBaseUrl;

        if (Object.values(SEVERITY).includes(config.logLevel as SEVERITY)) {
            this.logLevel = config.logLevel as SEVERITY;
        } else {
            this.logLevel = SEVERITY.INFO;
        }

        this.authentication = {
            clientId: config.clientId,
            tenant: config.tenant,
            baseAuthUrl: config.baseAuthUrl,
            TOKEN_PERSIST_KEY: 'MR_AUTH_TOKEN',
            NONCE_PERSIST_KEY: 'MR_AUTH_TOKEN_NONCE'
        };

        // TODO: fix this
        this.maps = {
            clientId: config.mapClientId
        };
    }
}
