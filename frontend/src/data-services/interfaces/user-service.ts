// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { User } from '../../models/user';

export interface UserService {
    /**
     * Get list of all users
     */
    getUsers(): User[];

    /**
     * Get particular user by id
     * @param userId
     */
    getUser(userId: string): User | null;

    /**
     * Get current user info
     */
    loadCurrentUser(): Promise<User>;

    /**
     * Get user photo by user id
     * @param userId
     */
    getUserPhoto(userId: string): Promise<string | undefined>;

    /**
     * Get list of users and persist in memory
     * note: should only be user on application loading phase
     */
    loadUsersAndCache(): Promise<User[]>;
}
