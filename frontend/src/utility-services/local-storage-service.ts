import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { Logger } from './logger';

@injectable()
export class LocalStorageService {
    isLocalStorageSupported: boolean = false;

    constructor(
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
    ) {
        this.isLocalStorageSupported = LocalStorageService.isStorageSupported();
    }

    set(key: string, value: any) {
        if (this.isLocalStorageSupported) {
            try {
                const stringifiedValue = JSON.stringify(value);

                localStorage.setItem(key, stringifiedValue);
            } catch (e) {
                this.logger.error(`Error: LocalStorageService can't set item with a key ${key}`, value);
            }
        }
    }

    get(key: string) {
        if (this.isLocalStorageSupported) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                this.logger.error(`Error: LocalStorageService can't get item with a key ${key}`);
            }
        }

        return null;
    }

    remove(key: string) {
        if (this.isLocalStorageSupported) {
            localStorage.removeItem(key);
        }
    }

    /**
     * Feature detecting method, verify that it is supported and available in the current browsing session.
     *
     * Browsers that support localStorage have a property on the window object named localStorage. However,
     * just asserting that that property exists may throw exceptions. If the localStorage object does exist,
     * there is still no guarantee that the localStorage API is actually available, as various browsers offer
     * settings that disable localStorage.
     */
    private static isStorageSupported() {
        let storage: Storage;
        try {
            storage = window.localStorage;
            const testKey = '__test__key__';
            storage.setItem(testKey, testKey);
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
}
