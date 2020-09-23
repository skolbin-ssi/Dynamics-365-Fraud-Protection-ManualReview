// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { action, computed, observable } from 'mobx';
import {
    ALERT_METRIC_TYPE,
    ALERT_MUTATION_TYPE,
    ALERT_THRESHOLD_OPERATOR,
    PERIOD_DURATION_TYPE,
    PERIOD_DURATION_TYPE_SHORT
} from '../constants';
import { UserService } from '../data-services/interfaces';
import { Alert } from '../models';
import { TYPES } from '../types';
import { AlertsStore } from './alerts-store';
import { QueueStore } from './queues';

@injectable()
export class AlertsMutationStore {
    @observable alert: Alert | null = null;

    @computed
    get mutationType(): ALERT_MUTATION_TYPE {
        if (this.alert && this.alert.id) {
            return ALERT_MUTATION_TYPE.EDIT;
        }

        return ALERT_MUTATION_TYPE.CREATE;
    }

    @computed
    get loading(): boolean {
        return !this.alert;
    }

    @computed
    get alertFulfilled(): boolean {
        return !!this.alert
            && !!this.alert.name.length;
    }

    constructor(
        @inject(TYPES.ALERTS_STORE) private alertsStore: AlertsStore,
        @inject(TYPES.USER_SERVICE) private userService: UserService,
        @inject(TYPES.QUEUE_STORE) private queueStore: QueueStore
    ) {
        if (!queueStore.queues && !queueStore.loadingQueues) {
            queueStore.loadQueues();
        }
    }

    @action
    initMutation(id?: string) {
        if (id) {
            const alert = this.alertsStore.getAlertById(id);
            if (alert) {
                this.alert = alert;
            }
        } else {
            this.alert = new Alert();
        }
    }

    @computed
    get analyticModels() {
        if (!this.alert) {
            return [];
        }

        const { analysts } = this.alert;
        const users = this.userService.getUsers();
        if (!users) {
            return [];
        }

        return users.filter(({ id }) => analysts.includes(id));
    }

    @computed
    get queueModels() {
        if (!this.alert) {
            return [];
        }

        const { queues } = this.alert;
        const queueModels = this.queueStore.queues;
        if (!queueModels) {
            return [];
        }

        return queueModels.filter(({ queueId }) => queues.includes(queueId));
    }

    @computed
    get nonSelectedAnalysts() {
        const users = this.userService.getUsers();
        if (!users || !this.alert) {
            return [];
        }

        const { analysts } = this.alert;
        return users.filter(({ id }) => !analysts.includes(id));
    }

    @computed
    get nonSelectedQueues() {
        const { queues: allQueues } = this.queueStore;
        if (!allQueues || !this.alert) {
            return [];
        }

        const { queues } = this.alert;
        return allQueues.filter(({ queueId }) => !queues.includes(queueId));
    }

    @action
    addAnalyst(analystId: string) {
        if (this.alert) {
            this.alert.analysts.push(analystId);
        }
    }

    @action
    addQueue(queueId: string) {
        if (this.alert) {
            this.alert.queues.push(queueId);
        }
    }

    @action
    removeAnalyst(analystId: string) {
        if (this.alert) {
            this.alert.analysts = this.alert.analysts.filter(rId => rId !== analystId);
        }
    }

    @action
    removeQueue(queueId: string) {
        if (this.alert) {
            this.alert.queues = this.alert.queues.filter(rId => rId !== queueId);
        }
    }

    @action
    setName(name: string) {
        if (this.alert) {
            this.alert.name = name;
        }
    }

    @action
    setMetricType(metricType: ALERT_METRIC_TYPE) {
        if (this.alert) {
            this.alert.metricType = metricType;
        }
    }

    @action
    setPeriod(periodDuration: number, durationType: PERIOD_DURATION_TYPE) {
        if (this.alert) {
            let period;
            if ([PERIOD_DURATION_TYPE.YEARS, PERIOD_DURATION_TYPE.WEEKS, PERIOD_DURATION_TYPE.MONTHS, PERIOD_DURATION_TYPE.DAYS].includes(durationType)) {
                period = `P${periodDuration}${PERIOD_DURATION_TYPE_SHORT[durationType]}T0H`;
            } else {
                period = `P0DT${periodDuration}${PERIOD_DURATION_TYPE_SHORT[durationType]}`;
            }

            this.alert.period = period;
        }
    }

    @action
    setThresholdOperator(operator: ALERT_THRESHOLD_OPERATOR) {
        if (this.alert) {
            this.alert.thresholdOperator = operator;
        }
    }

    @action
    setThresholdValue(value: number) {
        if (this.alert) {
            this.alert.thresholdValue = value;
        }
    }
}
