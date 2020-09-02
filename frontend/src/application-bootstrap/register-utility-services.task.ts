import { createBrowserHistory, History } from 'history';
import { Container } from 'inversify';
import { TYPES } from '../types';
import {
    AuthenticationService,
    Logger,
    UserBuilder,
    AzureMapsSearch,
    CacheStoreService,
    LocalStorageService
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
            .bind<AzureMapsSearch>(TYPES.AZURE_MAPS_SEARCH)
            .to(AzureMapsSearch)
            .inSingletonScope();

        container
            .bind<WindowSizeStore>(TYPES.WINDOW_SIZE_STORE)
            .to(WindowSizeStore)
            .inSingletonScope();

        container
            .bind<UserBuilder>(TYPES.USER_BUILDER)
            .to(UserBuilder);

        container
            .bind<LocalStorageService>(TYPES.LOCAL_STORAGE_SERVICE)
            .to(LocalStorageService)
            .inSingletonScope();

        container
            .bind<CacheStoreService>(TYPES.CACHE_STORE_SERVICE)
            .to(CacheStoreService)
            .inSingletonScope();

        return true;
    },

    toString: () => 'registerUtilityServicesTask'
};
