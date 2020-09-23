// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CommandBarButton } from '@fluentui/react/lib/Button';
import { Overlay } from '@fluentui/react/lib/Overlay';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';
import autobind from 'autobind-decorator';
import cn from 'classnames';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ALERT_MUTATION_TYPE, ROUTES } from '../../constants';
import { TYPES } from '../../types';
import { AlertsMutationStore, AlertsStore } from '../../view-services';
import { AlertEditForm } from './alert-edit-form';
import './alert-edit.scss';

const CN = 'alert-edit';

export interface AlertEditPageRouteParams {
    itemId?: string;
}

export type AlertEditComponentProps = RouteComponentProps<AlertEditPageRouteParams>;

@observer
export class AlertEdit extends Component<AlertEditComponentProps, never> {
    @resolve(TYPES.ALERTS_STORE)
    private alertsStore!: AlertsStore;

    @resolve(TYPES.ALERTS_MUTATION_STORE)
    private alertsMutationStore!: AlertsMutationStore;

    @resolve(TYPES.HISTORY)
    private history!: History;

    async componentDidMount() {
        const { alerts, loading } = this.alertsStore;
        const { match } = this.props;
        const { params } = match;
        const { itemId } = params;

        if (!alerts.length && !loading) {
            await this.alertsStore.loadAlerts();
        }

        this.alertsMutationStore.initMutation(itemId);
    }

    @autobind
    onCancel() {
        this.history.push({ pathname: ROUTES.ALERT_SETTINGS });
    }

    @autobind
    async onSave() {
        const { alert, mutationType, alertFulfilled } = this.alertsMutationStore;
        if (alert && alertFulfilled) {
            await this.alertsStore.performMutation(alert, mutationType);
            this.history.push({ pathname: ROUTES.ALERT_SETTINGS });
        }
    }

    @autobind
    async onDelete() {
        const { alert, alertFulfilled } = this.alertsMutationStore;
        if (alert && alertFulfilled) {
            await this.alertsStore.performMutation(alert, ALERT_MUTATION_TYPE.DELETE);
            this.history.push({ pathname: ROUTES.ALERT_SETTINGS });
        }
    }

    @autobind
    renderProcessing() {
        const { activeMutationType } = this.alertsStore;
        let label = '';
        switch (activeMutationType) {
            case ALERT_MUTATION_TYPE.CREATE:
                label = 'Creating an alert...';
                break;
            default:
            case ALERT_MUTATION_TYPE.EDIT:
                label = 'Updating...';
                break;
            case ALERT_MUTATION_TYPE.DELETE:
                label = 'Performing deletion...';
                break;
        }
        return (
            <Overlay className={`${CN}__translucent-overlay`}>
                <div className={cn(`${CN}__info-badge`, `${CN}__info-badge-red`)}>
                    <Spinner label={label} />
                </div>
            </Overlay>
        );
    }

    render() {
        const { alert, mutationType, alertFulfilled } = this.alertsMutationStore;
        const { performingMutation } = this.alertsStore;
        const title = mutationType === ALERT_MUTATION_TYPE.CREATE ? 'Create a new alert' : 'Edit alert';
        const editTitle = mutationType === ALERT_MUTATION_TYPE.CREATE ? 'Save new alert' : 'Update';

        return (
            <div className={CN}>
                <div className={`${CN}__action-bar`}>
                    <div className={`${CN}__action-bar-left`}>
                        <CommandBarButton
                            text={editTitle}
                            iconProps={{ iconName: 'Save' }}
                            className={`${CN}__action-bar-btn`}
                            onClick={this.onSave}
                            disabled={!alertFulfilled || performingMutation}
                        />
                        <CommandBarButton
                            text="Cancel"
                            iconProps={{ iconName: 'Cancel' }}
                            className={`${CN}__action-bar-btn`}
                            onClick={this.onCancel}
                            disabled={performingMutation}
                        />
                    </div>
                    {mutationType !== ALERT_MUTATION_TYPE.CREATE && (
                        <CommandBarButton
                            text="Delete alert"
                            iconProps={{ iconName: 'Delete' }}
                            className={cn(`${CN}__action-bar-btn`, `${CN}__action-bar-btn-delete`)}
                            onClick={this.onDelete}
                            disabled={performingMutation}
                        />
                    )}
                </div>
                <div className={`${CN}__form`}>
                    <div>
                        <Text variant="large" className={`${CN}__header-title`}>{title}</Text>

                        { alert && (
                            <AlertEditForm
                                alert={alert}
                                alertsMutationStore={this.alertsMutationStore}
                            />
                        )}
                        { performingMutation && this.renderProcessing() }
                    </div>
                </div>
            </div>
        );
    }
}
