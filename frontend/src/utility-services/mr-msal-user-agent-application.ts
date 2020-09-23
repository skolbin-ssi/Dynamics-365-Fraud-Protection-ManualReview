// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as Msal from 'msal';

/**
 * Have to be consistent with PersistentCacheKeys.IDTOKEN
 * Duplicated here since we do not want to compile msal from node_modules
 * @see import { PersistentCacheKeys } from 'msal/src/utils/Constants';
 */
const IDTOKEN = 'idtoken';

export class MRUserAgentApplication extends Msal.UserAgentApplication {
    getRawIdToken() {
        return this.cacheStorage.getItem(IDTOKEN);
    }
}
