// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Item } from '../../../models';
import { UserBuilder } from '../../../utility-services';
import { ItemDTO } from '../../api-services/models';
import { GetQueueItemsResponse } from '../../api-services/queue-api-service/api-models';
import { DataTransformer } from '../../data-transformer';

export class GetQueueItemsTransformer implements DataTransformer {
    constructor(private readonly userBuilder: UserBuilder) {}

    mapResponse(
        getQueueItemsResponse: GetQueueItemsResponse
    ): Item[] {
        return getQueueItemsResponse
            .values
            .map(item => this.mapItem(item));
    }

    private mapItem(item: ItemDTO) {
        const itemModel = new Item();
        const populatedItem = itemModel.fromDTO(item);

        let analyst;

        if (populatedItem.label?.authorId) {
            analyst = this.userBuilder.buildById(populatedItem.label.authorId);
        }
        if (populatedItem.lockedById) {
            analyst = this.userBuilder.buildById(populatedItem.lockedById);
        }

        if (analyst) {
            populatedItem.setAnalyst(analyst);
        }

        if (populatedItem.notes?.length) {
            populatedItem.notes.forEach(note => {
                const user = this.userBuilder.buildById(note.userId);
                if (user) {
                    note.setUser(user);
                }
            });
        }

        return populatedItem;
    }
}
