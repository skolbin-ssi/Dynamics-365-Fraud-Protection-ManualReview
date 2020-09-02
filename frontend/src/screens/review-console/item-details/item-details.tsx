import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Text } from '@fluentui/react/lib/Text';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { ActionButton, IconButton } from '@fluentui/react/lib/Button';
import { Item } from '../../../models/item';
import { ExternalLink, Queue } from '../../../models';
import { FraudScoreIndication } from './fraud-score-indication';
import {
    AccountSummary,
    Console, PaymentInformation,
    TransactionMap,
    TransactionSummary,
    DeviceInformation,
    IPInformation
} from './parts';
import './item-details.scss';

export enum ITEM_DETAILS_MODE {
    DETAILS = 'details',
    JSON = 'json'
}

interface ItemDetailsProps {
    reviewItem: Item | null,
    loadingReviewItem: boolean,
    loadingReviewItemError?: Error | null,
    handleBackToQueuesClickCallback(): void;
    queue: Queue | null;
    externalLinksMap: ExternalLink[]
}

const CN = 'item-details';

interface ItemDetailsState {
    mode: ITEM_DETAILS_MODE
}

@observer
export class ItemDetails extends Component<ItemDetailsProps, ItemDetailsState> {
    constructor(props: ItemDetailsProps) {
        super(props);

        this.state = {
            mode: ITEM_DETAILS_MODE.DETAILS
        };
    }

    @autobind
    toggleView(event: React.MouseEvent<HTMLElement>) {
        const mode = event.currentTarget.getAttribute('data-mode') as ITEM_DETAILS_MODE;
        this.setState({ mode });
    }

    renderOrderDetails(item: Item, externalLinksMap: ExternalLink[]) {
        return (
            <div className={`${CN}__order-details`}>
                <TransactionSummary item={item} className={`${CN}__full-width`} />
                <TransactionMap item={item} className={`${CN}__full-width`} />
                <AccountSummary item={item} externalLinksMap={externalLinksMap} className={`${CN}__full-width`} />
                <PaymentInformation item={item} className={`${CN}__one-third`} />
                <DeviceInformation item={item} className={`${CN}__one-third`} />
                <IPInformation item={item} className={`${CN}__one-third`} />
            </div>
        );
    }

    renderOrderAsJSON(item: Item) {
        return (
            <Console item={item} />
        );
    }

    @autobind
    renderDetails() {
        const { mode } = this.state;
        const { reviewItem, externalLinksMap } = this.props;

        if (!reviewItem) {
            return null;
        }

        switch (mode) {
            case ITEM_DETAILS_MODE.DETAILS:
            default:
                return this.renderOrderDetails(reviewItem, externalLinksMap);
            case ITEM_DETAILS_MODE.JSON:
                return this.renderOrderAsJSON(reviewItem);
        }
    }

    render() {
        const {
            queue,
            reviewItem,
            loadingReviewItem,
            handleBackToQueuesClickCallback,
            loadingReviewItemError
        } = this.props;
        const { mode } = this.state;

        if (loadingReviewItem || !reviewItem) {
            return (
                <div className={`${CN}__status-data`}>
                    <Spinner label="Loading Review Item..." />
                </div>
            );
        }

        if (loadingReviewItemError) {
            return null;
        }

        if (queue && !queue.size) {
            return (
                <div className={`${CN}__status-data`}>
                    <Text>This queue is empty</Text>
                    <ActionButton
                        className={`${CN}__back-to-queues`}
                        onClick={handleBackToQueuesClickCallback}
                    >
                        Back to Queues
                    </ActionButton>
                </div>
            );
        }

        return (
            <div className={`${CN}__order-details-layout`}>
                <div className={`${CN}__order-details-heading`}>
                    <div className={`${CN}__order-details-heading-fraud-score-placeholder`} />
                    <FraudScoreIndication
                        className={`${CN}__order-details-heading-fraud-score`}
                        item={reviewItem}
                    />
                    <div className={`${CN}__order-id-part`}>
                        <Text className={`${CN}__order-id-title`}>Purchase ID:&nbsp;</Text>
                        <Text className={`${CN}__order-id`}>{ reviewItem?.id }</Text>
                    </div>
                    <div className={`${CN}__order-controls-part`}>
                        <IconButton
                            className={`${CN}__mode-icon`}
                            iconProps={{
                                iconName: 'PreviewLink',
                                styles: {}
                            }}
                            checked={mode === ITEM_DETAILS_MODE.DETAILS}
                            data-mode={ITEM_DETAILS_MODE.DETAILS}
                            onClick={this.toggleView}
                        />
                        <IconButton
                            className={`${CN}__mode-icon`}
                            iconProps={{
                                iconName: 'Code',
                                styles: {}
                            }}
                            checked={mode === ITEM_DETAILS_MODE.JSON}
                            data-mode={ITEM_DETAILS_MODE.JSON}
                            onClick={this.toggleView}
                        />
                    </div>
                </div>
                { this.renderDetails() }
            </div>
        );
    }
}
