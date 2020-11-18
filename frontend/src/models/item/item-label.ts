// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ItemLabelDTO } from '../../data-services/api-services/models/item-label-dto';
import { LABEL } from '../../constants';

export class ItemLabel {
    value: LABEL | undefined;

    authorId: string = '';

    queueId: string = '';

    labeled: Date | null = null;

    fromDTO(itemLabel: ItemLabelDTO) {
        const {
            value,
            authorId,
            queueId,
            labeled
        } = itemLabel;

        this.value = value;
        this.authorId = authorId;
        this.queueId = queueId;
        this.labeled = labeled ? new Date(labeled) : null;

        return this;
    }
}
