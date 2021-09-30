// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DataTransformer } from '../../../data-transformer';
import { LinkAnalysisDfpItem } from '../../../../models/item/link-analysis';
import {
    GetLinkAnalysisDfpItemsResponse,
} from '../../../api-services/item-api-service/api-models';
import { DfpItemDto } from '../../../api-services/models/item';
import { UserBuilder } from '../../../../utility-services';
import { formatDateStringToJSDate } from '../../../../utils/date/formatters';

export class GetLinkAnalysisDfpItemsTransformer implements DataTransformer {
    constructor(private readonly userBuilder: UserBuilder) {}

    mapResponse(getLinkAnalysisDfpItemsResponse: GetLinkAnalysisDfpItemsResponse): LinkAnalysisDfpItem[] {
        return getLinkAnalysisDfpItemsResponse.values
            .map(linkAnalysisDfpItemDto => this.mapSingleItem(linkAnalysisDfpItemDto))
            .sort((prev, next) => {
                const prevDate = formatDateStringToJSDate(prev.merchantLocalDate);
                const nextDate = formatDateStringToJSDate(next.merchantLocalDate);

                if (prevDate && nextDate) {
                    return nextDate.getTime() - prevDate.getTime();
                }

                return 0;
            });
    }

    private mapSingleItem(linkAnalysisDfpItemDto: DfpItemDto) {
        return new LinkAnalysisDfpItem().fromDto(linkAnalysisDfpItemDto);
    }
}
