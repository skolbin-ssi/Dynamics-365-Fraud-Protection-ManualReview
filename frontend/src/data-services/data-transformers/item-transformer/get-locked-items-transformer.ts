import { Item } from '../../../models';
import { DataTransformer } from '../../data-transformer';
import { BaseItemTransformer } from './base-item-transformer';
import { GetLockedItemsResponse } from '../../api-services/item-api-service/api-models';
import { ItemDTO } from '../..';

export class GetLockedItemsTransformer extends BaseItemTransformer implements DataTransformer {
    mapResponse(
        getLockedItemsResponse: GetLockedItemsResponse
    ): Item[] {
        return getLockedItemsResponse.map(this.mapItem.bind(this));
    }

    protected mapItem(item: ItemDTO) {
        const itemModel = new Item();
        return itemModel.fromDTO(item);
    }
}
