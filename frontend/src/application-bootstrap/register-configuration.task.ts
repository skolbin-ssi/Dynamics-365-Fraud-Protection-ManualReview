// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Container } from 'inversify';
import { ConfigurationApiServiceImpl } from '../data-services/api-services/configuration/configuration-api-service-impl';
import { TYPES } from '../types';
import {
    Configuration,
    DevelopmentConfiguration,
    Logger,
    ProductionConfiguration
} from '../utility-services';

export const registerConfigurationTask = {
    execute: async (logger: Logger, container: Container) => {
        let configuration: Configuration;

        if (process.env.NODE_ENV !== 'production') {
            configuration = new DevelopmentConfiguration();
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
