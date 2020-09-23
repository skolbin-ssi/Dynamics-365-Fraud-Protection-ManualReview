// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DataTransformer } from '../../data-transformer';
import { BaseDashboardTransformer } from './base-dashboard-transformer';
import {
    GetItemPlacementMetricsResponse,
    GetItemPlacementMetricsResponseArray
} from '../../api-services/dashboard-api-service/item-placement/api-models';
import { ItemPlacementMetrics } from '../../../models/dashboard/deman-supply';

export class GetItemPlacementMetricsTransformer extends BaseDashboardTransformer implements DataTransformer {
    mapResponse(
        getItemMetricsPlacementResponse: GetItemPlacementMetricsResponse
    ): ItemPlacementMetrics {
        return new ItemPlacementMetrics().fromDTO(getItemMetricsPlacementResponse);
    }

    mapResponseToArray(getItemMetricsPlacementResponse: GetItemPlacementMetricsResponseArray): ItemPlacementMetrics[] {
        return getItemMetricsPlacementResponse.map(item => new ItemPlacementMetrics().fromDTO(item));
    }
}
