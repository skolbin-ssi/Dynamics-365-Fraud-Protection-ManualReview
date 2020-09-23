// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LocalStorageService } from '../../utility-services/local-storage-service';

export class AutoRefreshStorageItemManger {
    private readonly id: string;

    private readonly localStorageService: LocalStorageService;

    constructor(id: string, localStorageService: LocalStorageService) {
        this.id = id;
        this.localStorageService = localStorageService;
    }

    saveToggleState(value: boolean) {
        this.localStorageService.set(this.id, value);
    }

    getToggleValue(): boolean | null {
        const value = this.localStorageService.get(this.id);

        if (value) {
            return JSON.parse(value);
        }

        return null;
    }

    removeValue() {
        this.localStorageService.remove(this.id);
    }
}
