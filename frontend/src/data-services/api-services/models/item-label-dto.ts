// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LABEL } from '../../../constants';

export interface ItemLabelDTO {
    value: LABEL;
    authorId: string;
    /* string($date-time) */
    labeled: string;
}
