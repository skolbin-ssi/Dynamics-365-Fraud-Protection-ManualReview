// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Queue, User } from '../../../models';
import { FiltersBuilder, UserBuilder } from '../../../utility-services';
import { QueueViewDTO } from '../../api-services/models';
import { BaseTransformer } from '../base-transformer';

export class BaseQueueTransformer extends BaseTransformer {
    constructor(
        private readonly userBuilder: UserBuilder,
        private readonly filtersBuilder: FiltersBuilder
    ) {
        super();
    }

    protected mapSingleQueue(queue: QueueViewDTO): Queue {
        const queueModel = new Queue();
        const populatedModel = queueModel.fromDTO(queue);

        const filters = this.filtersBuilder.getPopulatedFilterFields(queue.filters);
        populatedModel.setFilters(filters);

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
