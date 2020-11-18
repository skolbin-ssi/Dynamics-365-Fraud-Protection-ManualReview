// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { MessageBarType } from '@fluentui/react/lib/MessageBar';
import {
    LABEL,
    QUEUE_MUTATION_TYPES,
    NOTIFICATION_TYPE,
    TOAST_TYPE,
} from '../constants';

export interface ToastSettings {
    title: string;
    type: TOAST_TYPE;
    messageBarType: MessageBarType;
    iconName: string;
}

export interface Toast extends ToastSettings {
    message: string | JSX.Element;
}

export type Notification =
    | {
        type: NOTIFICATION_TYPE.LABEL_ADDED_SUCCESS,
        label: LABEL,
    }
    | {
        type: NOTIFICATION_TYPE.QUEUE_MUTATION_SUCCESS,
        mutation: QUEUE_MUTATION_TYPES;
        queueName: string;
    }
    | {
        type: NOTIFICATION_TYPE.QUEUE_MUTATION_ERROR,
        mutation: QUEUE_MUTATION_TYPES;
        queueName: string;
    }
    | {
        type: NOTIFICATION_TYPE.GENERIC_ERROR,
        message: string;
    }
    | {
        type: NOTIFICATION_TYPE.CUSTOM,
        dismissTimeout: number,
        details: Toast
    };
