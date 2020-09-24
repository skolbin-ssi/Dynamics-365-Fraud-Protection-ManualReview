// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { BaseCollectedInfoTransformer } from './base-collected-info-transformer';
import { DataTransformer } from '../../data-transformer';
import { GetCollectedInfoQueueResponse } from '../../api-services/collected-info-api-service/collected-queue/api-models';
import { Queue } from '../../../models';

export class GetCollectedInfoQueueTransformer extends BaseCollectedInfoTransformer implements DataTransformer {
    mapResponse(getCollectedQueueInfoResponse: GetCollectedInfoQueueResponse): Queue {
        return this.mapSingleCollectedQueueInfo(getCollectedQueueInfoResponse);
    }
}
