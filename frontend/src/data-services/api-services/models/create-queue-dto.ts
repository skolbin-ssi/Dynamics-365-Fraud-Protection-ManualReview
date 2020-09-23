// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { QueueViewDTO } from './queue-view-dto';

type PostQueueRequestFields =
    'name'
    | 'allowedLabels'
    | 'reviewers'
    | 'sorting'
    | 'filters'
    | 'processingDeadline';

export interface CreateQueueDTO extends Pick<QueueViewDTO, PostQueueRequestFields> {
    supervisors: string[];
}
