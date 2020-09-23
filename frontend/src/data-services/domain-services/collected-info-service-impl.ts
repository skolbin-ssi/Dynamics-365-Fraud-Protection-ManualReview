// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject } from 'inversify';

import { BaseDomainService } from '../base-domain-service';
import { CollectedInfoApiService, CollectedInfoService, UserService } from '../interfaces';

import { TYPES } from '../../types';
import { Logger } from '../../utility-services/logger';
import { GetCurrentUserTransformer, GetUsersTransformer } from '../data-transformers/user-transformer';
import { User } from '../../models/user';
import { GetCollectedInfoQueueTransformer } from '../data-transformers/collected-info-transformers/get-collected-info-queue-transformer';
import { CacheStoreService, UserBuilder } from '../../utility-services';
import { GetCollectedQueuesInfoTransformer } from '../data-transformers/collected-info-transformers/get-collected-queues-info-transformer';

export class CollectedInfoServiceImpl extends BaseDomainService implements CollectedInfoService {
    /**
     * In-memory cache for historical users
     */
    private historicalUserCacheMap = new Map<string, User>();

    constructor(
        @inject(TYPES.COLLECTED_INFO_API_SERVICE) private readonly collectedInfoApiService: CollectedInfoApiService,
        @inject(TYPES.USER_BUILDER) protected readonly userBuilder: UserBuilder,
        @inject(TYPES.USER_SERVICE) protected readonly userService: UserService,
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
        @inject(TYPES.CACHE_STORE_SERVICE) private readonly cacheStoreService: CacheStoreService
    ) {
        super(logger, 'CollectedInfoServiceImpl');
    }

    async getHistoricalUser(userId: string) {
        const cacheUser = this.userBuilder.buildById(userId);

        if (cacheUser) {
            return cacheUser;
        }

        const user = await this.getAnalystCollectedInfo(userId);

        if (user) {
            const userWithPhoto = await this.populateUserPhoto(user);
            this.saveUserToHistoricalCache(userWithPhoto);
            return userWithPhoto;
        }

        return null;
    }

    async getAnalystCollectedInfo(id: string) {
        const dataTransformer = new GetCurrentUserTransformer();
        let response;

        try {
            response = await this.collectedInfoApiService.getAnalystCollectedInfo(id);
        } catch (e) {
            throw this.handleApiException('getAnalystCollectedInfo', e, {
                500: 'Failed to get collected info user from the Api due to internal server error'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getAnalystCollectedInfo',
                    'Failed to parse response from API while getting information about collected user',
                    e
                );
            }
        }

        return null;
    }

    async getCollectedInfoUsersAndCache() {
        if (this.historicalUserCacheMap.size) {
            return Array.from(this.historicalUserCacheMap.values());
        }

        const dataTransformer = new GetUsersTransformer();
        let response;

        try {
            response = await this.collectedInfoApiService.getAnalystsCollectedInfo();
        } catch (e) {
            throw this.handleApiException('getAnalystsCollectedInfo', e, {
                500: 'Failed to get collected info by users from the Api due to internal server error'
            });
        }

        try {
            const users = dataTransformer.mapResponse(response.data);
            this.saveHistoricalUsersToCache(users);

            return users;
        } catch (e) {
            throw this.handleException(
                'getAnalystsCollectedInfo',
                'Failed to parse response from API while getting collected info by users',
                e
            );
        }
    }

    async getQueueCollectedInfo(queueId: string) {
        const dataTransformer = new GetCollectedInfoQueueTransformer(this.userBuilder);
        let response;

        try {
            response = await this.collectedInfoApiService.getQueueCollectedInfo(queueId);
        } catch (e) {
            throw this.handleApiException('getQueueCollectedInfo', e, {
                500: `Failed to get queue (${queueId}) from the Api due to internal server error`
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'getQueueCollectedInfo',
                `Failed to parse response from API while getting queue (${queueId}) list`,
                e
            );
        }
    }

    async getQueuesCollectedInfo() {
        const dataTransformer = new GetCollectedQueuesInfoTransformer(this.userBuilder);
        let response;

        try {
            response = await this.collectedInfoApiService.getQueuesCollectedInfo();
        } catch (e) {
            throw this.handleApiException('getQueuesCollectedInfo', e, {
                500: 'Failed to get queues from the Api due to internal server error'
            });
        }

        try {
            const historicalQueues = dataTransformer.mapResponse(response.data);
            this.cacheStoreService.saveHistoricalQueues(historicalQueues);
            return historicalQueues;
        } catch (e) {
            throw this.handleException(
                'getQueuesCollectedInfo',
                'Failed to parse response from API while getting queues list',
                e
            );
        }
    }

    private saveUserToHistoricalCache(user: User) {
        this.historicalUserCacheMap.set(user.id, user);
    }

    private saveHistoricalUsersToCache(users: User[]) {
        this.historicalUserCacheMap = new Map(users.map(user => [user.id, user]));
    }

    private async populateUserPhoto(user: User) {
        let imageUrl = null;
        try {
            imageUrl = await this.userService.getUserPhoto(user.id);
            if (imageUrl) {
                user.setImageUrl(imageUrl);
                return user;
            }
        } catch (e) {
            this.logger.debug(e);
        }

        return user;
    }
}
