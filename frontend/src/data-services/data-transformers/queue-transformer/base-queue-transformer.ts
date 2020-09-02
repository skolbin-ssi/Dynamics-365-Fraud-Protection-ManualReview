import { Queue, User } from '../../../models';
import { UserBuilder } from '../../../utility-services';
import { QueueViewDTO } from '../../api-services/models';
import { BaseTransformer } from '../base-transformer';

export class BaseQueueTransformer extends BaseTransformer {
    constructor(
        private readonly userBuilder: UserBuilder
    ) {
        super();
    }

    protected mapSingleQueue(queue: QueueViewDTO): Queue {
        const queueModel = new Queue();
        const populatedModel = queueModel.fromDTO(queue);

        if (populatedModel.assignees && Array.isArray(populatedModel.assignees)) {
            const reviewUsers = populatedModel.assignees.reduce<User[]>((ru, reviewerId) => {
                const user = this.userBuilder.buildById(reviewerId);

                if (user) {
                    return ru.concat([user]);
                }

                return ru;
            }, []);

            populatedModel.setAssigneeUsers(reviewUsers);
        }

        return populatedModel;
    }
}
