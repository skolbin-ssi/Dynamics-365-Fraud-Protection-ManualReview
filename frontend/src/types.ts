// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export const TYPES = {
    /**
     * Api Services
     */
    ITEM_API_SERVICE: Symbol('itemApiService'),
    QUEUE_API_SERVICE: Symbol('queueApiService'),
    USER_API_SERVICE: Symbol('userApiService'),
    DASHBOARD_API_SERVICE: Symbol('dashboardApiService'),
    DICTIONARY_API_SERVICE: Symbol('dictionaryApiService'),
    SETTINGS_API_SERVICE: Symbol('settingsApiService'),
    ALERTS_API_SERVICE: Symbol('alertsApiService'),
    COLLECTED_INFO_API_SERVICE: Symbol('collectedInfoApiService'),
    OVERVIEW_API_SERVICE: Symbol('overviewApiService'),

    /**
     * Data Services
     */
    QUEUE_SERVICE: Symbol('queueService'),
    ITEM_SERVICE: Symbol('itemService'),
    USER_SERVICE: Symbol('userService'),
    DASHBOARD_SERVICE: Symbol('dashboardService'),
    SETTINGS_SERVICE: Symbol('settingsService'),
    ALERTS_SERVICE: Symbol('alertsService'),
    COLLECTED_INFO_SERVICE: Symbol('collectedInfoService'),
    OVERVIEW_SERVICE: Symbol('overviewApiService'),

    /**
     * View Services (aka stores)
     */
    APP_STORE: Symbol('appStore'),
    QUEUES_SCREEN_STORE: Symbol('queuesScreenStore'),
    REVIEW_CONSOLE_SCREEN_STORE: Symbol('reviewConsoleScreenStore'),
    QUEUE_STORE: Symbol('queueStore'),
    ITEM_STORE: Symbol('itemStore'),
    CURRENT_USER_STORE: Symbol('currentUserStore'),
    QUEUE_MUTATION_STORE: Symbol('queueMutationStore'),
    QUEUE_MUTATION_MODAL_STORE: Symbol('queueMutationModalStore'),
    LOCKED_ITEMS_STORE: Symbol('lockedItemsStore'),
    REVIEW_PERMISSION_STORE: Symbol('reviewPermissionStore'),
    ALERTS_STORE: Symbol('alertsStore'),
    ALERTS_MUTATION_STORE: Symbol('alertMutationStore'),

    // Dashboard stores
    DASHBOARD_DEMAND_SUPPLY_SCREEN_STORE: Symbol('dashboardDemandSupplyScreenStore'),
    DASHBOARD_QUEUE_PERFORMANCE_SCREEN_STORE: Symbol('dashboardQueuePerformanceStore'),
    DASHBOARD_SCREEN_STORE: Symbol('transactionScreenStore'),
    QUEUES_PERFORMANCE_STORE: Symbol('queuesPerformanceStore'),
    QUEUE_PERFORMANCE_STORE: Symbol('queuePerformanceStore'),
    BASE_PERFORMANCE_STORE: Symbol('basePerformanceStore'),
    ANALYSTS_PERFORMANCE_STORE: Symbol('analystsPerformanceStore'),
    OVERTURNED_PERFORMANCE_STORE: Symbol('overturnedPerformanceStore'),
    DASHBOARD_ANALYST_PERFORMANCE_STORE: Symbol('analystPerformanceStore'),
    QUEUE_OVERTURNED_PERFORMANCE_STORE: Symbol('queueOverturnedPerformanceStore'),
    DEMAND_QUEUE_PERFORMANCE_STORE: Symbol('demandQueuePerformanceStore'),
    REPORTS_MODAL_STORE: Symbol('ReportsModalStore'),

    /**
     * Utility Services
     */
    LOGGER: Symbol('logger'),
    CONFIGURATION: Symbol('configuration'),
    AUTHENTICATION: Symbol('Authentication'),
    USER_BUILDER: Symbol('userBuilder'),
    HISTORY: Symbol('History'),
    AZURE_MAPS_SEARCH: Symbol('AzureMapsSearch'),
    WINDOW_SIZE_STORE: Symbol('WindowSizeStore'),
    LOCAL_STORAGE_SERVICE: Symbol('LocalStorageService'),
};
