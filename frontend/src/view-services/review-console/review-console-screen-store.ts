// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import lGet from 'lodash/get';
import {
    action, computed, observable, runInAction
} from 'mobx';
import {
    LABEL,
    NOTIFICATION_TYPE,
    SETTING_TYPE,
} from '../../constants';
import { ItemService, QueueService, SettingsService } from '../../data-services';
import { ApiServiceError } from '../../data-services/base-api-service';
import {
    ExternalLink,
    Item,
    Queue,
    Setting
} from '../../models';
import { MrUserError } from '../../models/exceptions';
import { TYPES } from '../../types';
import { LockedItemsStore } from '../locked-items-store';
import { AppStore } from '../app-store';

export enum ITEM_DETAILS_MODE {
    DETAILS = 'details',
    JSON = 'json',
    LINK_ANALYSIS = 'link'
}

@injectable()
export class ReviewConsoleScreenStore {
    /**
     * Queues list
     */
    @observable reviewItem: Item | null = null;

    @observable loadingReviewItem: boolean = false;

    @observable loadingReviewItemError: ApiServiceError | MrUserError | null = null;

    @observable queue: Queue | null = null;

    @observable loadingQueueData: boolean = false;

    @observable loadingQueueDataError: Error | null = null;

    @observable itemUpdatingError: ApiServiceError | MrUserError | null = null;

    @observable isInAddNoteMode: boolean = false;

    @observable isInAddTagMode: boolean = false;

    @observable isNoteSubmitting: boolean = false;

    @observable isTagSubmitting: boolean = false;

    @observable noteToAdd: string = '';

    @observable tagToAdd: string = '';

    @observable reviewItemTags: string[] = [];

    @observable settings: Setting[] = [];

    @observable searchId: string = '';

    @observable
    openItemDetailsTab: ITEM_DETAILS_MODE = ITEM_DETAILS_MODE.DETAILS;

    @action
    setOpenDetailsTab(openItemDetailsTabMode: ITEM_DETAILS_MODE) {
        this.openItemDetailsTab = openItemDetailsTabMode;
    }

    @computed get blockActionButtons(): boolean {
        return (!!this.queue && !this.queue.size)
            || !!this.loadingQueueDataError
            || !!this.loadingReviewItemError
            || !!this.itemUpdatingError
            || this.loadingReviewItem;
    }

    constructor(
        @inject(TYPES.ITEM_SERVICE) private itemService: ItemService,
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService,
        @inject(TYPES.LOCKED_ITEMS_STORE) private lockedItemsStore: LockedItemsStore,
        @inject(TYPES.SETTINGS_SERVICE) private settingsService: SettingsService,
        @inject(TYPES.APP_STORE) private appStore: AppStore
    ) {
        this.loadSettings();
    }

    @action
    async getReviewItem(queueId: string, itemId?: string) {
        this.loadingReviewItem = true;
        this.loadingReviewItemError = null;
        this.itemUpdatingError = null;

        try {
            if (itemId) {
                this.reviewItem = await this.itemService.getUnorderedQueueReviewItem(queueId, itemId);
            } else {
                this.reviewItem = await this.itemService.getReviewItem(queueId);
            }

            this.reviewItemTags = this.reviewItem?.tags || [];
            this.loadingReviewItem = false;
        } catch (e) {
            this.loadingReviewItem = false;
            this.loadingReviewItemError = e;
        }
    }

    @action
    async getItem(itemId: string, queueId?: string, consealed?: boolean) {
        this.loadingReviewItemError = null;
        this.itemUpdatingError = null;
        if (!consealed) {
            this.loadingReviewItem = true;
        }

        try {
            this.reviewItem = await this.itemService.getItem(itemId, queueId);
            this.reviewItemTags = this.reviewItem?.tags || [];
            this.loadingReviewItem = false;
        } catch (e) {
            this.loadingReviewItem = false;
            this.reviewItemTags = [];
            this.loadingReviewItemError = e;
        }
    }

    @action
    async updateItemTagsAndNotes(itemId: string, queueId?: string) {
        this.loadingReviewItemError = null;
        this.itemUpdatingError = null;

        try {
            const updatedItem = await this.itemService.getItem(itemId, queueId);
            this.reviewItemTags = updatedItem?.tags || [];
            this.reviewItem!.tags = updatedItem?.tags || [];
            this.reviewItem!.notes = updatedItem?.notes || [];
            this.loadingReviewItem = false;
        } catch (e) {
            this.loadingReviewItem = false;
            this.reviewItemTags = [];
            this.loadingReviewItemError = e;
        }
    }

    @action
    startReview(queue: Queue, item?: Item | null) {
        if (item) {
            this.getReviewItem(queue.viewId, item.id);
        } else {
            this.getReviewItem(queue.viewId);
        }
    }

    @action
    async labelOrder(label: LABEL) {
        if (this.reviewItem && this.queue) {
            this.loadingReviewItem = true;
            try {
                await this.itemService.labelItem(this.reviewItem.id, label, this.queue.viewId);
            } catch (e) {
                this.itemUpdatingError = e;
                this.appStore.showToast({
                    type: NOTIFICATION_TYPE.GENERIC_ERROR,
                    message: 'The label was not applied. Probably, the current item has been unlocked.'
                });

                return;
            } finally {
                this.loadingReviewItem = false;
            }

            this.appStore.showToast({
                type: NOTIFICATION_TYPE.LABEL_ADDED_SUCCESS,
                label
            });
            this.reviewItem = null;
            this.getQueueData(this.queue.viewId);
        }
    }

    @action
    async getQueueData(queueId?: string) {
        if (!queueId) return;

        this.loadingQueueData = true;
        try {
            this.queue = await this.queueService.getQueue(queueId);
            runInAction(() => {
                this.loadingQueueData = false;
            });
        } catch (e) {
            runInAction(() => {
                this.loadingQueueData = false;
                this.loadingQueueDataError = e;
                throw e;
            });
        } finally {
            runInAction(() => {
                this.loadingQueueData = false;
            });
        }
    }

    @action
    async finishReviewProcess(itemId: string) {
        const currentQueueViewId = this.queue?.viewId;
        await this.itemService.finishReview(itemId, currentQueueViewId);
    }

    @action
    clearQueueData() {
        this.queue = null;
    }

    @action
    setIsInAddNoteMode(newValue: boolean) {
        this.isInAddNoteMode = newValue;
    }

    @action
    setNewNoteValue(text: string) {
        this.noteToAdd = text;
    }

    @action
    discardNewNote() {
        this.isInAddNoteMode = false;
        this.noteToAdd = '';
    }

    @action
    async submitNewNote() {
        this.isInAddNoteMode = false;
        this.isNoteSubmitting = true;
        const currentItemId = this.reviewItem?.id;
        const currentQueueViewId = this.queue?.viewId;
        if (!currentItemId || !currentQueueViewId) {
            return;
        }

        try {
            await this.itemService.putItemNote(currentItemId, this.noteToAdd, currentQueueViewId);
            await this.updateItemTagsAndNotes(currentItemId, currentQueueViewId);
        } catch (e) {
            this.itemUpdatingError = e;
            this.appStore.showToast({
                type: NOTIFICATION_TYPE.GENERIC_ERROR,
                message: 'The note was not added. Probably, the current item has been unlocked.'
            });
        } finally {
            this.isNoteSubmitting = false;
            this.noteToAdd = '';
        }
    }

    /**
     * Tags management
     */
    @action
    setNewTagValue(text: string) {
        this.tagToAdd = text;
    }

    @action
    setIsInAddTagMode(value: boolean) {
        this.isInAddTagMode = value;
        this.reviewItemTags = this.reviewItem?.tags || [];
    }

    @action
    setReviewItemTags(tags: string[]) {
        this.reviewItemTags = tags;
    }

    @action
    async addNewTag(tag: string) {
        this.isTagSubmitting = true;
        await this.itemService.putTag(tag);
        this.isTagSubmitting = false;
    }

    @action
    getTagSuggestions(term: string) {
        return this.itemService.searchTag(term);
    }

    @action
    async submitNewTags() {
        if (this.reviewItem && this.queue) {
            this.isTagSubmitting = true;
            const currentItemId = this.reviewItem.id;
            const currentQueueViewId = this.queue.viewId;
            try {
                await this.itemService.patchItemTags(this.reviewItem.id, this.reviewItemTags, currentQueueViewId);
                await this.updateItemTagsAndNotes(currentItemId, currentQueueViewId);
            } catch (e) {
                this.itemUpdatingError = e;
                this.appStore.showToast({
                    type: NOTIFICATION_TYPE.GENERIC_ERROR,
                    message: 'The item tags were not updated. Probably, the current item has been unlocked.'
                });

                return;
            } finally {
                this.isTagSubmitting = false;
                this.isInAddTagMode = false;
                this.tagToAdd = '';
            }
        }
    }

    @action
    discardNewTags() {
        this.isInAddTagMode = false;
        this.tagToAdd = '';
        this.reviewItemTags = this.reviewItem?.tags || [];
    }

    @action
    setSearchId(id: string) {
        this.searchId = id;
    }

    @action
    clearSearchId() {
        this.searchId = '';
    }

    @computed
    get externalLinksMap(): ExternalLink[] {
        if (!this.reviewItem || !this.settings || this.settings.length === 0) {
            return [];
        }

        const populateTemplateUrl = (template: string, path: string, item: Item) => {
            try {
                const { rawPurchase } = item.purchase;

                const value = lGet({ purchase: rawPurchase }, path);
                return template.replace('#', value);
            } catch (e) {
                return '';
            }
        };

        const populateIcon = (name: string) => {
            switch (name) {
                case 'LinkedIn':
                    return 'LinkedInLogo';
                case 'Facebook':
                case 'Twitter':
                default:
                    return null;
            }
        };

        return this.settings.map(set => {
            const { fieldPath, template, name } = set;

            return {
                url: populateTemplateUrl(template, fieldPath, this.reviewItem!),
                name,
                icon: populateIcon(name)
            };
        });
    }

    private async loadSettings() {
        const settings = await this.settingsService.getSettings(SETTING_TYPE.REVIEW_CONSOLE_LINKS);

        if (settings) {
            this.settings = settings;
        }
    }
}
