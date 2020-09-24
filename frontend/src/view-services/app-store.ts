// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { injectable } from 'inversify';
import { action, computed, observable } from 'mobx';
import { CreateQueueModalTabs, QUEUE_MUTATION_TYPES } from '../constants';

@injectable()
export class AppStore {
    @observable isNavigationExpanded: boolean = false;

    @observable openedQueueMutationModalType: QUEUE_MUTATION_TYPES | null = null;

    @observable openedQueueMutationModalInitialTab: CreateQueueModalTabs = 'general';

    @action
    toggleNavigationExpanded(isNavigationExpanded?: boolean) {
        this.isNavigationExpanded = isNavigationExpanded || !this.isNavigationExpanded;
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
