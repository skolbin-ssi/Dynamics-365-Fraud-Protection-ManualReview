// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Spinner } from '@fluentui/react/lib/Spinner';

import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import autoBind from 'autobind-decorator';
import cx from 'classnames';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import AllDoneIllustration from '../../assets/all-done-llustration.svg';

import OrderLockedIllustrationSvg from '../../assets/order-locked.svg';
import { LABEL, ROUTES } from '../../constants';
import { ApiServiceError } from '../../data-services/base-api-service';
import { MrUserError } from '../../models/exceptions';
import { Item } from '../../models';
import { TYPES } from '../../types';
import { CurrentUserStore, ITEM_DETAILS_MODE, LockedItemsStore } from '../../view-services';
import { ReviewConsoleScreenStore } from '../../view-services/review-console';
import {
    ITEM_REVIEW_PROHIBITION_REASONS,
    QUEUE_REVIEW_PROHIBITION_REASONS,
    ReviewPermissionStore
} from '../../view-services/review-permission-store';

import { ConsoleHeader } from './console-header';
import { ItemDetails } from './item-details';
import { ReviewModal } from './modal';
import { ReviewActionsPanel } from './review-actions-panel';

import './review-console.scss';
import { StartReviewPanel } from './start-review-panel';

export const CN = 'review-console';

export interface ReviewConsoleRouteParams {
    queueId?: string;
    itemId?: string;
    searchId?: string;
}

interface ReviewConsoleState {
    isModalOpen: boolean;
}

export type ReviewConsoleProps = RouteComponentProps<ReviewConsoleRouteParams>;

@observer
export class ReviewConsole extends Component<ReviewConsoleProps, ReviewConsoleState> {
    @resolve(TYPES.REVIEW_CONSOLE_SCREEN_STORE)
    private reviewConsoleScreenStore!: ReviewConsoleScreenStore;

    @resolve(TYPES.CURRENT_USER_STORE)
    private userStore!: CurrentUserStore;

    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.REVIEW_PERMISSION_STORE)
    private reviewPermissionStore!: ReviewPermissionStore;

    @resolve(TYPES.LOCKED_ITEMS_STORE)
    private lockedItemsStore!: LockedItemsStore;

    constructor(props: ReviewConsoleProps) {
        super(props);

        this.state = {
            isModalOpen: false
        };
    }

    static getItemIdFromSearchString(search: string) {
        const values = new URLSearchParams(search);
        return values.get('itemId');
    }

    async componentDidMount() {
        const { match } = this.props;
        const { params, path } = match;
        const { queueId, itemId, searchId } = params;

        if (itemId && queueId) {
            this.reviewConsoleScreenStore.getItem(itemId, queueId);
        }

        if (queueId && path === ROUTES.REVIEW_CONSOLE) {
            await this.reviewConsoleScreenStore
                .getReviewItem(queueId);

            this.replaceHistory(queueId);
        }

        if (queueId) {
            this.reviewConsoleScreenStore.getQueueData(queueId);
        }

        if (searchId) {
            this.reviewConsoleScreenStore.setSearchId(searchId);
        }

        if (itemId && path === ROUTES.SEARCH_INACTIVE_ITEM_DETAILS) {
            await this.reviewConsoleScreenStore.getItem(itemId);
            await this.reviewConsoleScreenStore.getQueueData(this.reviewConsoleScreenStore.reviewItem?.label?.queueId);
        }

        if (!this.lockedItemsStore.lockedItems) {
            this.lockedItemsStore.getLockedItems();
        }
    }

    isItemHeldByCurrentUser(reviewItem: Item | null): boolean {
        return reviewItem?.hold?.ownerId === this.userStore?.user?.id;
    }

    @autoBind
    handleGoToQueuesClick() {
        // if there are no more items in a queue we should proceed to the page with tiles - not the one with queue data
        this.goBackToQueueList();
    }

    @autoBind
    handleBackButtonClick() {
        const { queue, searchId } = this.reviewConsoleScreenStore;

        this.reviewConsoleScreenStore.clearQueueData();
        this.reviewConsoleScreenStore.setSearchId('');

        if (searchId) {
            this.goBackToSearch(searchId);
        } else {
            this.goBackToQueueList(queue?.viewId);
        }
    }

    goBackToQueueList(queueId: string = '') {
        this.history.push({
            pathname: ROUTES.build.queues(queueId)
        });
    }

    goBackToSearch(searchId: string = '') {
        this.history.push({
            pathname: ROUTES.build.search(searchId)
        });
    }

    replaceHistory(queueId: string) {
        const { reviewItem } = this.reviewConsoleScreenStore;

        if (reviewItem) {
            this.reviewConsoleScreenStore.clearSearchId();
            this.history.replace(
                `${ROUTES.build.reviewConsole(queueId)}?itemId=${reviewItem.id}`
            );
        }
    }

    @autoBind
    async handleFinishReviewProcess() {
        const { match: { params: { itemId, queueId } }, location: { search } } = this.props;
        const reviewItemId = itemId || ReviewConsole.getItemIdFromSearchString(search);

        if (reviewItemId && queueId) {
            try {
                await this.reviewConsoleScreenStore.finishReviewProcess(reviewItemId);
            } finally {
                this.goBackToQueueList(queueId);
            }
        }
    }

    @autoBind
    handleCloseModal() {
        this.setState({
            isModalOpen: false
        });
    }

    @autoBind
    startReviewProcess() {
        const { match: { params: { itemId, queueId } } } = this.props;
        const { queue, reviewItem } = this.reviewConsoleScreenStore;

        if (reviewItem?.lockedById && !queue?.sortingLocked) {
            this.setState({
                isModalOpen: true
            });

            return;
        }

        if (queue && reviewItem) {
            // The user should NOT start reviewing the selected item, but the top one instead,
            // if the queue is locked and the selected item isn't held be the current user.
            const shouldTopItemBeSelectedForReview = queue.sortingLocked && !this.isItemHeldByCurrentUser(reviewItem);

            this.reviewConsoleScreenStore.startReview(
                queue,
                shouldTopItemBeSelectedForReview ? null : reviewItem
            );
        }

        if (queueId && itemId) {
            this.reviewConsoleScreenStore.clearSearchId();
            this.history.push(ROUTES.build.itemDetailsReviewConsole(queueId, itemId));
        }
    }

    @autoBind
    async navToReviewConsole() {
        const { queue } = this.reviewConsoleScreenStore;

        if (queue) {
            await this.reviewConsoleScreenStore.getReviewItem(queue.viewId);
            this.replaceHistory(queue.viewId);
        }
    }

    @autoBind
    async processNextItem() {
        const { match: { params: { queueId } } } = this.props;

        if (queueId) {
            this.setState({ isModalOpen: false });

            await this.reviewConsoleScreenStore.getReviewItem(queueId);
            const { reviewItem: nextReviewItem } = this.reviewConsoleScreenStore;

            if (nextReviewItem) {
                this.updateReviewConsoleHistoryPath(queueId, nextReviewItem.id);
            }
        }
    }

    @autoBind
    navigateBackToQueueOrdersPage() {
        const { match: { params: { queueId } } } = this.props;

        if (queueId) {
            this.history.push({
                pathname: ROUTES.build.queues(queueId)
            });
        }
    }

    @autoBind
    updateReviewConsoleHistoryPath(queueId: string, itemId: string) {
        this.reviewConsoleScreenStore.clearSearchId();
        this.history.push({
            pathname: ROUTES.build.itemDetailsReviewConsole(queueId, itemId)
        });
    }

    @autoBind
    async handleLabeling(label: LABEL) {
        await this.reviewConsoleScreenStore.labelOrder(label);

        if (!this.reviewConsoleScreenStore.itemUpdatingError) {
            this.processNextItem();
        }
    }

    @autoBind
    handleGoToLockedItemClick(queueViewId: string, itemId: string) {
        this.reviewConsoleScreenStore.clearSearchId();
        this.history.push({ pathname: ROUTES.build.itemDetailsReviewConsole(queueViewId, itemId) });
        this.reviewConsoleScreenStore.getItem(itemId, queueViewId);

        if (queueViewId !== this.reviewConsoleScreenStore.queue?.viewId) {
            this.reviewConsoleScreenStore.getQueueData(queueViewId);
        }
    }

    @autoBind
    handleTabChangeMode(mode: ITEM_DETAILS_MODE) {
        this.reviewConsoleScreenStore.setOpenDetailsTab(mode);
    }

    static renderReviewConsolePanelSpinner() {
        return (
            <div className={`${CN}__spinner-wrap`}>
                <Spinner label="Loading..." />
            </div>
        );
    }

    @autoBind
    renderReviewActionsPanel(blockActionButtons: boolean) {
        const {
            queue,
            reviewItem,
            loadingReviewItem
        } = this.reviewConsoleScreenStore;

        return (
            <>
                <ReviewActionsPanel
                    queue={queue}
                    item={reviewItem}
                    isBlur={loadingReviewItem}
                    blockActionButtons={blockActionButtons}
                    onFinishReviewProcessCallback={this.handleFinishReviewProcess}
                    onLabeled={this.handleLabeling}
                />
                {loadingReviewItem && ReviewConsole.renderReviewConsolePanelSpinner()}
            </>
        );
    }

    @autoBind
    renderStartReviewPanel() {
        const { queue, reviewItem } = this.reviewConsoleScreenStore;
        const queueReviewPermission = queue && this.reviewPermissionStore.queueReviewPermissions?.get(queue?.viewId);
        const itemReviewPermission = this.reviewPermissionStore.itemReviewPermissions(reviewItem, queue);
        const isReviewAllowed = (queueReviewPermission ? queueReviewPermission.isAllowed : true) && itemReviewPermission.isAllowed;
        let reasonToPreventReview: JSX.Element | string = queueReviewPermission?.reason || itemReviewPermission?.reason || '';

        if (reasonToPreventReview === QUEUE_REVIEW_PROHIBITION_REASONS.CANNOT_LOCK_TWO_ITEMS_ON_QUEUE) {
            const lockedItemOnQueue = this.lockedItemsStore.lockedItems!
                .find(item => item.lockedOnQueueViewId === queue?.viewId);
            const goToLockedItem = () => this.handleGoToLockedItemClick(lockedItemOnQueue!.lockedOnQueueViewId as string, lockedItemOnQueue!.id);

            reasonToPreventReview = (
                <>
                    <Text>
                        { reasonToPreventReview }
                    </Text>
                    <br />
                    <DefaultButton iconProps={{ iconName: 'Forward' }} onClick={goToLockedItem} className={`${CN}__go-to-locked-item`}>
                        { `Review ${lockedItemOnQueue?.id}` }
                    </DefaultButton>
                </>
            );
        }

        if (reasonToPreventReview === ITEM_REVIEW_PROHIBITION_REASONS.ITEM_ON_HOLD_ON_OTHER_USER) {
            reasonToPreventReview = (
                <>
                    <Text>
                        { reasonToPreventReview }
                    </Text>
                    <br />
                    However, you can&nbsp;
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                    <span
                        className={`${CN}__start-review-link`}
                        role="link"
                        tabIndex={0}
                        onClick={this.navToReviewConsole}
                    >
                        <abbr title="start-review">start review</abbr>
                    </span>
                </>
            );
        }

        if (reasonToPreventReview === ITEM_REVIEW_PROHIBITION_REASONS.ITEM_IS_LOCKED_IN_ANOTHER_QUEUE) {
            const goToLockedItem = () => this.handleGoToLockedItemClick(reviewItem!.lockedOnQueueViewId as string, reviewItem!.id);

            const queueName = this.lockedItemsStore.itemLocks!
                .find(({ item }) => reviewItem?.id === item.id)?.queue?.name;
            reasonToPreventReview = queueName
                ? `${reasonToPreventReview.replace('another queue', 'the queue')} "${queueName}"`
                : reasonToPreventReview;

            reasonToPreventReview = (
                <>
                    <Text>
                        {reasonToPreventReview}
                    </Text>
                    <br />
                    <DefaultButton iconProps={{ iconName: 'Forward' }} onClick={goToLockedItem} className={`${CN}__go-to-locked-item`}>
                        Review it in the proper queue
                    </DefaultButton>
                </>
            );
        }

        return (
            <StartReviewPanel
                onStartReviewCallback={this.startReviewProcess}
                isItemReviewLocked={!!queue?.sortingLocked && !this.isItemHeldByCurrentUser(reviewItem)}
                isActiveItem={reviewItem?.active}
                notes={reviewItem?.notes || []}
                isReviewAllowed={isReviewAllowed}
                reasonToPreventReview={reasonToPreventReview}
            />
        );
    }

    renderReviewConsolePanel() {
        const {
            blockActionButtons,
            loadingQueueData,
            loadingReviewItem
        } = this.reviewConsoleScreenStore;

        return (
            <div className={cx(`${CN}__review-console-panel`)}>
                <div className={`${CN}__review-console-heading`}>
                    <Text className={`${CN}__heading-title`} variant="mediumPlus">
                        Review console
                    </Text>
                </div>
                <Switch>
                    <Route
                        exact
                        path={[
                            ROUTES.ITEM_DETAILS,
                            ROUTES.SEARCH_ITEM_DETAILS,
                            ROUTES.SEARCH_INACTIVE_ITEM_DETAILS,
                        ]}
                        render={() => (loadingQueueData || loadingReviewItem
                            ? ReviewConsole.renderReviewConsolePanelSpinner()
                            : this.renderStartReviewPanel())}
                    />
                    <Route
                        path={[
                            ROUTES.REVIEW_CONSOLE,
                            ROUTES.ITEM_DETAILS_REVIEW_CONSOLE,
                            ROUTES.SEARCH_ITEM_DETAILS_REVIEW_CONSOLE
                        ]}
                        render={() => this.renderReviewActionsPanel(blockActionButtons)}
                    />
                </Switch>
            </div>
        );
    }

    renderGetItemError(error: ApiServiceError | MrUserError) {
        const errorMessage: string = (error as any).displayMessage || (error as ApiServiceError).response!.data.details;
        if (errorMessage.includes('All of the items in this queue are locked')) {
            return this.renderAllDoneModal();
        }
        return this.renderErrorModal(errorMessage);
    }

    renderAllDoneModal() {
        return (
            <ReviewModal isOpen>
                <Stack horizontalAlign="center">
                    <Stack.Item className={`${CN}__modal-illustration`} align="center">
                        <AllDoneIllustration />
                    </Stack.Item>
                    <Stack.Item className={`${CN}__modal-text-item`}>
                        <Text className={`${CN}__modal-text`}>
                            All done! The orders in the queue were processed or locked by other analysts
                        </Text>
                    </Stack.Item>
                    <PrimaryButton
                        className={`${CN}__all-done-modal-action-btn`}
                        onClick={this.handleGoToQueuesClick}
                        primary
                        text="Go to the queues"
                    />
                </Stack>
            </ReviewModal>
        );
    }

    renderErrorModal(message: string) {
        return (
            <ReviewModal isOpen headerText="An error occured">
                <div className={`${CN}__error-modal-content`}>
                    <Text className={`${CN}__modal-text`}>
                        { message }
                    </Text>
                    <PrimaryButton
                        className={`${CN}__all-done-modal-action-btn`}
                        onClick={this.handleGoToQueuesClick}
                        primary
                        text="Go to the queues"
                    />
                </div>
            </ReviewModal>
        );
    }

    renderLockModal() {
        const { isModalOpen } = this.state;

        return (
            <ReviewModal
                onClose={this.handleCloseModal}
                closeIcon
                isOpen={isModalOpen}
            >
                <Stack horizontalAlign="center">
                    <Stack.Item className={`${CN}__modal-illustration`} align="center">
                        <OrderLockedIllustrationSvg />
                    </Stack.Item>
                    <Stack.Item className={`${CN}__modal-text-item`}>
                        <Text className={`${CN}__modal-text`}>
                            The order has been locked by someone else
                        </Text>
                    </Stack.Item>
                    <Stack.Item>
                        <PrimaryButton
                            onClick={this.processNextItem}
                            primary
                            text="Process next order"
                        />
                    </Stack.Item>
                </Stack>
            </ReviewModal>
        );
    }

    render() {
        const {
            reviewItem,
            loadingReviewItemError,
            loadingReviewItem,
            queue,
            externalLinksMap,
            searchId,
        } = this.reviewConsoleScreenStore;

        // Fallback for the deleted queueus
        const selectedQueue = queue || {
            queueId: reviewItem?.label?.queueId,
            viewId: reviewItem?.label?.queueId,
            shortId: reviewItem?.label?.queueId?.substr(0, 8),
            name: 'Deleted queue',
            created: '',
        };

        return (
            <div className={CN}>
                <ConsoleHeader
                    queue={selectedQueue}
                    onClickCallback={this.handleBackButtonClick}
                    inactiveItem={reviewItem?.active === false}
                    backButtonHint={searchId ? 'Back to search' : 'Back to queues'}
                />
                <ItemDetails
                    onTabChange={this.handleTabChangeMode}
                    onProcessNext={this.navigateBackToQueueOrdersPage}
                    handleBackToQueuesClickCallback={this.handleBackButtonClick}
                    reviewItem={reviewItem}
                    loadingReviewItem={loadingReviewItem}
                    externalLinksMap={externalLinksMap}
                    queue={queue}
                />
                {this.renderReviewConsolePanel()}
                {this.renderLockModal()}
                {loadingReviewItemError && this.renderGetItemError(loadingReviewItemError)}
            </div>
        );
    }
}
