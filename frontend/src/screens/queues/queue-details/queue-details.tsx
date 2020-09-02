import { observer } from 'mobx-react';
import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { History } from 'history';
import { resolve } from 'inversify-react';
import cn from 'classnames';
import {
    ColumnActionsMode,
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    SelectionMode
} from '@fluentui/react/lib/DetailsList';
import { Facepile } from '@fluentui/react/lib/Facepile';
import { PersonaSize } from '@fluentui/react/lib/Persona';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';
import { Item, ITEM_STATUS, Queue } from '../../../models';
import { CurrentUserStore, QueuesScreenStore } from '../../../view-services';
import { QueueStore } from '../../../view-services/queues';
import { QueueHeader } from './queue-header';
import { ErrorContent } from '../../../components/error-content';
import { QueueItemNote } from './queue-item-notes/queue-item-notes';
import { TYPES } from '../../../types';
import { ROUTES } from '../../../constants';
import NoOrdersIllustrationSvg from '../../../assets/no-orders-illustration.svg';
import RiskClockIcon from '../../../assets/icon/risk-clock.svg';
import NormalClockIcon from '../../../assets/icon/normal-clock.svg';

import './queue-details.scss';
import { QueueItemTags } from './queue-item-tags/queue-item-tags';

export interface QueueDetailsProps {
    className: string;
    queueStore: QueueStore;
    queueScreenStore: QueuesScreenStore;
    handleEditQueueClick: (queue: Queue) => void;
    handleAssignAnalystClick: (queue: Queue) => void;
    handleRefreshListClick: (queue: Queue) => void;
    handleLoadMoreRowsClick: (queue: Queue) => void;
    handleAutoRefreshToggleClick: (isEnabled: boolean) => void;
}

const CN = 'queue-details';
const HIGH_RISK_DAYS_COUNT = 2;

@observer
export class QueueDetails extends Component<QueueDetailsProps, never> {
    @resolve(TYPES.CURRENT_USER_STORE)
    private user!: CurrentUserStore;

    private readonly columns: IColumn[] = [
        {
            key: 'score',
            name: 'Fraud score',
            minWidth: 50,
            maxWidth: 120,
            className: `${CN}__vertically-aligned-cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: Item) => (
                <Text variant="medium" className={`${CN}__score-cell`}>
                    {item.decision?.riskScore}
                </Text>
            ),
        },
        {
            key: 'id',
            name: 'Order Id',
            fieldName: 'id',
            minWidth: 70,
            isCollapsible: true,
            isRowHeader: true,
            isPadded: true,
            className: `${CN}__vertically-aligned-cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: Item) => (
                <Text variant="smallPlus" className={`${CN}__order-id-cell`}>
                    {item.id}
                </Text>
            )
        },
        {
            key: 'amount',
            name: 'Amount',
            minWidth: 60,
            maxWidth: 60,
            isPadded: true,
            className: `${CN}__vertically-aligned-cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: Item) => (
                <Text variant="smallPlus">
                    { item.amount }
                </Text>
            )
        },
        {
            key: 'import-date',
            name: 'Import date',
            fieldName: 'importDateTime',
            minWidth: 80,
            maxWidth: 80,
            isPadded: true,
            className: `${CN}__vertically-aligned-cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: Item) => (
                <Text variant="smallPlus">
                    {item.displayImportDateTime}
                </Text>
            )
        },
        {
            key: 'time-left',
            name: 'Time left',
            fieldName: 'timeLeft',
            minWidth: 80,
            maxWidth: 80,
            isPadded: true,
            className: `${CN}__vertically-aligned-cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: Item) => {
                const timeLeft = this.getDaysLeft(item);
                return timeLeft !== null ? this.getDisplayTimeLeft(timeLeft) : '';
            }
        },
        {
            key: 'status',
            name: 'Status',
            minWidth: 60,
            maxWidth: 80,
            data: 'string',
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: Item) => (
                <Text
                    style={{ width: 'auto' }}
                    variant="smallPlus"
                    className={cn({ [`${CN}__grayed-out-value`]: item.status === ITEM_STATUS.AWAITING })}
                >
                    {item.status}
                </Text>
            )
        },
        {
            key: 'analyst',
            name: 'Analyst',
            minWidth: 60,
            maxWidth: 60,
            data: 'string',
            className: `${CN}__fully-aligned-cell`,
            headerClassName: `${CN}__fully-aligned-cell-header`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: Item) => {
                if (!item.reviewUser && !item.holdUser) { return null; }

                return (
                    <Facepile
                        personaSize={PersonaSize.size24}
                        personas={item.reviewUserAsPersons}
                        getPersonaProps={() => ({ hidePersonaDetails: true })}
                    />
                );
            }
        },
        {
            key: 'tags',
            name: '',
            minWidth: 30,
            maxWidth: 30,
            isResizable: false,
            className: `${CN}__fully-aligned-cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: Item) => (
                <QueueItemTags
                    className={cn(`${CN}__queue-item-tags`, `${CN}__value-with-opacity`, { translucent: !item.hasTags })}
                    tags={item.tags}
                    itemId={item.id}
                    tagsString={item.tagsJoined}
                />
            )
        },
        {
            key: 'note',
            name: '',
            minWidth: 30,
            maxWidth: 30,
            isResizable: false,
            className: `${CN}__fully-aligned-cell`,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: Item) => (
                <QueueItemNote
                    className={cn(`${CN}__queue-item-notes`, `${CN}__value-with-opacity`, { translucent: !item.hasNotes })}
                    notes={item.notes}
                    itemId={item.id}
                />
            )
        }
    ];

    @resolve(TYPES.HISTORY)
    private history!: History;

    @autobind
    setItemToItemStore(selectedItem: Item) {
        const { queueStore: { selectedQueueId } } = this.props;
        const { lockedById } = selectedItem;
        const { user } = this.user;
        const isLockedByCurrent = lockedById === user?.id;

        if (selectedQueueId) {
            const pathname = isLockedByCurrent
                ? ROUTES.build.itemDetailsReviewConsole(selectedQueueId, selectedItem.id)
                : ROUTES.build.itemDetails(selectedQueueId, selectedItem.id);
            this.history.push({ pathname });
        }
    }

    getDaysLeft(item: Item) {
        const { queueStore } = this.props;
        let daysLeft;

        if (item.importDate) {
            daysLeft = queueStore.getTimeLeft(item.importDate);
            return daysLeft;
        }

        return null;
    }

    getDisplayTimeLeft(timeLeft: number) {
        const dayOrDaysText = timeLeft === 1 ? 'day' : 'days';

        const svgIcon = (timeLeft !== null) && (timeLeft <= HIGH_RISK_DAYS_COUNT)
            ? (<RiskClockIcon />)
            : (<NormalClockIcon />);

        return (
            <div className={`${CN}__time-left`}>
                {svgIcon}
                {
                    (timeLeft < 0) ? (
                        <span className={`${CN}__time-left-text--overdue-text`}>
                            <abbr title={`${Math.abs(timeLeft)}`}>overdue</abbr>
                        </span>
                    ) : (
                        <Text variant="smallPlus" className={`${CN}__time-left-text`}>
                            {timeLeft}
                            {' '}
                            {dayOrDaysText}
                        </Text>
                    )
                }
            </div>
        );
    }

    getColumnList() {
        const TIME_LEFT_COLUMN_KEY = 'time-left';

        if (this.hasToRenderTimeLeftColumn()) {
            return this.columns;
        }

        return this.columns
            .filter(column => column.key !== TIME_LEFT_COLUMN_KEY);
    }

    hasToRenderTimeLeftColumn() {
        const { queueStore } = this.props;

        if (queueStore.selectedQueue) {
            return !!queueStore.selectedQueue.processingDeadline;
        }

        return false;
    }

    renderNoSelectedQueue(): JSX.Element {
        return (
            <div className={`${CN}__center-aligned`}>
                <Text>Please select a queue</Text>
            </div>
        );
    }

    renderIsLoading(): JSX.Element {
        return (
            <div className={`${CN}__center-aligned`}>
                <Spinner label="Loading orders..." />
            </div>
        );
    }

    renderNoItems(): JSX.Element {
        return (
            <div className={`${CN}__center-aligned`}>
                <ErrorContent
                    illustrationSvg={NoOrdersIllustrationSvg}
                    message="No orders in the Queue. Please wait for a while"
                />
            </div>
        );
    }

    renderTable(queueItems: Item[]): JSX.Element {
        return (
            <div>
                <DetailsList
                    onActiveItemChanged={this.setItemToItemStore}
                    items={queueItems}
                    columns={this.getColumnList()}
                    layoutMode={DetailsListLayoutMode.justified}
                    selectionMode={SelectionMode.none}
                    isHeaderVisible
                    className={cn(CN, `${CN}--with-row-cursor-pointer`)}
                    cellStyleProps={{
                        cellExtraRightPadding: 5,
                        cellLeftPadding: 10,
                        cellRightPadding: 10
                    }}
                />
                { this.renderLoadMoreBtn() }
            </div>
        );
    }

    renderLoadMoreBtn() {
        const {
            queueStore,
            handleLoadMoreRowsClick
        } = this.props;
        const { selectedQueue, loadingMoreItems, selectedQueueCanLoadMore } = queueStore;

        if (!selectedQueue || !selectedQueueCanLoadMore) {
            return null;
        }

        return (
            <button
                type="button"
                className={`${CN}__load_more_orders`}
                onClick={() => handleLoadMoreRowsClick(selectedQueue)}
                disabled={loadingMoreItems}
            >
                {
                    loadingMoreItems
                        ? <Spinner />
                        : <Text variant="medium">Load more orders</Text>
                }
            </button>
        );
    }

    renderTableInterface(
        queue: Queue,
        queueItems: Item[]
    ): JSX.Element {
        return queueItems.length ? this.renderTable(queueItems) : this.renderNoItems();
    }

    render() {
        const {
            queueStore,
            queueScreenStore,
            className,
            handleEditQueueClick,
            handleAssignAnalystClick,
            handleRefreshListClick,
            handleAutoRefreshToggleClick
        } = this.props;
        const {
            selectedQueue,
            selectedQueueId,
            selectedQueueItems,
            loadingQueueDetails,
            refreshingQueueIds
        } = queueStore;
        const {
            isAutoRefreshEnabled,
            selectedQueueUpdated,
            canUserEditQueue,
            canUserAssignAnalyst
        } = queueScreenStore;

        let toRender: JSX.Element;

        if (selectedQueueId && !selectedQueue) {
            toRender = this.renderNoSelectedQueue();
        } else if (loadingQueueDetails || !selectedQueueId) {
            toRender = this.renderIsLoading();
        } else if (selectedQueue) {
            toRender = this.renderTableInterface(selectedQueue, selectedQueueItems);
        } else {
            toRender = <></>;
        }

        const isQueueRefreshing = selectedQueue ? refreshingQueueIds.includes(selectedQueue?.viewId) : false;

        return (
            <div className={className}>
                <div className={`${CN}__common-wrapper`}>
                    <QueueHeader
                        queue={selectedQueue}
                        queueScreenStore={queueScreenStore}
                        handleEditQueueClick={handleEditQueueClick}
                        handleAssignAnalystClick={handleAssignAnalystClick}
                        handleRefreshClick={handleRefreshListClick}
                        handleAutoRefreshToggleClick={handleAutoRefreshToggleClick}
                        isQueueRefreshing={isQueueRefreshing}
                        isAutoRefreshEnabled={isAutoRefreshEnabled}
                        canEditQueue={canUserEditQueue}
                        canAssignAnalyst={canUserAssignAnalyst}
                        queueLastUpdated={selectedQueueUpdated}
                    />
                    { toRender }
                </div>
            </div>
        );
    }
}
