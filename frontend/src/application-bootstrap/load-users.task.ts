// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Container } from 'inversify';
import { UserService } from '../data-services';
import { TYPES } from '../types';
import { AuthenticationService, Logger } from '../utility-services';
import { CurrentUserStore } from '../view-services';

export const loadUsersTask = {
    execute: async (logger: Logger, container: Container) => {
        const userService = container.get<UserService>(TYPES.USER_SERVICE);
        const userStore = container.get<CurrentUserStore>(TYPES.CURRENT_USER_STORE);
        const authService = container.get<AuthenticationService>(TYPES.AUTHENTICATION);

        if (!authService.isAuthenticated()) {
            return true;
        }

        try {
            await Promise.all([
                userStore.loadCurrentUserInfo(),
                userService.loadUsersAndCache()
            ]);
        } catch (e) {
            logger.error(e);
        }

        return true;
    },

    toString: () => 'LoadUsersTask'
};
