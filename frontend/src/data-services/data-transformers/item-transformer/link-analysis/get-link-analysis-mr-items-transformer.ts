// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DataTransformer } from '../../../data-transformer';
import { LinkAnalysisMrItem } from '../../../../models/item/link-analysis';
import { GetLinkAnalysisMrItemsResponse } from '../../../api-services/item-api-service/api-models';
import { LinkAnalysisMrItemDto } from '../../../api-services/models/item';
import { UserBuilder } from '../../../../utility-services';

export class GetLinkAnalysisMrItemsTransformer implements DataTransformer {
    constructor(private readonly userBuilder: UserBuilder) {}

    mapResponse(getLinkAnalysisMrItemsResponse: GetLinkAnalysisMrItemsResponse): LinkAnalysisMrItem[] {
        return getLinkAnalysisMrItemsResponse.values
            .map(linkAnalysisMrItemDto => this.mapSingleItem(linkAnalysisMrItemDto));
    }

    private mapSingleItem(linkAnalysisMrItemDto: LinkAnalysisMrItemDto) {
        const linkAnalysisItem = new LinkAnalysisMrItem().fromDto(linkAnalysisMrItemDto);
        const { item: populatedItem } = linkAnalysisItem;

        if (populatedItem) {
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

            return linkAnalysisItem;
        }

        return linkAnalysisItem;
    }
}
