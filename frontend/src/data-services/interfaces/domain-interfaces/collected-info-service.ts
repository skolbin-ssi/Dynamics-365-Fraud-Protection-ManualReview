// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { User } from '../../../models/user';
import { Queue } from '../../../models';

/**
 * API service for retrieving historical data
 */
export interface CollectedInfoService {

    /**
     * Get specific current user if not load the historical user by id,
     */
    getHistoricalUser(id: string): Promise<User | null>;

    /**
     * Get all historical users and cache the response
     */
    getCollectedInfoUsersAndCache(): Promise<User[] | null>

    /**
     * Get collected analyst info by id
     */
    getAnalystCollectedInfo(id: string): Promise<User | null>;

    getQueueCollectedInfo(id: string): Promise<Queue | null>;

    /**
     * Get all historical queues
     */
    getQueuesCollectedInfo(): Promise<Queue[]> | null;
}
