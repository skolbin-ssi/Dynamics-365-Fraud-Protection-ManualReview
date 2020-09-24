// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Queue } from '../../../models';
import { PostQueueResponse } from '../../api-services/queue-api-service/api-models';
import { DataTransformer } from '../../data-transformer';
import { BaseQueueTransformer } from './base-queue-transformer';

export class PostQueueTransformer extends BaseQueueTransformer implements DataTransformer {
    mapResponse(
        postQueuesResponse: PostQueueResponse,
        viewId?: string
    ): Queue {
        const updateQueueResponse = postQueuesResponse
            .map(this.mapSingleQueue.bind(this));

        if (viewId) {
            return updateQueueResponse.find(q => q.viewId === viewId) || updateQueueResponse[0];
        }

        return updateQueueResponse[0];
    }
}
