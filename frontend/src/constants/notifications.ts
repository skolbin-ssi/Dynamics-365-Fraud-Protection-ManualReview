// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export enum TOAST_TYPE {
    SUCCESS = 'success',
    ERROR = 'error',
    GOOD = 'good',
    BAD = 'bad',
    WATCH = 'watch',
    ESCALATE = 'escalate',
    HOLD = 'hold',
}

export enum NOTIFICATION_TYPE {
    LABEL_ADDED_SUCCESS = 'LABEL_ADDED_SUCCESS',
    LABEL_ADDED_ERROR = 'LABEL_ADDED_ERROR',
    NOTE_ADDED_ERROR = 'NOTE_ADDED_ERROR',
    TAGS_UPDATED_ERROR = 'TAGS_UPDATED_ERROR',
    QUEUE_MUTATION_SUCCESS = 'QUEUE_MUTATION_SUCCESS',
    QUEUE_MUTATION_ERROR = 'QUEUE_MUTATION_ERROR',
    CUSTOM = 'CUSTOM',
}

export const DEFAULT_SUCCESS_TOAST_TIMEOUT = 3000; // 3 sec
