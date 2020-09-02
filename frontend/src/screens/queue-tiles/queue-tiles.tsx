import { DefaultButton } from '@fluentui/react/lib/Button';
import { Facepile, IFacepilePersona, OverflowButtonType } from '@fluentui/react/lib/Facepile';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { PersonaSize } from '@fluentui/react/lib/Persona';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';
import autobind from 'autobind-decorator';
import cn from 'classnames';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import {
    QUEUE_LIST_TYPE,
    QUEUE_MANAGEMENT,
    QUEUE_MUTATION_TYPES,
    QUEUE_VIEW_TYPE,
    ROUTES
} from '../../constants';
import { Queue } from '../../models';

import { TYPES } from '../../types';
import { AppStore, CurrentUserStore, QueuesScreenStore } from '../../view-services';

import './queue-tiles.scss';

const CN = 'queue-tiles';

export interface QueueTilesComponentProps {}

@observer
export class QueueTiles extends Component<QueueTilesComponentProps, never> {
    @resolve(TYPES.QUEUES_SCREEN_STORE)
    private queuesScreenStore!: QueuesScreenStore;

    @resolve(TYPES.CURRENT_USER_STORE)
    private user!: CurrentUserStore;

    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.APP_STORE)
    private appStore!: AppStore;

    componentDidMount() {
        this.queuesScreenStore.queueStore.loadQueues();
        this.queuesScreenStore.queueStore.loadQueues(QUEUE_VIEW_TYPE.ESCALATION);
    }

    @autobind
    onCreateQueueClick() {
        this.appStore.toggleOpenedModalType(QUEUE_MUTATION_TYPES.CREATE);
    }

    @autobind
    onEditQueueClick(queue: Queue, canUserEditQueue: boolean, e: React.MouseEvent<any>) {
        e.stopPropagation();
        if (canUserEditQueue) {
            this.queuesScreenStore.markQueueAsSelectedAndLoadItems(queue, false);
            this.appStore.toggleOpenedModalType(QUEUE_MUTATION_TYPES.UPDATE);
        }
    }

    @autobind
    selectQueue(queue: Queue) {
        this.queuesScreenStore.markQueueAsSelectedAndLoadItems(queue);
        this.history.push({
            pathname: ROUTES.build.queues(queue.viewId)
        });
    }

    @autobind
    handleQueueTypeChange(item?: PivotItem) {
        if (item) {
            const { itemKey } = item.props;
            this.queuesScreenStore.setActiveTilesQueueList(itemKey as QUEUE_LIST_TYPE);
        }
    }

    @autobind
    reviewQueue(queue: Queue, isReviewAllowed: boolean, e: React.MouseEvent<any>) {
        e.stopPropagation();
        if (isReviewAllowed) {
            const { size, viewId } = queue;
            if (size) {
                this.history.push({
                    pathname: ROUTES.build.reviewConsole(viewId)
                });
            }
        }
    }

    @autobind
    renderTypeSelector() {
        const { activeTilesQueueList } = this.queuesScreenStore;

        return (
            <Pivot
                className={`${CN}__type-selector`}
                aria-label="Queues to select"
                headersOnly
                selectedKey={activeTilesQueueList}
                onLinkClick={this.handleQueueTypeChange}
            >
                <PivotItem headerText="All queues" itemKey={QUEUE_LIST_TYPE.ALL} />
                <PivotItem headerText="Supervised" itemKey={QUEUE_LIST_TYPE.SUPERVISED} />
                <PivotItem headerText="Assigned" itemKey={QUEUE_LIST_TYPE.ASSIGNED} />
            </Pivot>
        );
    }

    @autobind
    renderFaces(persons: IFacepilePersona[], maxToShow: number, supervisors: boolean = false) {
        return (
            <Facepile
                className={cn(`${CN}__faces`, supervisors && `${CN}__faces--supervisors`)}
                personaSize={PersonaSize.size24}
                personas={persons.slice(0, maxToShow)}
                overflowPersonas={persons.slice(maxToShow)}
                overflowButtonType={OverflowButtonType.descriptive}
                getPersonaProps={() => ({ hidePersonaDetails: true })}
                overflowButtonProps={{
                    styles: { root: { cursor: 'default' } }
                }}
            />
        );
    }

    @autobind
    renderTile(queue: Queue) {
        const {
            name,
            created,
            size
        } = queue;
        const MAX_SUPERVISORS_TO_SHOW = 2;
        const MAX_REVIEWERS_TO_SHOW = 5;

        const isReviewAllowed = this.queuesScreenStore.isReviewAllowed(queue?.viewId);
        const { canUserEditQueue } = this.queuesScreenStore;
        const showDivider = !!queue.supervisorsFacepilePersonas.length && !!queue.reviewersFacepilePersonas.length;

        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
                className={`${CN}__tile`}
                key={`queue-${queue.viewId}`}
                role="button"
                tabIndex={-1}
                onClick={() => this.selectQueue(queue)}
            >
                <div className={`${CN}__data`}>
                    <div className={`${CN}__data-top`}>
                        <Text variant="large" className={`${CN}__queue-title`}>{ name }</Text>
                        <div className={`${CN}__meta`}>
                            <Text variant="smallPlus">Created:&nbsp;</Text>
                            <Text variant="smallPlus">{ new Date(created).toLocaleDateString() }</Text>
                        </div>
                        <div className={`${CN}__meta`}>
                            <Text variant="smallPlus">Orders:&nbsp;</Text>
                            <Text variant="smallPlus">{ size }</Text>
                        </div>
                    </div>
                    <div className={`${CN}__faces-wrapper`}>
                        {this.renderFaces(queue.supervisorsFacepilePersonas, MAX_SUPERVISORS_TO_SHOW, true)}
                        { showDivider && (<div className={`${CN}__faces-wrapper-divider`} />) }
                        {this.renderFaces(queue.reviewersFacepilePersonas, MAX_REVIEWERS_TO_SHOW)}
                    </div>
                    <div className={`${CN}__controls`}>
                        <button
                            type="button"
                            className={cn(`${CN}__start-review-btn`, { disabled: !isReviewAllowed })}
                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.reviewQueue(queue, isReviewAllowed, e)}
                        >
                            <div className={`${CN}__start-review-icon`}>
                                <FontIcon iconName="Play" />
                            </div>
                            <Text>Start review</Text>
                        </button>
                        <button
                            type="button"
                            className={cn(`${CN}__setting-btn`, { disabled: !canUserEditQueue })}
                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.onEditQueueClick(queue, canUserEditQueue, e)}
                        >
                            <div className={`${CN}__setting-icon`}>
                                <FontIcon iconName="Settings" />
                            </div>
                            <Text>Settings</Text>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    renderTiles() {
        const {
            queueStore,
            activeTilesQueueList,
            queuesSupervisedByCurrentUser,
            allQueuesAssignedToCurrentUser
        } = this.queuesScreenStore;
        const {
            queues,
            loadingQueues
        } = queueStore;

        if (queues && activeTilesQueueList === QUEUE_LIST_TYPE.ALL) {
            return queues.map(this.renderTile);
        }

        if (queuesSupervisedByCurrentUser && activeTilesQueueList === QUEUE_LIST_TYPE.SUPERVISED) {
            return queuesSupervisedByCurrentUser.map(this.renderTile);
        }

        if (allQueuesAssignedToCurrentUser && activeTilesQueueList === QUEUE_LIST_TYPE.ASSIGNED) {
            return allQueuesAssignedToCurrentUser.map(this.renderTile);
        }

        if (loadingQueues) {
            return (
                <div className={`${CN}__center-aligned`}>
                    <Spinner label="Loading queues..." />
                </div>
            );
        }

        if (
            !queues?.length
            || !queuesSupervisedByCurrentUser.length
            || !queuesSupervisedByCurrentUser.length
        ) {
            return (
                <div className={`${CN}__center-aligned`}>
                    <Text>No queues found</Text>
                </div>
            );
        }

        return null;
    }

    render() {
        return (
            <div className={CN}>
                <div className={`${CN}__queue-tiles-header`}>
                    <Text className={`${CN}__queues-title`} variant="xxLarge">Queues</Text>
                    {this.renderTypeSelector()}
                    { this.user.checkUserCan(QUEUE_MANAGEMENT.CREATE) && (
                        <DefaultButton
                            iconProps={{ iconName: 'BuildQueueNew', className: `${CN}__add-new-item-btn-icon` }}
                            className={`${CN}__add-new-item-btn`}
                            onClick={this.onCreateQueueClick}
                        >
                            Create Queue
                        </DefaultButton>
                    )}
                </div>
                <div className={`${CN}__queues`}>
                    {this.renderTiles()}
                </div>
            </div>
        );
    }
}
