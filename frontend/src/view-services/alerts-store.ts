// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import { action, observable } from 'mobx';
import { ALERT_MUTATION_TYPE } from '../constants';
import { AlertsService } from '../data-services/interfaces/alerts-service';
import { Alert } from '../models';
import { TYPES } from '../types';
import { Logger } from '../utility-services';

@injectable()
export class AlertsStore {
    @observable
    alerts: Alert[] = [];

    @observable
    loading: boolean = false;

    @observable
    performingMutation: boolean = false;

    @observable
    activeMutationType: ALERT_MUTATION_TYPE | null = null;

    @observable
    alertsInMutation: string[] = [];

    constructor(
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
        @inject(TYPES.ALERTS_SERVICE) private alertsService: AlertsService
    ) {}

    @action
    async loadAlerts() {
        this.loading = true;

        try {
            this.alerts = await this.alertsService.getAlerts();
        } finally {
            this.loading = false;
        }
    }

    @action
    getAlertById(alertId: string): Alert | undefined {
        return this.alerts.find(({ id }) => id === alertId);
    }

    @action
    async performMutation(alert: Alert, mutationType: ALERT_MUTATION_TYPE) {
        this.performingMutation = true;
        this.activeMutationType = mutationType;
        this.alertsInMutation.push(alert.id);

        let response;
        if (mutationType === ALERT_MUTATION_TYPE.CREATE) {
            response = await this.alertsService.createAlert(alert);
        }

        if (mutationType === ALERT_MUTATION_TYPE.EDIT) {
            response = await this.alertsService.updateAlert(alert);
        }

        if (mutationType === ALERT_MUTATION_TYPE.DELETE) {
            response = await this.alertsService.deleteAlert(alert);
        }

        await this.loadAlerts();
        this.alertsInMutation.splice(this.alertsInMutation.findIndex(id => id === alert.id), 1);
        this.performingMutation = false;
        this.activeMutationType = null;
        return response;
    }

    @action
    toggleActive(alertId: string, active: boolean) {
        const alertToUpdate = this.alerts.find(({ id }) => id === alertId);
        if (alertToUpdate) {
            alertToUpdate.setActive(active);
            this.performMutation(alertToUpdate, ALERT_MUTATION_TYPE.EDIT);
        }
    }
}
