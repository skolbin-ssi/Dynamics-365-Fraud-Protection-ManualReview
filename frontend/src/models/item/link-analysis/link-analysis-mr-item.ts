// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LinkAnalysisMrItemDto } from '../../../data-services/api-services/models/item/link-analysis-mr-item-dto';
import { Item } from '../item';

export class LinkAnalysisMrItem {
    item!: Item;

    availableForLabeling = false;

    userRestricted = false;

    fromDto(laItemDto: LinkAnalysisMrItemDto) {
        const { item, availableForLabeling, userRestricted } = laItemDto;

        this.item = new Item().fromDTO(item);
        this.availableForLabeling = availableForLabeling;
        this.userRestricted = userRestricted;

        return this;
    }
}
