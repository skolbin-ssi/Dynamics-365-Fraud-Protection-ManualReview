// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { MessageBar } from '@fluentui/react/lib/MessageBar';
import autobind from 'autobind-decorator';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import cn from 'classnames';

import { TYPES } from '../../../types';
import { AppStore } from '../../../view-services';
import {
    DEFAULT_SUCCESS_TOAST_TIMEOUT,
    NOTIFICATION_TYPE,
    QUEUE_MUTATION_TYPES,
    TOAST_TYPE,
} from '../../../constants';
import { Notification, Toast } from '../../../models';
import { GENERAL_TOAST_SETTINGS, TOASTS_FOR_ITEM_LABELS } from './toasts-details';
import './toast-notification.scss';

const CN = 'toast-notification';

@observer
export class ToastNotification extends Component<{}, never> {
    static composeSuccessMessageForQueueAction(mutation: QUEUE_MUTATION_TYPES, name: string) {
        return (
            <>
                The queue with the name &quot;
                <b>{name}</b>
                &quot; has been successfully
                {' '}
                {mutation}
                d.
            </>
        );
    }

    static composeErrorMessageForQueueAction(mutation: QUEUE_MUTATION_TYPES, name: string) {
        return (
            <>
                For technical reasons, we were unable to
                {' '}
                {mutation}
                {' '}
                the queue with the name &quot;
                <b>{name}</b>
                &quot;. Please, try again or write to IT.
            </>
        );
    }

    @resolve(TYPES.APP_STORE)
    private appStore!: AppStore;

    private toastTimer: number | null = null;

    private setToastTimeout(timeout?: number) {
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        this.toastTimer = window
            .setTimeout(() => this.dismissToast(), timeout || DEFAULT_SUCCESS_TOAST_TIMEOUT);
    }

    @autobind
    dismissToast() {
        this.appStore.dismissToast();
    }

    @autobind
    composeToast(notification: Notification): Toast {
        switch (notification.type) {
            case NOTIFICATION_TYPE.LABEL_ADDED_SUCCESS: {
                this.setToastTimeout();
                return TOASTS_FOR_ITEM_LABELS.get(notification.label)!;
            }
            case NOTIFICATION_TYPE.QUEUE_MUTATION_SUCCESS: {
                this.setToastTimeout();
                return {
                    ...GENERAL_TOAST_SETTINGS.get(TOAST_TYPE.SUCCESS)!,
                    message: ToastNotification
                        .composeSuccessMessageForQueueAction(notification.mutation, notification.queueName)
                };
            }

            case NOTIFICATION_TYPE.QUEUE_MUTATION_ERROR: {
                return {
                    ...GENERAL_TOAST_SETTINGS.get(TOAST_TYPE.ERROR)!,
                    message: ToastNotification
                        .composeErrorMessageForQueueAction(notification.mutation, notification.queueName)
                };
            }

            case NOTIFICATION_TYPE.GENERIC_ERROR: {
                return {
                    ...GENERAL_TOAST_SETTINGS.get(TOAST_TYPE.ERROR)!,
                    message: notification.message
                };
            }

            case NOTIFICATION_TYPE.CUSTOM:
            default: {
                this.setToastTimeout(notification.dismissTimeout);
                return notification.details;
            }
        }
    }

    render() {
        const { toastNotification } = this.appStore;
        if (!toastNotification) return null;

        const toast: Toast = this.composeToast(toastNotification);

        return toast && (
            <MessageBar
                className={cn(`${CN}`, `${CN}--${toast.type}`)}
                messageBarType={toast.messageBarType}
                messageBarIconProps={{
                    className: `${CN}-icon--${toast.type}`,
                    iconName: toast.iconName
                }}
                onDismiss={this.dismissToast}
            >
                <div className={cn(`${CN}-title`, `${CN}-title--${toast.type}`)}>
                    {toast.title}
                </div>
                <div className={`${CN}-content`}>
                    {toast.message}
                </div>
            </MessageBar>
        );
    }
}
