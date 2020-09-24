// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ItemPlacementMetricDTO } from '../../../data-services/api-services/models/dashboard/demand-supply';

export class ItemPlacementMetric implements ItemPlacementMetricDTO {
    received: number = 0;

    reviewed: number = 0;

    released: number = 0;

    fromDTO(itemPlacementMetricDTO: ItemPlacementMetricDTO) {
        this.received = itemPlacementMetricDTO.received;
        this.reviewed = itemPlacementMetricDTO.reviewed;
        this.released = itemPlacementMetricDTO.released;

        return this;
    }
}
