// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LABEL } from '../../../constants';

export interface ItemLabelDTO {
    value: LABEL;
    authorId: string;
    queueId: string;
    /* string($date-time) */
    labeled: string;
}
