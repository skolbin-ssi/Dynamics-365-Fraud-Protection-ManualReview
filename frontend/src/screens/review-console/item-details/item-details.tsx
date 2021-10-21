// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './item-details.scss';

import autobind from 'autobind-decorator';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import { IconButton } from '@fluentui/react/lib/Button';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';

import { ExternalLink, Queue } from '../../../models';
import { Item } from '../../../models/item';
import { TYPES } from '../../../types';
import { ITEM_DETAILS_MODE, LinkAnalysisStore } from '../../../view-services';
import { FraudScoreIndication } from './fraud-score-indication';
import {
    AccountSummary,
    Console,
    CustomData,
    DeviceInformation,
    IPInformation,
    PaymentInformation,
    TransactionHistory,
    TransactionMap,
    TransactionSummary,
    Velocities,
} from './parts';
import { LinkAnalysis } from './parts/link-analysis';

enum ITEM_DETAILS_TABS {
    CURRENT_TRANSACTION = 'transaction',
    PREVIOUS_TRANSACTIONS = 'history'
}

interface ItemDetailsProps {
    reviewItem: Item | null,
    loadingReviewItem: boolean,
    loadingReviewItemError?: Error | null,
    handleBackToQueuesClickCallback(): void;
    queue: Queue | null;
    externalLinksMap: ExternalLink[];
    onProcessNext(): void;
    onTabChange(mode: ITEM_DETAILS_MODE): void;
}

const CN = 'item-details';

export interface ItemDetailsState {
    mode: ITEM_DETAILS_MODE,
    selectedTab: ITEM_DETAILS_TABS
}

@observer
export class ItemDetails extends Component<ItemDetailsProps, ItemDetailsState> {
    @resolve(TYPES.LINK_ANALYSIS_STORE)
    private linkAnalysisStore!: LinkAnalysisStore;

    constructor(props: ItemDetailsProps) {
        super(props);

        this.state = {
            mode: ITEM_DETAILS_MODE.DETAILS,
            selectedTab: ITEM_DETAILS_TABS.CURRENT_TRANSACTION,
        };
    }

    @autobind
    handlePivotChange(item?: PivotItem) {
        const itemKey = item?.props.itemKey;

        if (itemKey) {
            this.setState({ selectedTab: itemKey as ITEM_DETAILS_TABS });
        }
    }

    @autobind
    toggleView(event: React.MouseEvent<HTMLElement>) {
        const { onTabChange } = this.props;
        const mode = event.currentTarget.getAttribute('data-mode') as ITEM_DETAILS_MODE;
        onTabChange(mode);
        this.setState({ mode });
    }

    renderOrderDetails(item: Item, externalLinksMap: ExternalLink[]) {
        const { selectedTab } = this.state;

        return (
            <Pivot
                selectedKey={selectedTab}
                onLinkClick={this.handlePivotChange}
            >
                <PivotItem
                    key={ITEM_DETAILS_TABS.CURRENT_TRANSACTION}
                    headerText="Transaction"
                    itemKey={ITEM_DETAILS_TABS.CURRENT_TRANSACTION}
                >
                    <div className={`${CN}__order-details`}>
                        <TransactionSummary item={item} className={`${CN}__full-width`} />
                        <TransactionMap item={item} className={`${CN}__full-width`} />
                        <AccountSummary item={item} externalLinksMap={externalLinksMap} className={`${CN}__full-width`} />
                        <PaymentInformation item={item} className={`${CN}__one-third`} />
                        <DeviceInformation item={item} className={`${CN}__one-third`} />
                        <IPInformation item={item} className={`${CN}__one-third`} />
                        {item.purchase.customData.length ? <CustomData item={item} className={`${CN}__full-width`} /> : null}
                    </div>
                </PivotItem>
                <PivotItem
                    key={ITEM_DETAILS_TABS.PREVIOUS_TRANSACTIONS}
                    headerText="Previous transactions"
                    itemKey={ITEM_DETAILS_TABS.PREVIOUS_TRANSACTIONS}
                >
                    <div className={`${CN}__order-details`}>
                        {
                            item.purchase.calculatedFields.velocities.length
                                ? <Velocities item={item} className={`${CN}__full-width`} />
                                : null
                        }
                        <TransactionHistory item={item} className={`${CN}__full-width`} />
                    </div>
                </PivotItem>
            </Pivot>
        );
    }

    renderOrderAsJSON(item: Item) {
        return (
            <Console item={item} />
        );
    }

    renderAnalysisFields(item: Item) {
        const { queue, onProcessNext, } = this.props;

        return (
            <LinkAnalysis
                onProcessNext={onProcessNext}
                linkAnalysisStore={this.linkAnalysisStore}
                item={item}
                queue={queue}
            />
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
            case ITEM_DETAILS_MODE.LINK_ANALYSIS:
                return this.renderAnalysisFields(reviewItem);
        }
    }

    render() {
        const {
            reviewItem,
            loadingReviewItem,
            loadingReviewItemError,
            queue
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
                        <Text className={`${CN}__order-id`}>
                            { reviewItem?.id }
                            &nbsp;
                            {
                                reviewItem?.purchase?.user?.isFraud
                            && (
                                <span className={`${CN}__warning`}>
                                    &nbsp;
                                    <FontIcon
                                        iconName="WarningSolid"
                                    />
                                    &nbsp;
                                    User Restricted
                                    &nbsp;
                                </span>
                            )
                            }
                        </Text>
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
                        <IconButton
                            className={`${CN}__mode-icon`}
                            iconProps={{
                                iconName: 'Relationship',
                                styles: {}
                            }}
                            checked={mode === ITEM_DETAILS_MODE.LINK_ANALYSIS}
                            data-mode={ITEM_DETAILS_MODE.LINK_ANALYSIS}
                            onClick={this.toggleView}
                            disabled={!queue}
                        />
                    </div>
                </div>
                { this.renderDetails() }
            </div>
        );
    }
}
