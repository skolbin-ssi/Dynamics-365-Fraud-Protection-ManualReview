import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { History } from 'history';
import autobind from 'autobind-decorator';
import { resolve } from 'inversify-react';
import cn from 'classnames';

import { Callout, DirectionalHint } from '@fluentui/react/lib/Callout';
import { Text } from '@fluentui/react/lib/Text';
import { Link } from '@fluentui/react/lib/Link';
import { DefaultButton } from '@fluentui/react/lib/Button';

import { TYPES } from '../../types';
import { LockedItemsStore, ItemLock } from '../../view-services';
import { ROUTES } from '../../constants';

import './unfinished-orders.scss';

export interface UnfinishedOrdersProps {
}

interface UnfinishedOrdersOwnState {
    isOpened: boolean;
}

const CN = 'unfinished-orders';

@observer
export class UnfinishedOrders extends Component<UnfinishedOrdersProps, UnfinishedOrdersOwnState> {
    @resolve(TYPES.LOCKED_ITEMS_STORE)
    private lockedItemsStore!: LockedItemsStore;

    @resolve(TYPES.HISTORY)
    private history!: History;

    private buttonClass = `${CN}__button`;

    constructor(props: UnfinishedOrdersProps) {
        super(props);
        this.state = {
            isOpened: false
        };
    }

    componentDidMount() {
        this.lockedItemsStore.getLockedItems();
    }

    @autobind
    setIsOpened(value: boolean) {
        this.setState({ isOpened: value });
    }

    @autobind
    goToOrder(queueId: string, itemId: string) {
        this.history.push({
            pathname: ROUTES.build.itemDetailsReviewConsole(queueId, itemId)
        });
        this.setIsOpened(false);
    }

    @autobind
    async unassignItem(itemId: string, queueId: string | null) {
        const { itemLocks } = this.lockedItemsStore;
        await this.lockedItemsStore.unassignItem(itemId, queueId);
        await this.lockedItemsStore.getLockedItems();
        if (itemLocks && itemLocks.length <= 1) {
            this.setIsOpened(false);
        }
    }

    @autobind
    renderOrder(order: ItemLock) {
        const {
            item: { id: itemId, lockedOnQueueViewId },
            queue
        } = order;
        return (
            <div className={`${CN}__order`} key={`unfinished-order-${itemId}`}>
                <Text className={cn(`${CN}__order-text`)}>
                    { queue?.name || `Queue ID: ${lockedOnQueueViewId}` }
                </Text>
                {
                    lockedOnQueueViewId ? (
                        <Link
                            href={ROUTES.build.itemDetailsReviewConsole(lockedOnQueueViewId, itemId)}
                            className={cn(`${CN}__order-text`, `${CN}__queue-btn`)}
                        >
                            { itemId }
                        </Link>
                    ) : (
                        <Text className={cn(`${CN}__order-text`, `${CN}__queue-btn`)}>
                            { itemId }
                        </Text>
                    )
                }

                { (lockedOnQueueViewId && itemId) && (
                    <DefaultButton
                        iconProps={{ iconName: 'Forward' }}
                        text="Review"
                        onClick={() => this.goToOrder(lockedOnQueueViewId, itemId)}
                    />
                )}
                { (lockedOnQueueViewId && itemId) && (
                    <DefaultButton
                        iconProps={{ iconName: 'CircleStopSolid' }}
                        text="Unlock"
                        onClick={() => this.unassignItem(itemId, lockedOnQueueViewId)}
                    />
                )}
            </div>
        );
    }

    @autobind
    renderButton() {
        const { lockedItems } = this.lockedItemsStore;
        const { isOpened } = this.state;
        return (
            <button
                type="button"
                onClick={() => this.setIsOpened(!isOpened)}
                className={cn(this.buttonClass, { [`${CN}__button--active`]: isOpened })}
            >
                <Text variant="mediumPlus" className={`${CN}__button-text`}>
                    {
                        lockedItems
                            ? `You have ${lockedItems.length} unfinished order${lockedItems.length > 1 ? 's' : ''}`
                            : ''
                    }
                </Text>
            </button>
        );
    }

    @autobind
    renderModal() {
        const { isOpened } = this.state;
        const { itemLocks } = this.lockedItemsStore;
        return (
            <Callout
                className={`${CN}__modal`}
                hidden={!isOpened}
                isBeakVisible={false}
                directionalHint={DirectionalHint.topLeftEdge}
                gapSpace={0}
                target={`.${this.buttonClass}`}
                onDismiss={() => this.setIsOpened(false)}
            >
                {
                    itemLocks?.map(this.renderOrder)
                }
            </Callout>
        );
    }

    render() {
        const { itemLocks } = this.lockedItemsStore;
        if (!itemLocks?.length) {
            return null;
        }
        return (
            <>
                {this.renderButton()}
                {this.renderModal()}
            </>
        );
    }
}
