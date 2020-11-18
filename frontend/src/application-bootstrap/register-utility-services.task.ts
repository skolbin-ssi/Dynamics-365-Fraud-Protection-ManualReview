// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { History, createBrowserHistory } from 'history';
import { Container } from 'inversify';

import { TYPES } from '../types';
import {
    AuthenticationService,
    AzureMapsService,
    FiltersBuilder,
    LocalStorageService,
    Logger,
    UserBuilder,
} from '../utility-services';
import { WindowSizeStore } from '../view-services/misc/window-size-store';

export const registerUtilityServicesTask = {
    execute: async (logger: Logger, container: Container) => {
        /**
         * Registering Utility Services
         */
        container
            .bind<Logger>(TYPES.LOGGER)
            .toConstantValue(logger);

        container
            .bind<History>(TYPES.HISTORY)
            .toConstantValue(createBrowserHistory());

        container
            .bind<AuthenticationService>(TYPES.AUTHENTICATION)
            .to(AuthenticationService)
            .inSingletonScope();

        container
            .bind<AzureMapsService>(TYPES.AZURE_MAPS_SERVICE)
            .to(AzureMapsService)
            .inSingletonScope();

        container
            .bind<WindowSizeStore>(TYPES.WINDOW_SIZE_STORE)
            .to(WindowSizeStore)
            .inSingletonScope();

        container
            .bind<UserBuilder>(TYPES.USER_BUILDER)
            .to(UserBuilder);

        container
            .bind<FiltersBuilder>(TYPES.FILTERS_BUILDER)
            .to(FiltersBuilder)
            .inSingletonScope();

        container
            .bind<LocalStorageService>(TYPES.LOCAL_STORAGE_SERVICE)
            .to(LocalStorageService)
            .inSingletonScope();

        return true;
    },

    toString: () => 'registerUtilityServicesTask'
};
