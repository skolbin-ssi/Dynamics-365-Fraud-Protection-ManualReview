import autobind from 'autobind-decorator';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
    CreateQueueModalTabs,
    ERROR_SCREEN_STATES,
    QUEUE_MUTATION_TYPES,
    QUEUE_VIEW_TYPE,
    ROUTES
} from '../../constants';
import { Queue } from '../../models';
import { TYPES } from '../../types';
import { AppStore, QueuesScreenStore } from '../../view-services';
import { QueueDetails } from './queue-details';
import { QueuesList } from './queues-list';
import './queues.scss';

const CN = 'queues-screen';

export interface QueuePageRouteParams {
    queueId?: string;
}

export type QueuesComponentProps = RouteComponentProps<QueuePageRouteParams>;

@observer
export class Queues extends Component<QueuesComponentProps, never> {
    @resolve(TYPES.QUEUES_SCREEN_STORE)
    private queuesScreenStore!: QueuesScreenStore;

    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.APP_STORE)
    private appStore!: AppStore;

    async componentDidMount() {
        const { queueStore } = this.queuesScreenStore;
        const { queues } = queueStore;
        const { match } = this.props;
        const { params } = match;
        const { queueId } = params;

        if (!queues) {
            await this.queuesScreenStore.queueStore.loadQueues();
            await this.queuesScreenStore.queueStore.loadQueues(QUEUE_VIEW_TYPE.ESCALATION);
        } else {
            await this.queuesScreenStore.refreshQueueAndLockedItems(queueId as string);
        }

        const selectedQueue = this.queuesScreenStore.markQueueAsSelectedByIdAndLoadItems(queueId as string);

        if (!selectedQueue) {
            this.history.push({
                pathname: ROUTES.build.error(ERROR_SCREEN_STATES.NOT_FOUND)
            });
        } else {
            this.queuesScreenStore.setActiveQueueList(selectedQueue.forEscalations);
        }
    }

    componentWillUnmount() {
        this.queuesScreenStore.queueStore.clearSelectedQueueData();
    }

    @autobind
    onChangeQueue(queue: Queue) {
        this.queuesScreenStore.markQueueAsSelectedAndLoadItems(queue);
        this.queuesScreenStore.refreshQueueAndLockedItems(queue.viewId);
        this.history.push({
            pathname: ROUTES.build.queues(queue.viewId)
        });
    }

    @autobind
    onRefreshQueueItems(queue: Queue) {
        this.queuesScreenStore.refreshQueueAndLockedItems(queue.viewId);
        this.queuesScreenStore.loadQueueItems(queue.viewId);
    }

    @autobind
    onLoadMoreRows(queue: Queue) {
        this.queuesScreenStore.loadQueueItems(queue.viewId, true);
    }

    @autobind
    onQueueTypeChange(escalated: boolean) {
        const { queueStore } = this.queuesScreenStore;
        const { queues, escalatedQueues } = queueStore;
        const shouldLoad = escalated ? !escalatedQueues : !queues;
        this.queuesScreenStore.setActiveQueueList(escalated);
        if (shouldLoad) {
            this.queuesScreenStore.queueStore.loadQueues(QUEUE_VIEW_TYPE.ESCALATION);
        }
    }

    @autobind
    onToggleAutoRefresh(isEnabled: boolean) {
        this.queuesScreenStore.toggleAutoRefresh(isEnabled);
    }

    @autobind
    openEditQueueModal(tab: CreateQueueModalTabs) {
        this.appStore.toggleOpenedModalType(QUEUE_MUTATION_TYPES.UPDATE, tab);
    }

    @autobind
    openCreateQueueModal(tab: CreateQueueModalTabs) {
        this.appStore.toggleOpenedModalType(QUEUE_MUTATION_TYPES.CREATE, tab);
    }

    render() {
        const { queueStore } = this.queuesScreenStore;

        return (
            <div className={CN}>
                <QueuesList
                    queuesScreenStore={this.queuesScreenStore}
                    className={`${CN}__queues-list`}
                    onChangeQueue={this.onChangeQueue}
                    onCreateQueueClick={() => this.openCreateQueueModal('general')}
                    onQueueTypeChange={this.onQueueTypeChange}
                />
                <QueueDetails
                    className={`${CN}__queue-details`}
                    queueStore={queueStore}
                    queueScreenStore={this.queuesScreenStore}
                    handleEditQueueClick={() => this.openEditQueueModal('general')}
                    handleAssignAnalystClick={() => this.openEditQueueModal('assign')}
                    handleRefreshListClick={this.onRefreshQueueItems}
                    handleLoadMoreRowsClick={this.onLoadMoreRows}
                    handleAutoRefreshToggleClick={this.onToggleAutoRefresh}
                />
            </div>
        );
    }
}
