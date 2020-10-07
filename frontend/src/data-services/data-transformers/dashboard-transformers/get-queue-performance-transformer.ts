// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DataTransformer } from '../../data-transformer';
import { BaseDashboardTransformer } from './base-dashboard-transformer';
import { GetQueuesPerformanceResponse } from '../../api-services/dashboard-api-service/queues/api-models';
import { QueuePerformance } from '../../../models/dashboard';
import { CacheStoreService } from '../../../utility-services';

export class GetQueuePerformanceTransformer extends BaseDashboardTransformer implements DataTransformer {
    constructor(
        private readonly cacheService: CacheStoreService
    ) {
        super();
    }

    mapResponse(
        getQueuesPerformanceResponse: GetQueuesPerformanceResponse
    ): QueuePerformance[] {
        return getQueuesPerformanceResponse.map(queue => {
            const queueName = this.cacheService.getHistoricalQueue(queue.id)?.name || '';

            const queuePerformance = new QueuePerformance().fromDto(queue);
            queuePerformance.setQueueName(queueName);

            return queuePerformance;
        });
    }
}
