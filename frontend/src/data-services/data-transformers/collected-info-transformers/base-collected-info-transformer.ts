import { BaseTransformer } from '../base-transformer';
import { CollectedQueueInfoDto } from '../../api-services/models/collected-info/collecte-queue-info';
import { Queue, User } from '../../../models';
import { UserBuilder } from '../../../utility-services';

export class BaseCollectedInfoTransformer extends BaseTransformer {
    constructor(private readonly userBuilder: UserBuilder) {
        super();
    }

    protected mapSingleCollectedQueueInfo(collectedQueueInfoDto: CollectedQueueInfoDto): Queue {
        const queueModel = new Queue();
        const populatedModel = queueModel.fromCollectedDTO(collectedQueueInfoDto);

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
