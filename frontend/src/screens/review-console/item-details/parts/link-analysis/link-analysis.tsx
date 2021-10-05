// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './link-analysis.scss';

import autobind from 'autobind-decorator';
import cx from 'classnames';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { disposeOnUnmount, observer } from 'mobx-react';
import React, { Component } from 'react';

import {
    CommandBarButton,
    DefaultButton,
    IconButton,
    PrimaryButton
} from '@fluentui/react/lib/Button';
import { IContextualMenuItem, } from '@fluentui/react/lib/ContextualMenu';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Modal } from '@fluentui/react/lib/Modal';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';

import { CSVLink } from 'react-csv';
import SearchIllustrationSvg from '../../../../../assets/search-illustration.svg';
import { ErrorContent } from '../../../../../components/error-content';
import { LABEL, LABEL_NAMES, ROUTES } from '../../../../../constants';
import { Queue } from '../../../../../models';
import { Item } from '../../../../../models/item';
import { LinkAnalysisDfpItem, LinkAnalysisMrItem } from '../../../../../models/item/link-analysis';
import { TYPES } from '../../../../../types';
import { ANALYSIS_RESULT_ITEMS, LinkAnalysisItem, LinkAnalysisStore } from '../../../../../view-services';
import { ExpandableGroup } from '../../../../queues/queues-list/expandable-group';
import { ItemDetailsTile } from '../../item-details-tile';
import { AnalysisField } from './analysis-field/analysis-field';
import { ItemsList } from './items-list';
import { ResultsDataTable } from './results-data-table';
import { getAnalysisFormattedData } from '../../../../../utility-services/csv-data-builder';

interface LinkAnalysisComponentProps {
    queue: Queue | null;
    item: Item;
    linkAnalysisStore: LinkAnalysisStore;
    onProcessNext(): void;
}

const CN = 'link-analysis';

export interface ApplyDecisionContextualMenuItem extends IContextualMenuItem {
    key: LABEL,
    text: string
}

@observer
export class LinkAnalysis extends Component<LinkAnalysisComponentProps, never> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    componentDidMount(): void {
        const { linkAnalysisStore, queue, item } = this.props;

        if (queue) {
            linkAnalysisStore.setQueueId(queue.viewId);
        }

        if (item) {
            linkAnalysisStore.setItem(item);
        }

        disposeOnUnmount(this, linkAnalysisStore.reactOnSelectedAnalysisFields());
    }

    componentWillUnmount(): void {
        const { linkAnalysisStore } = this.props;

        linkAnalysisStore.resetSelectedItems();
    }

    @autobind
    getCommandBarButtonItem(): ApplyDecisionContextualMenuItem[] {
        return [{
            key: LABEL.GOOD,
            text: LABEL_NAMES[LABEL.GOOD],
            iconProps: {
                iconName: 'CompletedSolid',
                className: `${CN}__apply-decisions-btn-good`
            },
            onClick: () => this.handleApplyDecisionClick(LABEL.GOOD)
        }, {
            key: LABEL.BAD,
            text: LABEL_NAMES[LABEL.BAD],
            iconProps: {
                iconName: 'Blocked2Solid',
                className: `${CN}__apply-decisions-btn-bad`
            },
            onClick: () => this.handleApplyDecisionClick(LABEL.BAD)
        }];
    }

    @autobind
    handleRefreshButtonClick() {
        const { linkAnalysisStore } = this.props;

        linkAnalysisStore.refreshAnalysisFieldCounts();
    }

    @autobind
    handleLoadMoreItemClick(type: ANALYSIS_RESULT_ITEMS) {
        const { linkAnalysisStore } = this.props;

        linkAnalysisStore.loadMoreAnalysisItems(type);
    }

    @autobind
    handleSelection(type: ANALYSIS_RESULT_ITEMS, selectedItems: LinkAnalysisItem[]) {
        const { linkAnalysisStore: { mrItemsStore } } = this.props;

        if (type === ANALYSIS_RESULT_ITEMS.MR) {
            mrItemsStore.setSelectedAnalysisItems((selectedItems as LinkAnalysisMrItem[]).map(item => item.item.id));
        }
    }

    @autobind
    handleApplyDecisionClick(label: LABEL) {
        const { linkAnalysisStore } = this.props;

        linkAnalysisStore.setDecisionLabelToApply(label);
        linkAnalysisStore.openConfirmationModal();
    }

    @autobind
    async handleApplyDecisionsClick() {
        const { linkAnalysisStore } = this.props;

        linkAnalysisStore.closeConfirmationModal();
        linkAnalysisStore.labelBatchItems();
        linkAnalysisStore.openResultModal();
    }

    @autobind
    handleDismissedResultsModal() {
        const { linkAnalysisStore, onProcessNext } = this.props;
        const { isSelectedItemsIdsToLabelContainsCurrentItemId } = linkAnalysisStore;

        linkAnalysisStore.resetSelectedItems();

        if (isSelectedItemsIdsToLabelContainsCurrentItemId) {
            onProcessNext();
            return;
        }

        linkAnalysisStore.refreshAnalysisFieldCounts();
    }

    @autobind
    updateUrlParams(searchId: string) {
        const { queue, item } = this.props;

        if (queue && item) {
            let path = ROUTES.build.itemDetails(queue.viewId, item.id);

            if (searchId) {
                path += `?la=${searchId}`;
            }

            this.history.replace(path);
        }
    }

    renderWarningMessage(item: Item) {
        return (
            <MessageBar
                className={`${CN}__warning-message`}
                messageBarType={MessageBarType.warning}
                messageBarIconProps={{ iconName: 'Warning', className: `${CN}__warning-message-icon` }}
            >
                Please note, that you have selected current purchase id
                &nbsp;
                <span style={{ fontWeight: 600 }}>{item.id}</span>
                &nbsp;
                for the batch labeling.
                <p style={{ marginBottom: 0 }}>After the decision will be applied, you will be redirect back to the queue orders page.</p>
            </MessageBar>
        );
    }

    renderConfirmationModal() {
        const { linkAnalysisStore, item } = this.props;

        const closeModal = () => linkAnalysisStore.closeConfirmationModal();

        const {
            isConfirmationModalOpen,
            totalCountDecisionsToBeApplied,
            decisionLabelToApplyDisplayName,
            isSelectedItemsIdsToLabelContainsCurrentItemId
        } = linkAnalysisStore;
        return (
            <Modal
                titleAriaId="Confirmation modal"
                isOpen={isConfirmationModalOpen}
                onDismiss={closeModal}
                containerClassName={`${CN}__modal`}
            >
                <div className={`${CN}__modal-header`}>
                    <div className={`${CN}__modal-title`}>
                        Apply decisions
                    </div>
                    <IconButton
                        ariaLabel="Close confirmation modal"
                        iconProps={{
                            iconName: 'Cancel'
                        }}
                        onClick={closeModal}
                    />
                </div>
                {isSelectedItemsIdsToLabelContainsCurrentItemId && !!item && this.renderWarningMessage(item)}
                <div>
                    {`Are you sure you want to mark items (${totalCountDecisionsToBeApplied}) as "${decisionLabelToApplyDisplayName}"?`}
                </div>
                <div className={`${CN}__modal-actions`}>
                    <PrimaryButton
                        onClick={this.handleApplyDecisionsClick}
                        text="Apply"
                    />
                    <DefaultButton
                        onClick={closeModal}
                        text="Cancel"
                    />
                </div>
            </Modal>
        );
    }

    static renderErrorIcon() {
        return (
            <FontIcon
                iconName="ErrorBadge"
                className={`${CN}__error-icon`}
            />
        );
    }

    renderLoader(): JSX.Element {
        return (
            <div className={`${CN}__center-aligned`}>
                <Spinner label="Loading results..." />
            </div>
        );
    }

    static renderSuccessIcon() {
        return (
            <FontIcon
                iconName="Completed"
                className={`${CN}__success-icon`}
            />
        );
    }

    renderResultModal() {
        const { linkAnalysisStore } = this.props;
        const {
            successAnalysisResultsCount,
            failedAnalysisResultsCount,
            sortedAnalysisResult,
            isBatchApplyDecisionsLoading,
            isResultModalOpen
        } = linkAnalysisStore;

        const closeModal = () => linkAnalysisStore.closeResultModal();

        return (
            <Modal
                titleAriaId="Result modal"
                isOpen={isResultModalOpen}
                onDismiss={closeModal}
                containerClassName={`${CN}__modal`}
                onDismissed={this.handleDismissedResultsModal}
            >
                <div className={`${CN}__modal-header`}>
                    <div className={`${CN}__modal-title`}>
                        Apply decisions result
                    </div>
                    <IconButton
                        ariaLabel="Close confirmation modal"
                        iconProps={{
                            iconName: 'Cancel'
                        }}
                        onClick={closeModal}
                    />
                </div>
                { isBatchApplyDecisionsLoading
                    ? this.renderLoader()
                    : (
                        <>
                            <div className={`${CN}__modal-sub-header`}>
                                { failedAnalysisResultsCount > 0 && (
                                    <div className={`${CN}__modal-action-error`}>
                                        <div className={`${CN}__modal-error-icon`}>
                                            {LinkAnalysis.renderErrorIcon()}
                                        </div>
                                        <div style={{ fontWeight: 600 }}>{failedAnalysisResultsCount}</div>
                                        <div style={{ display: 'flex' }}>
                                            &nbsp;decisions&nbsp;
                                            <div style={{ fontWeight: 600 }}>not</div>
                                            &nbsp;applied.
                                        </div>
                                    </div>
                                )}
                                { successAnalysisResultsCount > 0 && (
                                    <div className={`${CN}__modal-action-success`}>
                                        <div className={`${CN}__modal-success-icon`}>
                                            {LinkAnalysis.renderSuccessIcon()}
                                        </div>
                                        <div style={{ fontWeight: 600 }}>{successAnalysisResultsCount}</div>
                                        <div style={{ display: 'flex' }}>
                                            &nbsp;decisions&nbsp;
                                            <div style={{ fontWeight: 600 }}>successfully</div>
                                            &nbsp;applied.
                                        </div>
                                    </div>
                                )}
                            </div>
                            <ResultsDataTable items={sortedAnalysisResult} />
                        </>
                    )}
                <div className={`${CN}__modal-actions`}>
                    <PrimaryButton
                        onClick={closeModal}
                        text="Close"
                    />
                </div>
            </Modal>
        );
    }

    renderFields() {
        const { linkAnalysisStore: { analysisFields, isLinkAnalysisLoading } } = this.props;

        return analysisFields.map(field => (
            <AnalysisField
                isLinkAnalysisLoading={isLinkAnalysisLoading}
                key={field.id}
                field={field}
            />
        ));
    }

    renderRefreshButton() {
        const { linkAnalysisStore: { isLinkAnalysisLoading } } = this.props;

        return (
            <CommandBarButton
                text="Refresh list"
                iconProps={{ iconName: 'Refresh' }}
                className={`${CN}__refresh-button`}
                onClick={this.handleRefreshButtonClick}
                disabled={isLinkAnalysisLoading}
            />
        );
    }

    static renderPlaceholder(): JSX.Element | null {
        return (
            <div className={`${CN}__center-aligned`}>
                <ErrorContent
                    illustrationSvg={SearchIllustrationSvg}
                    message="Select analysis fields to see the results."
                />
            </div>
        );
    }

    renderCommandApplyDecisionsButton() {
        const { linkAnalysisStore: { totalCountDecisionsToBeApplied } } = this.props;
        const isDisabled = totalCountDecisionsToBeApplied === 0;

        return (
            <CommandBarButton
                disabled={isDisabled}
                className={cx(
                    `${CN}__apply-decisions-btn`,
                    { [`${CN}__apply-decisions-btn--disabled`]: isDisabled }
                )}
                text={`Apply decisions (${totalCountDecisionsToBeApplied})`}
                iconProps={{ iconName: 'CheckList' }}
                menuProps={{ items: this.getCommandBarButtonItem() }}
            />
        );
    }

    renderDownloadLink(items: LinkAnalysisMrItem[] | LinkAnalysisDfpItem[]): JSX.Element {
        if (items.length > 0) {
            return (
                <>
                    <CSVLink
                        filename="LinkAnalysis.csv"
                        data={getAnalysisFormattedData(items)}
                    >
                        <DefaultButton
                            className={`${CN}__button`}
                            text="Download"
                            iconProps={{ iconName: 'DownloadDocument' }}
                        />
                    </CSVLink>
                </>
            );
        }

        return <></>;
    }

    render() {
        const {
            linkAnalysisStore: {
                mrItemsStore,
                dfpItemsStore,
                selectedAnalysisFieldsCount,
                found,
                foundInMr
            }
        } = this.props;

        const {
            items: mrItems,
            loadingMoreItems: mrLoadingMoreItems,
            canLoadMore: mrCanLoadMore,
            wasFirstPageLoaded: mrWasFirstPageLoaded
        } = mrItemsStore;

        const {
            items: dfpItems,
            loadingMoreItems: dfpLoadingMoreItems,
            canLoadMore: dfpCanLoadMore,
            wasFirstPageLoaded: dfpFirstPageLoaded
        } = dfpItemsStore;

        const foundInDfp = found >= foundInMr ? found - foundInMr : 0;

        return (
            <div className={CN}>
                <ItemDetailsTile
                    className={`${CN}__analysis-fields`}
                    title={`Analysis fields (${selectedAnalysisFieldsCount})`}
                >
                    <div className={`${CN}__fields-container`}>
                        {this.renderFields()}
                    </div>
                    {this.renderRefreshButton()}
                </ItemDetailsTile>
                {
                    !selectedAnalysisFieldsCount
                        ? LinkAnalysis.renderPlaceholder()
                        : (
                            <>
                                <div className={`${CN}__results-header`}>
                                    <Text variant="large" className={`${CN}__header-title`}>
                                        {`Analysis results (${found})`}
                                    </Text>
                                    {this.renderCommandApplyDecisionsButton()}

                                </div>
                                <div>
                                    <ExpandableGroup
                                        key="mr-orders"
                                        title={`Orders selected for Manual Review (${foundInMr})`}
                                        additionalElements={this.renderDownloadLink(mrItems)}
                                        defaultExpanded
                                    >
                                        <ItemsList
                                            isSelectable
                                            wasFirstPageLoaded={mrWasFirstPageLoaded}
                                            canLoadMore={mrCanLoadMore}
                                            isLoading={mrLoadingMoreItems}
                                            onSelectionChanged={selectedItems => this.handleSelection(
                                                ANALYSIS_RESULT_ITEMS.MR,
                                                selectedItems
                                            )}
                                            data={mrItems}
                                            onLoadMoreClick={() => this.handleLoadMoreItemClick(ANALYSIS_RESULT_ITEMS.MR)}

                                        />
                                    </ExpandableGroup>
                                    <ExpandableGroup
                                        key="dfp-orders"
                                        title={`Other data in Dynamics 356 Fraud Protection (${foundInDfp})`}
                                        additionalElements={this.renderDownloadLink(dfpItems)}
                                        defaultExpanded
                                    >
                                        <ItemsList
                                            wasFirstPageLoaded={dfpFirstPageLoaded}
                                            canLoadMore={dfpCanLoadMore}
                                            isLoading={dfpLoadingMoreItems}
                                            onSelectionChanged={selectedItems => this.handleSelection(
                                                ANALYSIS_RESULT_ITEMS.DFP,
                                                selectedItems
                                            )}
                                            data={dfpItems}
                                            onLoadMoreClick={() => this.handleLoadMoreItemClick(ANALYSIS_RESULT_ITEMS.DFP)}
                                        />
                                    </ExpandableGroup>
                                </div>
                            </>
                        )
                }
                {this.renderConfirmationModal()}
                {this.renderResultModal()}
            </div>
        );
    }
}
