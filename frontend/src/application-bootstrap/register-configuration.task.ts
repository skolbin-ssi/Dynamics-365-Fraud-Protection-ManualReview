// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Container } from 'inversify';
import { ConfigurationApiServiceImpl } from '../data-services/api-services/configuration/configuration-api-service-impl';
import { TYPES } from '../types';
import {
    Configuration,
    DevelopmentConfiguration,
    Logger,
    ProductionConfiguration,
    SEVERITY,
} from '../utility-services';

export const registerConfigurationTask = {
    execute: async (logger: Logger, container: Container) => {
        let configuration: Configuration;

        if (process.env.NODE_ENV !== 'production') {
            configuration = new DevelopmentConfiguration(
                process.env.LOG_LEVEL as SEVERITY,
                process.env.BASE_AUTH_URL,
                process.env.CLIENT_ID,
                process.env.TENANT,
                process.env.TOKEN_PERSIST_KEY,
                process.env.NONCE_PERSIST_KEY,
                process.env.MAP_CLIENT_ID
            );
        } else {
            const configurationApiService = new ConfigurationApiServiceImpl();
            const loadedConfig = await configurationApiService.getConfiguration();
            configuration = new ProductionConfiguration(loadedConfig.data);
        }

        container
            .bind<Configuration>(TYPES.CONFIGURATION)
            .toConstantValue(configuration);

        return true;
    },

    toString: () => 'registerConfigurationTask'
};
