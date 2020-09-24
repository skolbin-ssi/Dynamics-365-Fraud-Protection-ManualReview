// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { injectable } from 'inversify';

import { Queue } from '../models';

@injectable()
export class CacheStoreService {
    private historicalQueues = new Map<string, Queue>();

    saveHistoricalQueues(queues: Queue[]) {
        this.historicalQueues = new Map<string, Queue>(queues.map(queue => [queue.queueId, queue]));
    }

    getHistoricalQueues(key: string): Queue | undefined {
        return this.historicalQueues.get(key);
    }

    getHistoricalQueuesZise() {
        return this.historicalQueues.size;
    }
}
