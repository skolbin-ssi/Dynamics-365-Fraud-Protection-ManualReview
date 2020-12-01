// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DataTransformer } from '../../../data-transformer';
import { LinkAnalysisDfpItem } from '../../../../models/item/link-analysis';
import {
    GetLinkAnalysisDfpItemsResponse,
} from '../../../api-services/item-api-service/api-models';
import { DfpItemDto } from '../../../api-services/models/item';
import { UserBuilder } from '../../../../utility-services';

export class GetLinkAnalysisDfpItemsTransformer implements DataTransformer {
    constructor(private readonly userBuilder: UserBuilder) {}

    mapResponse(getLinkAnalysisDfpItemsResponse: GetLinkAnalysisDfpItemsResponse): LinkAnalysisDfpItem[] {
        return getLinkAnalysisDfpItemsResponse.values
            .map(linkAnalysisDfpItemDto => this.mapSingleItem(linkAnalysisDfpItemDto));
    }

    private mapSingleItem(linkAnalysisDfpItemDto: DfpItemDto) {
        return new LinkAnalysisDfpItem().fromDto(linkAnalysisDfpItemDto);
    }
}
