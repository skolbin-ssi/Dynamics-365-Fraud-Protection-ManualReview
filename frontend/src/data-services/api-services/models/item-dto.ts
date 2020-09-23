// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ItemHoldDTO } from './item-hold-dto';
import { ItemLockDTO } from './item-lock-dto';
import { ItemNoteDTO } from './item-note-dto';
import { PurchaseDTO } from './purchase-dto';
import { DecisionDTO } from './decision-dto';
import { ItemLabelDTO } from './item-label-dto';

/**
 * Item details model from API
 */
export interface ItemDTO {
    id: string;
    /* string($date-time) */
    imported: string;
    /* string($date-time) */
    enriched: string;
    /* string($date-time) */
    active: boolean;
    label: ItemLabelDTO;
    notes: ItemNoteDTO[];
    tags: string[];
    purchase: PurchaseDTO;
    decision?: DecisionDTO;
    lock: ItemLockDTO;
    hold: ItemHoldDTO;
    reviewers: string[];
    ttl: number;
    get_etag: string;
}
