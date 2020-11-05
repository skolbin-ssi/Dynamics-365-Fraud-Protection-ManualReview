// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ActionButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';
import autoBind from 'autobind-decorator';
import cn from 'classnames';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { QUEUE_LIST_TYPE, QUEUE_MANAGEMENT } from '../../../constants';
import { Queue } from '../../../models';
import { TYPES } from '../../../types';
import { CurrentUserStore, QueuesScreenStore } from '../../../view-services';
import { ExpandableGroup } from './expandable-group';
import { QueuesItem } from './queue-item';
import './queues-list.scss';

export const CN = 'queues-list';

export interface QueuesListProps {
    className: string;
    onChangeQueue: (queue: Queue) => void;
    onCreateQueueClick: () => void;
    onQueueTypeChange: (escalated: boolean) => void;
    queuesScreenStore: QueuesScreenStore
}

@observer
export class QueuesList extends Component<QueuesListProps, never> {
    @resolve(TYPES.CURRENT_USER_STORE)
    private user!: CurrentUserStore;

    @autoBind
    onChangeQueue(queue: Queue) {
        const { onChangeQueue } = this.props;
        onChangeQueue(queue);
    }

    @autoBind
    handleQueueTypeChange(item?: PivotItem) {
        const { onQueueTypeChange } = this.props;
        if (item) {
            const { itemKey } = item.props;
            const escalated = itemKey === 'escalated';
            onQueueTypeChange(escalated);
        }
    }

    mapSingleQueue(queue: Queue, selectedQueue: Queue | null, refreshingQueueIds: string[]) {
        return (
            <QueuesItem
                key={queue.viewId}
                queue={queue}
                onClick={this.onChangeQueue}
                isSelected={!!selectedQueue && queue.viewId === selectedQueue.viewId}
                isQueueRefreshing={refreshingQueueIds.includes(queue.viewId)}
            />
        );
    }

    @autoBind
    renderQueueList(list: Queue[]) {
        const { queuesScreenStore } = this.props;
        const { queueStore } = queuesScreenStore;
        const { selectedQueue, refreshingQueueIds } = queueStore;

        return list.map(q => this.mapSingleQueue(q, selectedQueue, refreshingQueueIds));
    }

    @autoBind
    renderQueues(args: {
        escalated: boolean
    }) {
        const { escalated } = args;
        const { queuesScreenStore } = this.props;
        const {
            queueStore,
            queuesSupervisedByCurrentUser,
            queuesAssignedToCurrentUser,
            queuesUserIsNotAssignedNorSupervise,
            escalatedQueuesSupervisedByCurrentUser,
            escalatedQueuesUserIsNotSupervise
        } = queuesScreenStore;
        const {
            queues,
            escalatedQueues,
            loadingQueues
        } = queueStore;

        if (loadingQueues) {
            return (
                <div className={`${CN}__center-aligned`}>
                    <Spinner label="Loading queues..." />
                </div>
            );
        }

        if ((!escalated && !queues) || (escalated && !escalatedQueues)) {
            return (
                <div className={`${CN}__center-aligned`}>
                    <Text>No queues found</Text>
                </div>
            );
        }

        if (!escalated) {
            return (
                <>
                    { !!queuesSupervisedByCurrentUser.length && (
                        <ExpandableGroup title="Supervised queues" defaultExpanded>
                            {this.renderQueueList(queuesSupervisedByCurrentUser)}
                        </ExpandableGroup>
                    )}
                    { !!queuesAssignedToCurrentUser.length && (
                        <ExpandableGroup title="Assigned queues" defaultExpanded>
                            {this.renderQueueList(queuesAssignedToCurrentUser)}
                        </ExpandableGroup>
                    )}
                    { !!queuesUserIsNotAssignedNorSupervise.length && (
                        <ExpandableGroup title="Other queues">
                            {this.renderQueueList(queuesUserIsNotAssignedNorSupervise)}
                        </ExpandableGroup>
                    )}
                </>
            );
        }

        return (
            <>
                { !!escalatedQueuesSupervisedByCurrentUser.length && (
                    <ExpandableGroup title="Supervised queues" defaultExpanded>
                        {this.renderQueueList(escalatedQueuesSupervisedByCurrentUser)}
                    </ExpandableGroup>
                )}
                { !!escalatedQueuesUserIsNotSupervise.length && (
                    <ExpandableGroup title="Other queues">
                        {this.renderQueueList(escalatedQueuesUserIsNotSupervise)}
                    </ExpandableGroup>
                )}
            </>
        );
    }

    render() {
        const { queuesScreenStore, className, onCreateQueueClick } = this.props;
        const { activeQueueList, queueStore } = queuesScreenStore;
        const { escalatedQueues } = queueStore;
        const hasEscalatedQueues = escalatedQueues && escalatedQueues.length;
        const showEscalatedQueues = this.user.checkUserCan(QUEUE_MANAGEMENT.VIEW_ESCALATION_QUEUE) || hasEscalatedQueues;

        return (
            <div className={cn(CN, className)}>
                { this.user.checkUserCan(QUEUE_MANAGEMENT.CREATE) && (
                    <DefaultButton
                        className={`${CN}__top-add-button`}
                        iconProps={{ iconName: 'BuildQueueNew' }}
                        onClick={onCreateQueueClick}
                    />
                )}
                <Pivot
                    className={`${CN}__pivot`}
                    onLinkClick={this.handleQueueTypeChange}
                    selectedKey={activeQueueList}
                >
                    <PivotItem
                        headerText="Regular"
                        itemKey={QUEUE_LIST_TYPE.REGULAR}
                        headerButtonProps={{
                            'data-order': 1,
                            'data-title': 'Queues',
                        }}
                        className={`${CN}__pivot-item`}
                    >
                        <div className={`${CN}__queues`}>
                            {this.renderQueues({ escalated: false })}
                        </div>
                    </PivotItem>
                    { showEscalatedQueues && (
                        <PivotItem
                            headerText="Escalated"
                            itemKey={QUEUE_LIST_TYPE.ESCALATED}
                            headerButtonProps={{
                                'data-order': 2,
                                'data-title': 'Escalated Queues',
                            }}
                            className={`${CN}__pivot-item`}
                        >
                            <div className={`${CN}__queues`}>
                                {this.renderQueues({ escalated: true })}
                            </div>
                        </PivotItem>
                    )}
                </Pivot>
                { this.user.checkUserCan(QUEUE_MANAGEMENT.CREATE) && (
                    <div>
                        <ActionButton
                            iconProps={{ iconName: 'BuildQueueNew', className: `${CN}__add-new-item-btn-icon` }}
                            className={`${CN}__add-new-item-btn`}
                            onClick={onCreateQueueClick}
                        >
                            Create a new queue
                        </ActionButton>
                    </div>
                )}
            </div>
        );
    }
}
