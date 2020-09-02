import { inject, injectable } from 'inversify';
import { DICTIONARY_TYPE, LABEL, SETTING_TYPE } from '../../constants';
import { Item, Queue } from '../../models';
import { TYPES } from '../../types';
import { AzureMapsSearch, Logger, UserBuilder } from '../../utility-services';
import { SettingDTO } from '../api-services/models';
import { BaseDomainService } from '../base-domain-service';
import { GetLockedItemsTransformer, GetReviewItemTransformer } from '../data-transformers';
import {
    DictionaryApiService,
    ItemApiService,
    ItemService,
    QueueApiService,
    SettingsApiService,
    UserService
} from '../interfaces';

@injectable()
export class ItemServiceImpl extends BaseDomainService implements ItemService {
    private settingsMap: Map<SETTING_TYPE, SettingDTO[]> = new Map();

    constructor(
        @inject(TYPES.ITEM_API_SERVICE) private readonly itemApiService: ItemApiService,
        @inject(TYPES.QUEUE_API_SERVICE) private readonly queueApiService: QueueApiService,
        @inject(TYPES.USER_SERVICE) private readonly userService: UserService,
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
        @inject(TYPES.USER_BUILDER) protected readonly userBuilder: UserBuilder,
        @inject(TYPES.AZURE_MAPS_SEARCH) protected readonly azureMapsSearch: AzureMapsSearch,
        @inject(TYPES.DICTIONARY_API_SERVICE) private readonly dictionaryApiService: DictionaryApiService,
        @inject(TYPES.SETTINGS_API_SERVICE) private readonly settingsApiService: SettingsApiService
    ) {
        super(logger, 'ItemService');
        this.loadSettings(SETTING_TYPE.REVIEW_CONSOLE_LINKS);
    }

    /**
     * Get list of queues
     * @param queueId
     */
    async getReviewItem(
        queueId: string
    ): Promise<Item | null> {
        const dataTransformer = new GetReviewItemTransformer(this.userService, this.userBuilder, this.azureMapsSearch);
        let response;

        try {
            response = await this.queueApiService.lockTopQueueItem(queueId);
        } catch (e) {
            throw this.handleApiException('lockTopQueueItem', e, {
                500: `Failed to lock top queue item for ${queueId}`
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getReviewItem',
                    'Failed to parse response from API while locking top queue item',
                    e
                );
            }
        } else if (response.status === 204) {
            throw this.handleException(
                'getReviewItem',
                'All of the items in this queue are locked',
                new Error('All of the items in this queue are locked')
            );
        }

        return null;
    }

    async getUnorderedQueueReviewItem(
        queueId: string,
        itemId: string
    ): Promise<Item | null> {
        const dataTransformer = new GetReviewItemTransformer(this.userService, this.userBuilder, this.azureMapsSearch);
        let response;

        try {
            response = await this.queueApiService.lockQueueItem(queueId, itemId);
        } catch (e) {
            throw this.handleApiException('lockQueueItem', e, {
                500: `Failed to lock queue item ${itemId} for queue ${queueId}`
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getUnorderedQueueReviewItem',
                    'Failed to parse response from API while locking queue item',
                    e
                );
            }
        } else if (response.status === 204) {
            throw this.handleException(
                'getUnorderedQueueReviewItem',
                'All of the items in this queue are locked',
                new Error('All of the items in this queue are locked')
            );
        }

        return null;
    }

    async startReview(queue: Queue, item?: Item): Promise<Item | null> {
        let reviewItem = null;

        if (queue.sortingLocked) {
            reviewItem = await this.getReviewItem(queue.viewId);
        } else if (item) {
            reviewItem = await this.getUnorderedQueueReviewItem(queue.viewId, item.id);
        }
        return reviewItem;
    }

    async finishReview(itemId: string): Promise<Item | null> {
        const dataTransformer = new GetReviewItemTransformer(this.userService, this.userBuilder, this.azureMapsSearch);
        let response;

        try {
            response = await this.itemApiService.deleteItemLock(itemId);
        } catch (e) {
            throw this.handleApiException('deleteItemLock', e, {
                500: `Failed to unlock queue item ${itemId}`
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'finishReview',
                    'Failed to parse response from API while unlocking the queue item',
                    e
                );
            }
        }

        return null;
    }

    async getItem(itemId: string, queueId?: string): Promise<Item | null> {
        const dataTransformer = new GetReviewItemTransformer(this.userService, this.userBuilder, this.azureMapsSearch);

        let response;

        try {
            response = await this.itemApiService.getItem(itemId, queueId);
        } catch (e) {
            throw this.handleApiException('getItem', e, {
                500: `Failed to load order item with id ${itemId}`
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getItem',
                    'Failed to parse response from API while locking top queue item',
                    e
                );
            }
        } else if (response.status === 204) {
            throw this.handleException(
                'getItem',
                'All of the items in this queue are locked',
                new Error('All of the items in this queue are locked')
            );
        }

        return null;
    }

    /**
     * label item
     * @param itemId
     * @param label
     */
    async labelItem(
        itemId: string,
        label: LABEL
    ) {
        let response;

        try {
            response = await this.itemApiService.patchItemLabel(itemId, label);
        } catch (e) {
            throw this.handleApiException('labelItem', e, {
                500: `Failed to apply label to an item ${itemId}`
            });
        }

        try {
            // return dataTransformer.mapResponse(response.data);
            return response;
        } catch (e) {
            throw this.handleException(
                'getReviewItem',
                'Failed to parse response from API while locking top queue item',
                e
            );
        }
    }

    async putItemNote(
        itemId: string,
        note: string
    ) {
        try {
            return await this.itemApiService.putItemNote(itemId, note);
        } catch (e) {
            throw this.handleApiException('putItemNote', e, {
                500: `Failed to add note to an item ${itemId}`
            });
        }
    }

    async patchItemTags(
        itemId: string,
        tags: string[]
    ) {
        try {
            return await this.itemApiService.patchItemTag(itemId, tags);
        } catch (e) {
            throw this.handleApiException('putItemTag', e, {
                500: `Failed to add tag to an item ${itemId}`
            });
        }
    }

    async getLockedItems() {
        const dataTransformer = new GetLockedItemsTransformer();
        let response;

        try {
            response = await this.itemApiService.getLockedItems();
        } catch (e) {
            throw this.handleApiException('getLockedItems', e, {
                500: 'Failed to get locked items'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getLockedItems',
                    'Failed to parse response from API while trying to get locked items',
                    e
                );
            }
        }

        return null;
    }

    /**
     * Search for Tag to use in Tag picker
     * @param term - search term
     */
    async searchTag(term: string) {
        try {
            const response = await this.dictionaryApiService.getDictionaryValues(DICTIONARY_TYPE.TAG, term);
            return response.data;
        } catch (e) {
            return [];
        }
    }

    async putTag(tag: string) {
        return this.dictionaryApiService.postDictionaryValues(DICTIONARY_TYPE.TAG, tag);
    }

    private getSettings(type: SETTING_TYPE) {
        if (this.settingsMap.has(type)) {
            return this.settingsMap.get(type);
        }

        return null;
    }

    private async loadSettings(type: SETTING_TYPE) {
        try {
            const { data } = await this.settingsApiService.getSettingValues(type);
            this.settingsMap.set(type, data);
        } catch (e) {
            this.logger.warn('Failed to load item settings');
        }
    }
}
