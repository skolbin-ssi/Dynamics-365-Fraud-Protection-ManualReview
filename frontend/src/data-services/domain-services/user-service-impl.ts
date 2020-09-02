import { inject, injectable } from 'inversify';
import { User } from '../../models';
import { TYPES } from '../../types';
import { Logger } from '../../utility-services';
import { BaseDomainService } from '../base-domain-service';
import {
    GetCurrentUserTransformer,
    GetUserPhotoTransformer,
    GetUsersTransformer
} from '../data-transformers/user-transformer';
import { UserApiService, UserService } from '../interfaces';

@injectable()
export class UserServiceImpl extends BaseDomainService implements UserService {
    /**
     * In-memory cache for user images
     */
    private userImageMap = new Map<string, string>();

    /**
     * In-memory cache for users
     */
    private usersMap = new Map<string, User>();

    constructor(
        @inject(TYPES.USER_API_SERVICE) private readonly userApiService: UserApiService,
        @inject(TYPES.LOGGER) protected readonly logger: Logger
    ) {
        super(logger, 'UserService');
    }

    getUsers(): User[] {
        return Array.from(this.usersMap.values());
    }

    getUser(userId: string): User | null {
        const userFromCache = this.usersMap.get(userId);
        if (userFromCache) {
            // return user if found
            return userFromCache;
        }

        return null;
    }

    /**
     * Returns user image by userId
     * @param userId
     */
    async getUserPhoto(userId: string) {
        if (this.userImageMap.has(userId)) {
            return this.userImageMap.get(userId);
        }

        const dataTransformer = new GetUserPhotoTransformer();
        let response;

        try {
            response = await this.userApiService.getUserPhoto(userId);
        } catch (e) {
            /* If photo not found (e.g. 404) cache empty string to prevent subsequent calls */
            this.userImageMap.set(userId, '');
            throw this.handleApiException('getUserPhoto', e, {
                500: 'Failed to get users photo from the Api due to internal server error'
            }, true);
        }

        try {
            const imageDataURL = dataTransformer.mapResponse(response);
            this.userImageMap.set(userId, imageDataURL);
            return imageDataURL;
        } catch (e) {
            const userError = this.handleException(
                'getUsers',
                'Failed to parse response from API while getting users list',
                e
            );
            this.logger.warn('Failed to parse image response', userError);
            return '';
        }
    }

    /**
     * Get list of users
     */
    async loadUsersAndCache(): Promise<User[]> {
        if (this.usersMap.size) {
            return Array.from(this.usersMap.values());
        }

        const dataTransformer = new GetUsersTransformer();
        let response;

        try {
            response = await this.userApiService.getUsers();
        } catch (e) {
            throw this.handleApiException('getUsers', e, {
                500: 'Failed to get users from the Api due to internal server error'
            });
        }

        try {
            const users = dataTransformer.mapResponse(response.data);
            this.saveUsersToCache(users);

            return users;
        } catch (e) {
            throw this.handleException(
                'getUsers',
                'Failed to parse response from API while getting users list',
                e
            );
        }
    }

    async loadCurrentUser(): Promise<User> {
        const dataTransformer = new GetCurrentUserTransformer();
        let response;

        try {
            response = await this.userApiService.loadCurrentUser();
        } catch (e) {
            throw this.handleApiException('loadCurrentUser', e, {
                500: 'Failed to get current user from the Api due to internal server error'
            });
        }

        try {
            return dataTransformer.mapResponse(response.data);
        } catch (e) {
            throw this.handleException(
                'loadCurrentUser',
                'Failed to parse response from API while getting information about current user',
                e
            );
        }
    }

    private saveUsersToCache(users: User[]) {
        this.usersMap = new Map(users.map(user => [user.id, user]));
    }
}
