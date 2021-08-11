// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './queue-header.scss';

import autobind from 'autobind-decorator';
import cx from 'classnames';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import { CommandBarButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Facepile, IFacepilePersona, OverflowButtonType } from '@fluentui/react/lib/Facepile';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { PersonaSize } from '@fluentui/react/lib/Persona';
import { Text } from '@fluentui/react/lib/Text';
import { Toggle } from '@fluentui/react/lib/Toggle';

import {
    ROUTES,
    SIZES,
    SORTING_FIELD,
    SORTING_FIELD_DISPLAY,
    SORTING_ORDER
} from '../../../../constants';
import { ItemSortSettingsDTO } from '../../../../data-services/api-services/models/item-search-query-dto';
import { Queue } from '../../../../models';
import { TYPES } from '../../../../types';
import { formatToLocaleDateString } from '../../../../utils/date';
import { QueuesScreenStore } from '../../../../view-services';
import { WindowSizeStore } from '../../../../view-services/misc/window-size-store';

export const CN = 'queue-header';

export interface QueueHeaderProps {
    className?: string;
    queue: Queue | null;
    queueScreenStore: QueuesScreenStore;
    isQueueRefreshing: boolean;
    handleEditQueueClick: (queue: Queue) => void;
    handleAssignAnalystClick: (queue: Queue) => void;
    handleRefreshClick: (queue: Queue) => void;
    handleAutoRefreshToggleClick: (isEnabled: boolean) => void;
    isAutoRefreshEnabled: boolean;
    canEditQueue: boolean;
    canAssignAnalyst: boolean;
    queueLastUpdated: string | null;
    sorted: ItemSortSettingsDTO;
}

@observer
export class QueueHeader extends Component<QueueHeaderProps, never> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.WINDOW_SIZE_STORE)
    private windowSizeStore!: WindowSizeStore;

    componentDidMount(): void {
        const { queueScreenStore } = this.props;

        const isAutoRefreshEnabled = queueScreenStore.getAutoRefreshToggleValue;

        if (isAutoRefreshEnabled !== null) {
            queueScreenStore.toggleAutoRefresh(isAutoRefreshEnabled);
        }
    }

    @autobind
    onRefreshClick() {
        const { handleRefreshClick, queue } = this.props;
        if (queue) {
            handleRefreshClick(queue);
        }
    }

    @autobind
    onSettingsClick() {
        const { handleEditQueueClick, queue } = this.props;
        if (queue) {
            handleEditQueueClick(queue);
        }
    }

    @autobind
    onAssignClick() {
        const { handleAssignAnalystClick, queue } = this.props;
        if (queue) {
            handleAssignAnalystClick(queue);
        }
    }

    @autobind
    onToggleAutoRefresh() {
        const { handleAutoRefreshToggleClick, isAutoRefreshEnabled } = this.props;

        handleAutoRefreshToggleClick(!isAutoRefreshEnabled);
    }

    @autobind
    navigateToReviewConsole() {
        const { queue } = this.props;
        if (!queue) { return; }

        this.history.push({
            pathname: ROUTES.build.reviewConsole(queue.viewId)
        });
    }

    @autobind
    renderQueueReviewers() {
        const { queue } = this.props;
        const { windowSizes } = this.windowSizeStore;

        if (!queue) { return null; }

        const MAX_REVIEWERS_TO_SHOW = windowSizes.some(size => [SIZES.QH_CUSTOM].includes(size)) ? 1 : 4;
        return (
            <Facepile
                personaSize={PersonaSize.size32}
                personas={queue.assigneeFacepilePersonas.slice(0, MAX_REVIEWERS_TO_SHOW)}
                overflowPersonas={queue.assigneeFacepilePersonas.slice(MAX_REVIEWERS_TO_SHOW)}
                overflowButtonType={OverflowButtonType.descriptive}
                getPersonaProps={(persona: IFacepilePersona) => ({ hidePersonaDetails: true, title: persona.name })}
                overflowButtonProps={{
                    styles: { root: { cursor: 'default' } }
                }}
            />
        );
    }

    @autobind
    renderQueueDetails() {
        const {
            queue,
            queueLastUpdated,
            sorted
        } = this.props;

        if (!queue) {
            return null;
        }

        return (
            <div className={`${CN}__row`}>
                <Text variant="large" className={`${CN}__queue-name`}>{queue.name}</Text>
                <div className={`${CN}__queue-metadata`}>
                    <Text className={`${CN}__meta-title`}>Queue ID: </Text>
                    <div className={`${CN}__queue-id`}>
                        <Text>{ queue.shortId }</Text>
                        <FontIcon iconName="Info" title={queue?.viewId} className={`${CN}__queue-id-icon`} />
                    </div>
                    { queue.created && (
                        <>
                            <Text className={`${CN}__meta-title`}>Created: </Text>
                            <Text className={`${CN}__meta-value`}>{ formatToLocaleDateString(queue.created, 'N/A') }</Text>
                        </>
                    )}
                    { queueLastUpdated && (
                        <>
                            <Text className={`${CN}__meta-title`}>Updated: </Text>
                            <Text className={`${CN}__meta-value`}>{ queueLastUpdated }</Text>
                        </>
                    )}
                    <Text className={`${CN}__meta-title`}>Sorted: </Text>
                    <Text className={`${CN}__meta-value ${CN}__meta-value--bold`}>
                        {SORTING_FIELD_DISPLAY[sorted?.field as keyof typeof SORTING_FIELD]}
                        <FontIcon
                            className={`${CN}__sort-order-icon`}
                            iconName={sorted?.order === SORTING_ORDER.ASC ? 'SortUp' : 'SortDown'}
                        />
                    </Text>
                </div>
            </div>
        );
    }

    render() {
        const {
            queue,
            className,
            isQueueRefreshing,
            canEditQueue,
            canAssignAnalyst,
            queueScreenStore,
        } = this.props;
        const { windowSizes } = this.windowSizeStore;
        const canAssignAnalystOnTheSize = canAssignAnalyst && !windowSizes.some(size => [SIZES.QH_CUSTOM].includes(size));

        return (
            <div className={cx(CN, className)}>
                <div className={`${CN}__row`}>
                    <div className={`${CN}__action_btns`}>
                        <PrimaryButton
                            text="Start review"
                            className={`${CN}__start-review-btn`}
                            onClick={this.navigateToReviewConsole}
                            disabled={!queueScreenStore.isReviewAllowed(queue?.viewId)}
                        />
                        { canEditQueue && (
                            <CommandBarButton
                                text="Settings"
                                iconProps={{ iconName: 'Settings' }}
                                className={`${CN}__action-btn`}
                                onClick={this.onSettingsClick}
                                disabled={!queue}
                            />
                        )}
                        { canAssignAnalystOnTheSize && (
                            <CommandBarButton
                                text="Assign analyst"
                                iconProps={{ iconName: 'AccountManagement' }}
                                className={`${CN}__action-btn`}
                                onClick={this.onAssignClick}
                                disabled={!queue}
                            />
                        )}
                        <CommandBarButton
                            text="Refresh list"
                            iconProps={{ iconName: 'Refresh' }}
                            className={`${CN}__action-btn`}
                            onClick={this.onRefreshClick}
                            disabled={!queue || isQueueRefreshing}
                        />
                        <Toggle
                            label="Auto-refresh (5 min)"
                            className={`${CN}__action-btn ${CN}__action-btn--auto-refresh`}
                            checked={queueScreenStore.isAutoRefreshEnabled}
                            inlineLabel
                            onChange={this.onToggleAutoRefresh}
                        />
                    </div>
                    <div>
                        { this.renderQueueReviewers() }
                    </div>
                </div>
                {this.renderQueueDetails()}
            </div>
        );
    }
}
