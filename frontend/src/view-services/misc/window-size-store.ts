// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { injectable } from 'inversify';
import { action, computed, observable } from 'mobx';
import debounce from 'lodash/debounce';
import inRange from 'lodash/inRange';
import { SIZE_RANGES, SIZES } from '../../constants';

@injectable()
export class WindowSizeStore {
    @observable
    private screenWindow: Window | null = null;

    @observable
    private windowWidth: number = 0;

    @computed
    get windowSizes(): SIZES[] {
        return Object.values(SIZES).reduce<SIZES[]>((result, size) => {
            const [from, to] = SIZE_RANGES[size];

            if (inRange(this.windowWidth, from, to)) {
                return [...result, size];
            }

            return result;
        }, []);
    }

    constructor() {
        this.setWindow();
    }

    @action
    setWindow() {
        if (typeof window === 'object') {
            this.screenWindow = window;
            this.handleWindowWidthChange();
            this.screenWindow.addEventListener('resize', this.handleWindowWidthChange);
        }
    }

    @action
    handleWindowWidthChange = debounce(() => {
        const width = this.screenWindow?.innerWidth || 0;
        this.setWindowWidth(width);
    }, 100);

    @action
    setWindowWidth = (width: number) => {
        this.windowWidth = width;
        return this.windowWidth;
    };
}
