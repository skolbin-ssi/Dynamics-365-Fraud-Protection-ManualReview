// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import {
    action,
    computed, IReactionDisposer,
    observable,
    reaction
} from 'mobx';
import {
    DEFAULT_QUEUE_AUTO_REFRESH_CHECK_MILLISECONDS,
    DEFAULT_QUEUE_AUTO_REFRESH_INTERVAL_MILLISECONDS,
    QUEUE_LIST_TYPE,
    QUEUE_MANAGEMENT
} from '../constants';
import { Queue } from '../models';
import { TYPES } from '../types';
import { CurrentUserStore } from './current-user-store';
import { LockedItemsStore } from './locked-items-store';
import { QueueStore } from './queues';
import { QUEUE_REVIEW_PROHIBITION_REASONS, ReviewPermissionStore } from './review-permission-store';
import { AutoRefreshStorageItemManger } from './misc/auto-refresh-storage-item-manager';

import { LocalStorageService } from '../utility-services/local-storage-service';

@injectable()
export class QueuesScreenStore {
    @observable
    displayedNotesItemId: string | null = null;

    @observable
    displayTagsItemId: string | null = null;

    @observable
    activeQueueList: QUEUE_LIST_TYPE = QUEUE_LIST_TYPE.REGULAR;

    @observable
    activeTilesQueueList: QUEUE_LIST_TYPE = QUEUE_LIST_TYPE.ALL;

    /**
     * Is auto refresh feature (toggle) enabled
     */
    @observable isAutoRefreshEnabled = true;

    /**
     * Last date of refresh
     */
    @observable lastRefreshMap: Map<string, number> = new Map();

    /**
     * Reference on refresh interval
     */
    @observable refreshIntervalRef: number | null = null;

    /**
     * Current time stamp
     */
    @observable now: number = Date.now();

    /**
     * AutoRefreshStorageItemManger - manager for dealing with localStorage
     */
    readonly autoRefreshStorageItemManager: AutoRefreshStorageItemManger;

    /**
     *  saveAutoRefreshReactionDisposerRef - IReaction disposer
     */
    private readonly saveAutoRefreshReactionDisposerRef: IReactionDisposer;

    constructor(
        @inject(TYPES.QUEUE_STORE) public readonly queueStore: QueueStore,
        @inject(TYPES.LOCKED_ITEMS_STORE) public readonly lockedItemsStore: LockedItemsStore,
        @inject(TYPES.CURRENT_USER_STORE) private currentUserStore: CurrentUserStore,
        @inject(TYPES.REVIEW_PERMISSION_STORE) private reviewPermissionStore: ReviewPermissionStore,
        @inject(TYPES.LOCAL_STORAGE_SERVICE) private localStorageService: LocalStorageService
    ) {
        this.autoRefreshStorageItemManager = this.getInstanceOfLocalStorageManager();

        this.saveAutoRefreshReactionDisposerRef = reaction(() => this.isAutoRefreshEnabled, isAutoRefreshEnabled => {
            this.autoRefreshStorageItemManager.saveToggleState(isAutoRefreshEnabled);
        });

        this.initAutoRefresh();
    }

    @action
    setDisplayedNotesItemId(id: string | null) {
        this.displayTagsItemId = null;
        this.displayedNotesItemId = id;
    }

    @action
    setDisplayedTagsItemId(id: string | null) {
        this.displayedNotesItemId = null;
        this.displayTagsItemId = id;
    }

    @action
    setActiveQueueList(escalated?: boolean) {
        if (typeof escalated !== 'undefined') {
            this.activeQueueList = escalated ? QUEUE_LIST_TYPE.ESCALATED : QUEUE_LIST_TYPE.REGULAR;
        } else {
            this.activeQueueList = this.activeQueueList === QUEUE_LIST_TYPE.REGULAR ? QUEUE_LIST_TYPE.ESCALATED : QUEUE_LIST_TYPE.REGULAR;
        }
    }

    @action
    setActiveTilesQueueList(activeTilesQueueList: QUEUE_LIST_TYPE) {
        this.activeTilesQueueList = activeTilesQueueList;
    }

    @action
    toggleAutoRefresh(isEnabled: boolean = false) {
        if (isEnabled) {
            this.isAutoRefreshEnabled = true;
            this.initAutoRefresh();
        } else if (this.refreshIntervalRef) {
            this.isAutoRefreshEnabled = false;
            window.clearInterval(this.refreshIntervalRef);
        }
    }

    @action
    private initAutoRefresh() {
        if (this.isAutoRefreshEnabled) {
            this.refreshIntervalRef = window.setInterval(this.autoRefreshFn.bind(this), DEFAULT_QUEUE_AUTO_REFRESH_CHECK_MILLISECONDS);
        }
    }

    @action
    private autoRefreshFn() {
        const now = Date.now();
        this.now = now;
        const { selectedQueueId, selectedQueueItems } = this.queueStore;

        if (
            this.isAutoRefreshEnabled
            && selectedQueueId
            && selectedQueueItems
        ) {
            const selectedQueueLastRefresh = this.lastRefreshMap.get(selectedQueueId);

            if (
                selectedQueueLastRefresh
                && now - selectedQueueLastRefresh > DEFAULT_QUEUE_AUTO_REFRESH_INTERVAL_MILLISECONDS
            ) {
                this.refreshQueueAndLockedItems(selectedQueueId);
                this.loadQueueItems(selectedQueueId);
                this.setLastRefresh(selectedQueueId);
            }
        }
    }

    @action
    private setLastRefresh(queueId: string) {
        const now = Date.now();
        this.lastRefreshMap.set(queueId, now);
    }

    @action
    async loadQueueItems(queueId: string, loadMore = false) {
        this.queueStore.loadQueueItems(queueId, loadMore);
        this.setLastRefresh(queueId);
    }

    @computed
    get selectedQueueUpdated() {
        const { selectedQueueId } = this.queueStore;

        if (!selectedQueueId) { return null; }
        const lastUpdateTimestamp = this.lastRefreshMap.get(selectedQueueId);

        if (lastUpdateTimestamp) {
            const lastUpdatedMinutes = Math.floor((this.now - lastUpdateTimestamp) / 1000 / 60);

            if (lastUpdatedMinutes < 1) {
                return 'less than a minute ago';
            }

            return `${lastUpdatedMinutes} min ago`;
        }

        return null;
    }

    @action
    markQueueAsSelectedAndLoadItems(queue: Queue, loadItems: boolean = true) {
        this.queueStore.markQueueAsSelected(queue);

        if (loadItems) {
            this.loadQueueItems(queue.viewId);
        }
    }

    @action
    markQueueAsSelectedByIdAndLoadItems(queueId: string) {
        const queueToSelect = this.queueStore.markQueueAsSelectedById(queueId);
        this.markQueueAsSelectedAndLoadItems(queueToSelect);

        return queueToSelect;
    }

    @action
    refreshQueueAndLockedItems(queueId: string) {
        this.queueStore.refreshQueue(queueId);
        this.lockedItemsStore.getLockedItems();
    }

    @computed
    get canUserEditQueue() {
        return this.currentUserStore.checkUserCanOneOf([
            QUEUE_MANAGEMENT.UPDATE_NAME,
            QUEUE_MANAGEMENT.UPDATE_SORTING,
            QUEUE_MANAGEMENT.UPDATE_ASSIGNEES,
            QUEUE_MANAGEMENT.UPDATE_PROCESSING_DEADLINE,
            QUEUE_MANAGEMENT.UPDATE_TIMEOUT,
            QUEUE_MANAGEMENT.UPDATE_ALLOWED_LABELS,
            QUEUE_MANAGEMENT.UPDATE_FILTERS,
            QUEUE_MANAGEMENT.DELETE_QUEUE
        ]);
    }

    @computed
    get canUserAssignAnalyst() {
        return this.currentUserStore.checkUserCan(QUEUE_MANAGEMENT.UPDATE_ASSIGNEES);
    }

    isReviewAllowed(queueId?: string) {
        if (!queueId) {
            return false;
        }

        const permission = this.reviewPermissionStore.queueReviewPermissions.get(queueId);

        if (permission) {
            /**
             * enable start review for cases when item is already locked
             * user will be redirected to review console for locked order.
             */
            return permission.isAllowed || permission.reason === QUEUE_REVIEW_PROHIBITION_REASONS.CANNOT_LOCK_TWO_ITEMS_ON_QUEUE;
        }

        return true;
    }

    @computed
    get queuesSupervisedByCurrentUser() {
        const { queues } = this.queueStore;
        const { user } = this.currentUserStore;

        if (!queues || !user) {
            return [];
        }

        return queues.filter(q => q.supervisors.includes(user.id));
    }

    @computed
    get allQueuesAssignedToCurrentUser() {
        const { queues, escalatedQueues } = this.queueStore;
        const { user } = this.currentUserStore;

        if ((!queues && !escalatedQueues) || !user) {
            return [];
        }

        return [
            ...(queues?.filter(q => q.reviewers.includes(user.id)) || []),
            ...(escalatedQueues?.filter(q => q.supervisors.includes(user.id)) || [])
        ];
    }

    @computed
    get queuesAssignedToCurrentUser() {
        const { queues } = this.queueStore;
        const { user } = this.currentUserStore;

        if (!queues || !user) {
            return [];
        }

        return queues.filter(q => q.reviewers.includes(user.id));
    }

    @computed
    get queuesUserIsNotAssignedNorSupervise() {
        const { queues } = this.queueStore;
        const { user } = this.currentUserStore;

        if (!queues || !user) {
            return [];
        }

        return queues.filter(q => !q.reviewers.includes(user.id) && !q.supervisors.includes(user.id));
    }

    @computed
    get escalatedQueuesSupervisedByCurrentUser() {
        const { escalatedQueues } = this.queueStore;
        const { user } = this.currentUserStore;

        if (!escalatedQueues || !user) {
            return [];
        }

        return escalatedQueues.filter(q => q.supervisors.includes(user.id));
    }

    @computed
    get escalatedQueuesUserIsNotSupervise() {
        const { escalatedQueues } = this.queueStore;
        const { user } = this.currentUserStore;

        if (!escalatedQueues || !user) {
            return [];
        }

        return escalatedQueues.filter(q => !q.supervisors.includes(user.id));
    }

    @computed
    get getAutoRefreshToggleValue() {
        const value = this.autoRefreshStorageItemManager.getToggleValue();

        if (value !== null) {
            return value;
        }

        return null;
    }

    @action
    private getInstanceOfLocalStorageManager() {
        const localStorageId = 'QueuesScreenStore.isAutoRefreshEnabled';
        return new AutoRefreshStorageItemManger(localStorageId, this.localStorageService);
    }

    @action
    private disposeAutoRefreshReaction() {
        this.saveAutoRefreshReactionDisposerRef();
    }

    @action
    private clearAutoRefreshLocalStorageManagerValue() {
        this.autoRefreshStorageItemManager.removeValue();
    }

    @action
    clearStore() {
        this.disposeAutoRefreshReaction();
        this.clearAutoRefreshLocalStorageManagerValue();
    }
}
