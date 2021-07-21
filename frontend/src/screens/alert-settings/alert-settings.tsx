// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './alert-settings.scss';

import autobind from 'autobind-decorator';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { CommandBarButton } from '@fluentui/react/lib/Button';

import { ALERT_MUTATION_TYPE, ROUTES } from '../../constants';
import { TYPES } from '../../types';
import { AlertsStore } from '../../view-services';
import { AlertsList } from './alerts-list';

const CN = 'alert-settings';

@observer
export class AlertSettings extends Component<RouteComponentProps, never> {
    @resolve(TYPES.ALERTS_STORE)
    private alertsStore!: AlertsStore;

    @resolve(TYPES.HISTORY)
    private history!: History;

    componentDidMount() {
        this.alertsStore.loadAlerts();
    }

    @autobind
    async handleAlertDeletion(alertId: string) {
        const { alerts } = this.alertsStore;
        const alertToDelete = alerts.find(({ id }) => id === alertId);
        if (alertToDelete) {
            await this.alertsStore.performMutation(alertToDelete, ALERT_MUTATION_TYPE.DELETE);
        }
    }

    @autobind
    handleAlertActiveToggle(alertId: string, checked: boolean) {
        this.alertsStore.toggleActive(alertId, checked);
    }

    @autobind
    onNavToCreate() {
        this.history.push({ pathname: ROUTES.ALERT_CREATE });
    }

    render() {
        const { alerts, loading } = this.alertsStore;

        return (
            <div className={CN}>
                <div className={`${CN}__action-bar`}>
                    <CommandBarButton
                        text="Add new alert"
                        iconProps={{ iconName: 'Add' }}
                        className={`${CN}__action-bar-btn`}
                        onClick={this.onNavToCreate}
                    />
                </div>
                <AlertsList
                    alerts={alerts}
                    loadingAlerts={loading}
                    className={`${CN}__alerts-list`}
                    alertsInMutation={[]}
                    // alertsInMutation={alertsInMutation}
                    onDelete={this.handleAlertDeletion}
                    onToggleActive={this.handleAlertActiveToggle}
                />
            </div>
        );
    }
}
