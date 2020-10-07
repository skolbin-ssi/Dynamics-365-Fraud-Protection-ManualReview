// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { injectable } from 'inversify';
import { action, computed, observable } from 'mobx';
import {
    CreateQueueModalTabs,
    QUEUE_MUTATION_TYPES,
} from '../constants';
import { Notification } from '../models';

@injectable()
export class AppStore {
    @observable isNavigationExpanded: boolean = false;

    @observable openedQueueMutationModalType: QUEUE_MUTATION_TYPES | null = null;

    @observable openedQueueMutationModalInitialTab: CreateQueueModalTabs = 'general';

    @observable toastNotification: Notification | null = null;

    @action
    toggleNavigationExpanded(isNavigationExpanded?: boolean) {
        this.isNavigationExpanded = isNavigationExpanded || !this.isNavigationExpanded;
    }

    @action
    showToast(notification: Notification): void {
        this.toastNotification = notification;
    }

    @action
    dismissToast() {
        this.toastNotification = null;
    }

    @action
    toggleOpenedModalType(modalType: QUEUE_MUTATION_TYPES | null, initialTab: CreateQueueModalTabs = 'general') {
        this.openedQueueMutationModalType = modalType;
        this.openedQueueMutationModalInitialTab = initialTab;
    }

    @computed
    get isModalOpened() {
        return !!this.openedQueueMutationModalType;
    }
}
