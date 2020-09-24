// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { QueueViewDTO } from '../../models';

type PatchQueueRequestFields = 'name' | 'reviewers' | 'processingDeadline' | 'supervisors';
export type PatchQueueRequest = Pick<QueueViewDTO, PatchQueueRequestFields>;
export type PatchQueueResponse = QueueViewDTO[];
