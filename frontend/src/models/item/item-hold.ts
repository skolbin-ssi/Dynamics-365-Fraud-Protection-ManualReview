// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ItemHoldDTO } from '../../data-services/api-services/models/item-hold-dto';

export class ItemHold {
    held: string = '';

    ownerId: string = '';

    queueId: string = '';

    queueViewId: string = '';

    fromDTO(itemHold: ItemHoldDTO) {
        const {
            held,
            ownerId,
            queueId,
            queueViewId
        } = itemHold;

        this.held = held;
        this.ownerId = ownerId;
        this.queueId = queueId;
        this.queueViewId = queueViewId;

        return this;
    }
}
