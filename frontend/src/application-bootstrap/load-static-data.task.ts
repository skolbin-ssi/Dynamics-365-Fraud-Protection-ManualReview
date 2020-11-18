// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Container } from 'inversify';
import { Logger } from '../utility-services/logger';
import { SettingsService } from '../data-services/interfaces';
import { TYPES } from '../types';
import { AuthenticationService } from '../utility-services';

export const loadStaticData = {
    execute: async (logger: Logger, container: Container) => {
        const settingsService = container.get<SettingsService>(TYPES.SETTINGS_SERVICE);
        const authService = container.get<AuthenticationService>(TYPES.AUTHENTICATION);

        if (!authService.isAuthenticated()) {
            return true;
        }

        try {
            await settingsService.getStaticFilterFieldsSettingsAndCache();
        } catch (e) {
            logger.error(e);
        }

        return true;
    },

    toString: () => 'LoadStaticData'
};
