// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LABEL, QUEUE_VIEW_TYPE } from '../../../constants';
import { ItemFilterDTO } from './item-filter-dto';
import { QueueSortingSettingsDTO } from './queue-sorting-settings-dto';
import { QueueViewByTypeDto } from './queue-view-by-type-dto';

/**
 * QueueDTO model from API
 */
export interface QueueViewDTO {
    queueId: string;
    viewId: string;
    name: string;
    created: string;
    updated: string;
    size: number;
    allowedLabels: LABEL[];
    reviewers: string[];
    supervisors: string[];
    sorting: QueueSortingSettingsDTO;
    filters: ItemFilterDTO[];

    /**
     * string($PnDTnHnMn.nS)
     * example: PT15M30S
     */
    processingDeadline: string;
    viewType: QUEUE_VIEW_TYPE;
    views: QueueViewByTypeDto[]

    /**
     * Determines if queue is a residual queue
     * The one that contains all order that did not apply to any created queue by their filters
     */
    residual: boolean;
}
