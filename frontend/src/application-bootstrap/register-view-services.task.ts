import { Container } from 'inversify';
import { TYPES } from '../types';
import { Logger } from '../utility-services';
import {
    DashboardScreenStore,
    QueuesPerformanceStore,
    QueuesScreenStore,
    ItemStore,
    QueueStore,
    ReviewConsoleScreenStore,
    CurrentUserStore,
    AppStore,
    QueuePerformanceStore,
    LockedItemsStore,
    AnalystOverturnedPerformanceStore, AlertsStore, AlertsMutationStore, ReportsModalStore
} from '../view-services';
import { QueueMutationStore, QueueMutationModalStore } from '../view-services/essence-mutation-services';
import { ReviewPermissionStore } from '../view-services/review-permission-store';
import { DashboardDemandSupplyScreenStore } from '../view-services/dashboard/dashboard-demand-supply-screen-store';
import { AnalystsPerformanceStore } from '../view-services/dashboard/analysts-performance-store';
import { AnalystPerformanceStore } from '../view-services/dashboard/analyst-performance-store';
import { QueueOverturnedPerformanceStore } from '../view-services/dashboard/queue-overturned-performance-store';
import { DemandQueuePerformanceStore } from '../view-services/dashboard/demand-queue-performance-store';

export const registerViewServicesTask = {
    execute: async (logger: Logger, container: Container) => {
        container
            .bind<AppStore>(TYPES.APP_STORE)
            .to(AppStore)
            .inSingletonScope();

        container
            .bind<QueuesScreenStore>(TYPES.QUEUES_SCREEN_STORE)
            .to(QueuesScreenStore)
            .inSingletonScope();

        container
            .bind<ReviewConsoleScreenStore>(TYPES.REVIEW_CONSOLE_SCREEN_STORE)
            .to(ReviewConsoleScreenStore)
            .inSingletonScope();

        container
            .bind<QueueStore>(TYPES.QUEUE_STORE)
            .to(QueueStore)
            .inSingletonScope();

        container
            .bind<ItemStore>(TYPES.ITEM_STORE)
            .to(ItemStore)
            .inSingletonScope();

        container
            .bind<CurrentUserStore>(TYPES.CURRENT_USER_STORE)
            .to(CurrentUserStore)
            .inSingletonScope();

        container
            .bind<QueueMutationModalStore>(TYPES.QUEUE_MUTATION_MODAL_STORE)
            .to(QueueMutationModalStore);

        container
            .bind<QueueMutationStore>(TYPES.QUEUE_MUTATION_STORE)
            .to(QueueMutationStore);

        container
            .bind<DashboardScreenStore>(TYPES.DASHBOARD_SCREEN_STORE)
            .to(DashboardScreenStore)
            .inSingletonScope();

        container
            .bind<LockedItemsStore>(TYPES.LOCKED_ITEMS_STORE)
            .to(LockedItemsStore)
            .inSingletonScope();

        container
            .bind<ReviewPermissionStore>(TYPES.REVIEW_PERMISSION_STORE)
            .to(ReviewPermissionStore)
            .inSingletonScope();

        container
            .bind<AlertsStore>(TYPES.ALERTS_STORE)
            .to(AlertsStore)
            .inSingletonScope();

        container
            .bind<AlertsMutationStore>(TYPES.ALERTS_MUTATION_STORE)
            .to(AlertsMutationStore);

        //  ____  DASHBOARD STORES ____

        container
            .bind<QueuesPerformanceStore>(TYPES.QUEUES_PERFORMANCE_STORE)
            .to(QueuesPerformanceStore);

        container
            .bind<QueuePerformanceStore>(TYPES.QUEUE_PERFORMANCE_STORE)
            .to(QueuePerformanceStore)
            .inSingletonScope();

        container
            .bind<AnalystsPerformanceStore>(TYPES.ANALYSTS_PERFORMANCE_STORE)
            .to(AnalystsPerformanceStore);

        container
            .bind<AnalystPerformanceStore>(TYPES.DASHBOARD_ANALYST_PERFORMANCE_STORE)
            .to(AnalystPerformanceStore);

        container
            .bind<QueueOverturnedPerformanceStore>(TYPES.QUEUE_OVERTURNED_PERFORMANCE_STORE)
            .to(QueueOverturnedPerformanceStore);

        container
            .bind<AnalystOverturnedPerformanceStore>(TYPES.OVERTURNED_PERFORMANCE_STORE)
            .to(AnalystOverturnedPerformanceStore);

        container
            .bind<DashboardDemandSupplyScreenStore>(TYPES.DASHBOARD_DEMAND_SUPPLY_SCREEN_STORE)
            .to(DashboardDemandSupplyScreenStore);

        container
            .bind<DemandQueuePerformanceStore>(TYPES.DEMAND_QUEUE_PERFORMANCE_STORE)
            .to(DemandQueuePerformanceStore);

        container
            .bind<ReportsModalStore>(TYPES.REPORTS_MODAL_STORE)
            .to(ReportsModalStore)
            .inSingletonScope();

        return true;
    },

    toString: () => 'registerViewServicesTask'
};
