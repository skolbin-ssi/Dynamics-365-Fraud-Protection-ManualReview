// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ALERT_METRIC_TYPE, ALERT_THRESHOLD_OPERATOR } from '../../../constants';

interface AlertCheckDTO {
    result: boolean;
    value: number;
    /* date string */
    checked: string;
    message: string;
}

interface AlertNotificationDTO {
    /* date string */
    sent: string;
    email: string;
}

export interface AlertDTO {
    id: string;
    name: string;
    custom: boolean;
    ownerId: string;
    metricType: ALERT_METRIC_TYPE;
    period: string;
    thresholdOperator: ALERT_THRESHOLD_OPERATOR;
    thresholdValue: number;
    queues: string[];
    analysts: string[];
    active: boolean;
    lastCheck: AlertCheckDTO;
    lastNotification: AlertNotificationDTO
}

export type NewAlertDTO = Pick<AlertDTO, 'name' | 'metricType' | 'period' | 'thresholdOperator' | 'thresholdValue' | 'queues' | 'analysts' | 'active'>;
