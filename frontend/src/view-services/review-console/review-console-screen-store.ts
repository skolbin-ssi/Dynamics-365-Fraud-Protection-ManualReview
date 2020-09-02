import { inject, injectable } from 'inversify';
import lGet from 'lodash/get';
import { action, computed, observable } from 'mobx';
import { LABEL, SETTING_TYPE } from '../../constants';
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

    @observable isInAddNoteMode: boolean = false;

    @observable isInAddTagMode: boolean = false;

    @observable isNoteSubmitting: boolean = false;

    @observable isTagSubmitting: boolean = false;

    @observable noteToAdd: string = '';

    @observable tagToAdd: string = '';

    @observable reviewItemTags: string[] = [];

    @observable settings: Setting[] = [];

    @computed get blockActionButtons(): boolean {
        return (!!this.queue && !this.queue.size)
            || !!this.loadingQueueDataError
            || !!this.loadingReviewItemError;
    }

    constructor(
        @inject(TYPES.ITEM_SERVICE) private itemService: ItemService,
        @inject(TYPES.QUEUE_SERVICE) private queueService: QueueService,
        @inject(TYPES.LOCKED_ITEMS_STORE) private lockedItemsStore: LockedItemsStore,
        @inject(TYPES.SETTINGS_SERVICE) private settingsService: SettingsService
    ) {
        this.loadSettings();
    }

    @action
    async getReviewItem(queueId: string, itemId?: string) {
        this.loadingReviewItem = true;
        this.loadingReviewItemError = null;

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
    startReview(queue: Queue, item?: Item) {
        if (queue.sortingLocked) {
            this.getReviewItem(queue.viewId);
        } else {
            this.getReviewItem(queue.viewId, (item as Item).id);
        }
    }

    @action
    async labelOrder(label: LABEL) {
        if (this.reviewItem && this.queue) {
            await this.itemService.labelItem(this.reviewItem.id, label);
            this.reviewItem = null;
            this.getQueueData(this.queue.viewId);
        }
    }

    @action
    async getQueueData(queueId: string) {
        this.loadingQueueData = true;
        try {
            this.queue = await this.queueService.getQueue(queueId);
            this.loadingReviewItem = false;
        } catch (e) {
            this.loadingReviewItem = false;
            this.loadingReviewItemError = e;
            throw e;
        }
    }

    @action
    async finishReviewProcess(itemId: string) {
        await this.itemService.finishReview(itemId);
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
    submitNewNote() {
        this.isInAddNoteMode = false;
        this.isNoteSubmitting = true;
        const currentItemId = this.reviewItem?.id;
        const currentQueueId = this.queue?.queueId;
        if (!currentItemId || !currentQueueId) {
            return;
        }

        this.itemService
            .putItemNote(currentItemId, this.noteToAdd)
            .then(() => {
                this.getItem(currentItemId, currentQueueId, true);
            })
            .finally(() => {
                this.isNoteSubmitting = false;
                this.noteToAdd = '';
            });
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
        this.isTagSubmitting = true;

        if (this.reviewItem && this.queue) {
            const currentItemId = this.reviewItem.id;
            const currentQueueId = this.queue.queueId;

            await this.itemService.patchItemTags(this.reviewItem.id, this.reviewItemTags);
            await this.getItem(currentItemId, currentQueueId, true);
            this.isTagSubmitting = false;
            this.isInAddTagMode = false;
            this.tagToAdd = '';
        }
    }

    @action
    discardNewTags() {
        this.isInAddTagMode = false;
        this.tagToAdd = '';
        this.reviewItemTags = this.reviewItem?.tags || [];
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
