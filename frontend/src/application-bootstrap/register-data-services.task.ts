// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Container } from 'inversify';
import {
    QueueApiService, ItemApiService, UserApiService,
    ItemService, QueueService, UserService,
    DashboardService, DictionaryApiService,
    SettingsApiService, SettingsService, AlertsApiService, CollectedInfoApiService, CollectedInfoService
} from '../data-services';
import { AlertsApiServiceImpl } from '../data-services/api-services/alerts-api-service/alerts-api-service-impl';
import { DictionaryApiServiceImpl } from '../data-services/api-services/dictionary-api-service/dictionary-api-service-impl';
import { QueueApiServiceImpl } from '../data-services/api-services/queue-api-service/queue-api-service-impl';
import { ItemApiServiceImpl } from '../data-services/api-services/item-api-service/item-api-service-impl';
import { SettingsApiServiceImpl } from '../data-services/api-services/settings-api-service/settings-api-service-impl';
import { UserApiServiceImpl } from '../data-services/api-services/user-api-service/user-api-service-impl';
import { AlertsServiceImpl } from '../data-services/domain-services/alerts-service-impl';
import { QueueServiceImpl } from '../data-services/domain-services/queue-service-impl';
import { ItemServiceImpl } from '../data-services/domain-services/item-service-impl';
import { SettingsServiceImpl } from '../data-services/domain-services/settings-service-impl';
import { UserServiceImpl } from '../data-services/domain-services/user-service-impl';
import { AlertsService } from '../data-services/interfaces/alerts-service';
import { TYPES } from '../types';
import { Logger } from '../utility-services';
import { DashboardApiService } from '../data-services/interfaces/dashboard-api-service';
import { DashboardApiServiceImpl } from '../data-services/api-services/dashboard-api-service/dashboard-api-service-impl';
import { DashboardServiceImpl } from '../data-services/domain-services/dashboard-service-impl';
import { CollectedInfoApiServiceImpl } from '../data-services/api-services/collected-info-api-service/collected-info-api-service-impl';
import { CollectedInfoServiceImpl } from '../data-services/domain-services/collected-info-service-impl';

export const registerDataServicesTask = {
    execute: async (logger: Logger, container: Container) => {
        /**
         * Registering API Services
         */
        container
            .bind<QueueApiService>(TYPES.QUEUE_API_SERVICE)
            .to(QueueApiServiceImpl);

        container
            .bind<ItemApiService>(TYPES.ITEM_API_SERVICE)
            .to(ItemApiServiceImpl);

        container
            .bind<UserApiService>(TYPES.USER_API_SERVICE)
            .to(UserApiServiceImpl);

        container
            .bind<DictionaryApiService>(TYPES.DICTIONARY_API_SERVICE)
            .to(DictionaryApiServiceImpl);

        container
            .bind<SettingsApiService>(TYPES.SETTINGS_API_SERVICE)
            .to(SettingsApiServiceImpl);

        container
            .bind<DashboardApiService>(TYPES.DASHBOARD_API_SERVICE)
            .to(DashboardApiServiceImpl)
            .inSingletonScope();

        container
            .bind<AlertsApiService>(TYPES.ALERTS_API_SERVICE)
            .to(AlertsApiServiceImpl)
            .inSingletonScope();

        container
            .bind<CollectedInfoApiService>(TYPES.COLLECTED_INFO_API_SERVICE)
            .to(CollectedInfoApiServiceImpl)
            .inSingletonScope();

        /**
         * Registering Data Services
         */
        container
            .bind<QueueService>(TYPES.QUEUE_SERVICE)
            .to(QueueServiceImpl)
            .inSingletonScope();

        container
            .bind<ItemService>(TYPES.ITEM_SERVICE)
            .to(ItemServiceImpl)
            .inSingletonScope();

        container
            .bind<UserService>(TYPES.USER_SERVICE)
            .to(UserServiceImpl)
            .inSingletonScope();

        container
            .bind<DashboardService>(TYPES.DASHBOARD_SERVICE)
            .to(DashboardServiceImpl)
            .inSingletonScope();

        container
            .bind<SettingsService>(TYPES.SETTINGS_SERVICE)
            .to(SettingsServiceImpl)
            .inSingletonScope();

        container
            .bind<AlertsService>(TYPES.ALERTS_SERVICE)
            .to(AlertsServiceImpl)
            .inSingletonScope();

        container
            .bind<CollectedInfoService>(TYPES.COLLECTED_INFO_SERVICE)
            .to(CollectedInfoServiceImpl)
            .inSingletonScope();

        /**
         * Load users than move forward
         */
        return true;
    },

    toString: () => 'registerDataServicesTask'
};
