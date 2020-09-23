// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DataTransformer } from '../../data-transformer';
import { BaseDashboardTransformer } from './base-dashboard-transformer';
import { QueueSizeHistory } from '../../../models/dashboard/deman-supply';
import {
    GetQueueSizeHistoryArrayResponse,
    GetQueueSizeHistoryResponse
} from '../../api-services/dashboard-api-service/queue-size-history/api-models';

// TODO: Make map response universal (handle only arrays)
export class GetQueueSizeHistoryTransformer extends BaseDashboardTransformer implements DataTransformer {
    mapResponse(
        getQueueSizeHistoryResponse: GetQueueSizeHistoryResponse
    ): QueueSizeHistory {
        return new QueueSizeHistory().fromDTO(getQueueSizeHistoryResponse);
    }

    mapArrayResponse(
        getQueueSizeHistoryArrayResponse: GetQueueSizeHistoryArrayResponse
    ): QueueSizeHistory[] {
        return getQueueSizeHistoryArrayResponse.map(item => new QueueSizeHistory().fromDTO(item));
    }
}
