// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { SEVERITY } from '../logger';

export interface Configuration {
    apiBaseUrl: string;
    logLevel: SEVERITY;
    authentication: ConfigAuthentication;
    maps: ConfigMaps;
}

export interface ConfigAuthentication {
    baseAuthUrl: string;
    clientId: string;
    tenant: string;
    TOKEN_PERSIST_KEY: string;
    NONCE_PERSIST_KEY: string;
}

export interface ConfigMaps {
    clientId: string;
}
