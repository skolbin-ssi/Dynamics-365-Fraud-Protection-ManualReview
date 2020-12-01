// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { DataTransformer } from '../../../data-transformer';
import { LinkAnalysis } from '../../../../models/item/link-analysis';
import { PostLinkAnalysisResponse } from '../../../api-services/item-api-service/api-models';
import { BaseItemTransformer } from '../base-item-transformer';

export class PostLinkAnalysisTransformer extends BaseItemTransformer implements DataTransformer {
    mapResponse(postLinkAnalysisResponse: PostLinkAnalysisResponse): LinkAnalysis {
        return new LinkAnalysis(postLinkAnalysisResponse);
    }
}
