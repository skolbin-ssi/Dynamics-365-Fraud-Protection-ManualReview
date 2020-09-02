import { inject, injectable } from 'inversify';
import { computed } from 'mobx';
import { ROLE } from '../constants';
import { Item, Queue } from '../models';
import { TYPES } from '../types';
import { Logger } from '../utility-services';
import { CurrentUserStore } from './current-user-store';
import { LockedItemsStore } from './locked-items-store';
import { QueueStore } from './queues';

export enum QUEUE_REVIEW_PROHIBITION_REASONS {
    CANNOT_REVIEW_EMPTY_QUEUE = 'You cannot review an empty queue',
    CANNOT_REVIEW_UNASSIGNED_QUEUE = 'You cannot review a queue you are not assigned to',
    CANNOT_LOCK_TWO_ITEMS_ON_QUEUE = 'You cannot lock more than one item on a queue'
}

export enum ITEM_REVIEW_PROHIBITION_REASONS {
    ITEM_ON_HOLD_ON_OTHER_USER = 'You cannot review an item that was put on hold by other user'
}

interface ReviewPermission {
    isAllowed: boolean;
}

interface QueueReviewPermission extends ReviewPermission {
    reason?: QUEUE_REVIEW_PROHIBITION_REASONS;
}

interface ItemReviewPermission extends ReviewPermission {
    reason?: ITEM_REVIEW_PROHIBITION_REASONS;
}

@injectable()
export class ReviewPermissionStore {
    constructor(
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
        @inject(TYPES.QUEUE_STORE) protected readonly queueStore: QueueStore,
        @inject(TYPES.LOCKED_ITEMS_STORE) protected readonly lockedItemsStore: LockedItemsStore,
        @inject(TYPES.CURRENT_USER_STORE) protected readonly currentUserStore: CurrentUserStore
    ) {}

    private getIsQueueReviewAllowed(queue: Queue): QueueReviewPermission {
        const { user } = this.currentUserStore;
        const { itemLocks } = this.lockedItemsStore;

        if (!queue.size) {
            return {
                isAllowed: false,
                reason: QUEUE_REVIEW_PROHIBITION_REASONS.CANNOT_REVIEW_EMPTY_QUEUE
            };
        }

        if (!user || (!queue.assignees.includes(user.id) && !user?.roles.includes(ROLE.ADMIN_MANAGER))) {
            return {
                isAllowed: false,
                reason: QUEUE_REVIEW_PROHIBITION_REASONS.CANNOT_REVIEW_UNASSIGNED_QUEUE
            };
        }

        if (itemLocks?.find(lock => lock.queue?.viewId === queue.viewId)) {
            return {
                isAllowed: false,
                reason: QUEUE_REVIEW_PROHIBITION_REASONS.CANNOT_LOCK_TWO_ITEMS_ON_QUEUE
            };
        }

        return { isAllowed: true };
    }

    @computed
    get queueReviewPermissions(): Map<string, QueueReviewPermission> {
        const { allQueues } = this.queueStore;

        if (allQueues) {
            return new Map(allQueues.map(queue => [queue.viewId, this.getIsQueueReviewAllowed(queue)]));
        }

        if (this.lockedItemsStore.lockedItems) {
            const queuesWithLockedItems = Array.from(new Set(this.lockedItemsStore.lockedItems.map(item => item.lockedOnQueueId).filter(it => it !== null)) as Set<string>);
            return new Map(queuesWithLockedItems.map(id => [id, { isAllowed: false, reason: QUEUE_REVIEW_PROHIBITION_REASONS.CANNOT_LOCK_TWO_ITEMS_ON_QUEUE }]));
        }

        return new Map();
    }

    itemReviewPermissions(item: Item | null): ItemReviewPermission {
        const { user } = this.currentUserStore;

        if (
            item
            && item.hold
            && item.hold.ownerId
            && user
            && item.hold.ownerId !== user.id) {
            return {
                isAllowed: false,
                reason: ITEM_REVIEW_PROHIBITION_REASONS.ITEM_ON_HOLD_ON_OTHER_USER
            };
        }

        return {
            isAllowed: true
        };
    }
}
