import { User } from '../../../models/user';
import { Queue } from '../../../models';

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
