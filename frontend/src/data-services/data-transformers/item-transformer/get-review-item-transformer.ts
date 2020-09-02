import {
    ADDRESS_TYPE,
    GeoAddress,
    Item,
    Purchase
} from '../../../models';
import { AzureMapsSearch, LocationAsArray, UserBuilder } from '../../../utility-services';
import { LockQueueItemResponse } from '../../api-services/queue-api-service/api-models';
import { DataTransformer } from '../../data-transformer';
import { UserService } from '../../interfaces';
import { BaseItemTransformer } from './base-item-transformer';

export class GetReviewItemTransformer extends BaseItemTransformer implements DataTransformer {
    constructor(
        private readonly userService: UserService,
        private readonly userBuilder: UserBuilder,
        private readonly azureMapsSearch: AzureMapsSearch
    ) {
        super();
    }

    mapResponse(
        getQueueItemsResponse: LockQueueItemResponse
    ): Item {
        const itemModel = new Item();
        const populatedItem = itemModel.fromDTO(getQueueItemsResponse);

        if (populatedItem.notes?.length) {
            populatedItem.notes.forEach(note => {
                const user = this.userBuilder.buildById(note.userId);
                if (user) {
                    note.setUser(user);
                }
            });
        }

        this.populateGeoAddressList(populatedItem.purchase)
            .then(list => {
                populatedItem.purchase.geoAddressList = list;
                /**
                 * Requires S1 pricing tire.
                 */
                this.populateDistances(populatedItem);
            });

        return populatedItem;
    }

    private async populateGeoAddressList(purchase: Purchase): Promise<GeoAddress[]> {
        const promises: Promise<LocationAsArray>[] = [];

        purchase.addressList.forEach(address => {
            promises.push(this.azureMapsSearch.getLocationByAddress(address));
        });

        return Promise
            .all(promises)
            .then(location => purchase
                .addressList
                .map((address, index) => new GeoAddress(address, location[index][0], location[index][1])));
    }

    private async populateDistances(item: Item) {
        const { getDistance } = this.azureMapsSearch;
        const { geoAddressList, deviceContext } = item.purchase;
        const [shippingAddress] = geoAddressList.filter(gA => gA.address.type === ADDRESS_TYPE.SHIPPING);
        const promises: ReturnType<typeof getDistance>[] = [];

        geoAddressList.forEach(gA => {
            if (gA.address.type !== ADDRESS_TYPE.SHIPPING) {
                promises.push(this.azureMapsSearch.getDistance(shippingAddress, gA));
            }
        });

        promises.push(this.azureMapsSearch.getDistance(shippingAddress, deviceContext.address));

        return Promise
            .all(promises)
            .then(distances => {
                distances.forEach(({ address1, address2, distance }) => {
                    if (address1) {
                        address1.setDistanceToAddress(address2, distance);
                    }
                    if (address2) {
                        address2.setDistanceToAddress(address1, distance);
                    }
                });
            });
    }
}
