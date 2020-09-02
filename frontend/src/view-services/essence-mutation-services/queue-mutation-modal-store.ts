import { inject, injectable } from 'inversify';
import { computed } from 'mobx';
import { QUEUE_MANAGEMENT, QUEUE_MUTATION_TYPES } from '../../constants';
import { TYPES } from '../../types';
import { QueueMutationStore } from './queue-mutation-store';
import { CurrentUserStore } from '../current-user-store';

@injectable()
export class QueueMutationModalStore {
    constructor(
        @inject(TYPES.QUEUE_MUTATION_STORE) public readonly queueMutationStore: QueueMutationStore,
        @inject(TYPES.CURRENT_USER_STORE) public readonly userStore: CurrentUserStore
    ) {
        // By default sets current user as supervisor when creating a queue
        if (userStore.user) {
            queueMutationStore.addAssignedReviewer(userStore.user.id, true);
        }
    }

    @computed
    get blockDisableProcessingDeadline() {
        const { blockDisableProcessingDeadline, mutationType } = this.queueMutationStore;
        return blockDisableProcessingDeadline || (mutationType === QUEUE_MUTATION_TYPES.UPDATE && !this.userStore.checkUserCan(QUEUE_MANAGEMENT.UPDATE_DEADLINE));
    }

    @computed
    get blockNameChange() {
        const { mutationType } = this.queueMutationStore;
        return mutationType === QUEUE_MUTATION_TYPES.UPDATE && !this.userStore.checkUserCan(QUEUE_MANAGEMENT.UPDATE_NAME);
    }
}
