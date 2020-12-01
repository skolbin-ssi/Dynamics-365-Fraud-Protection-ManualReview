// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { resolve } from 'inversify-react';
import autobind from 'autobind-decorator';
import { History } from 'history';
import { disposeOnUnmount, observer } from 'mobx-react';
import cx from 'classnames';

import { SliceTooltipProps } from '@nivo/line';
import { Text } from '@fluentui/react/lib/Text';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { PersonaSize } from '@fluentui/react/lib/Persona';
import { CommandBarButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Callout, DirectionalHint } from '@fluentui/react/lib/Callout';
import { Facepile, IFacepilePersona, OverflowButtonType } from '@fluentui/react/lib/Facepile';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Shimmer, ShimmerElementsGroup, ShimmerElementType } from '@fluentui/react/lib/Shimmer';

import { DataTable } from './data-table/data-table';

import { BlurLoader } from '../blur-loader';
import { ProgressCell } from '../progress-cell/progress-cell';
import { LineChart, SliceTooltip } from '../line-chart';
import { SwitchHeader as AggregationHeader } from '../switch-header';

import {
    DemandQueuePerformanceStore,
    QueueItem
} from '../../../view-services/dashboard/demand-queue-performance-store';
import {
    CHART_AGGREGATION_PERIOD,
    CHART_AGGREGATION_PERIOD_DISPLAY,
    QUEUE_VIEW_TYPE,
    ROUTES,
    WARNING_MESSAGES
} from '../../../constants';
import { TYPES } from '../../../types';
import { Item } from '../../../models/item';
import { COLORS } from '../../../styles/variables';
import { QueueView } from '../../../models';
import { CurrentProgress } from '../../../models/dashboard/progress-performance-metric';
import { ExpandableGroup } from '../../queues/queues-list/expandable-group';

import { ReportsModalStore } from '../../../view-services';
import { SwitchTabs } from '../../../components/switch-tabs';

import './demand-supply-by-queue.scss';
import { ScoreDistribution } from './score-distribution';

const CN = 'demand-supply-by-queue-dashboard';

const MAX_SUPERVISORS_TO_SHOW = 25;
const MAX_REVIEWERS_TO_SHOW = 25;
const MAX_CHART_TICKS_VALUES_COUNT = 15;

interface DemandQueueRouteProps {
    queueId: string
}

interface DemandSupplyProps extends RouteComponentProps<DemandQueueRouteProps> {
}

interface DemandSupplyByQueueState {
    isQueueCalloutVisible: boolean;
}

@observer
export class DemandSupplyByQueue extends Component<DemandSupplyProps, DemandSupplyByQueueState> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.DEMAND_QUEUE_PERFORMANCE_STORE)
    private demandQueuePerformanceStore!: DemandQueuePerformanceStore;

    @resolve(TYPES.REPORTS_MODAL_STORE)
    private reportsModalStore!: ReportsModalStore;

    private calloutAnchorClassName = `${CN}__go-to-queue`;

    constructor(props: DemandSupplyProps) {
        super(props);

        this.state = {
            isQueueCalloutVisible: false
        };
    }

    componentDidMount() {
        const { match: { params: { queueId } } } = this.props;

        if (queueId) {
            this.demandQueuePerformanceStore.setQueueId(queueId);
            this.demandQueuePerformanceStore.riskScoreDistributionStore.fetchRiskScoreOverview(queueId);
        }

        this.readStorageAutoRefresh();
        this.demandQueuePerformanceStore.loadQueue();
        disposeOnUnmount(this, this.demandQueuePerformanceStore.loadQueueMetrics());
    }

    componentWillUnmount() {
        this.demandQueuePerformanceStore.clearStore();
    }

    /**
     * Initializing table auto refresh toggle, if value has been saved previously to local storage
     * reads that and set to the store, otherwise auto refresh toggle will have value as set in the store
     */
    readStorageAutoRefresh() {
        const isAutoRefreshEnabled = this.demandQueuePerformanceStore.getAutoRefreshToggleValue;

        if (isAutoRefreshEnabled !== null) {
            this.demandQueuePerformanceStore.toggleAutoRefresh(isAutoRefreshEnabled);
        }
    }

    /**
     * CLICK HANDLERS
     */

    @autobind
    handleAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        this.demandQueuePerformanceStore.setAggregationPeriod(label);
    }

    @autobind
    handleNavigationToQueuePage(viewId: string) {
        this.history.push(ROUTES.build.queues(viewId));
    }

    handleLoadMoreQueueItems(viewId: string, viewType: QUEUE_VIEW_TYPE) {
        this.demandQueuePerformanceStore.loadMoreQueueItems(viewId, viewType);
    }

    @autobind
    handleNavigationToReviewConsole(queueViewId: string, item: Item) {
        const isItemLockedByCurrentUser = this.demandQueuePerformanceStore
            .isSelectedItemLockedByCurrentUser(item);

        const pathname = isItemLockedByCurrentUser
            ? ROUTES.build.itemDetailsReviewConsole(queueViewId, item.id)
            : ROUTES.build.itemDetails(queueViewId, item.id);

        this.history.push(pathname);
    }

    @autobind
    handleOnToggleAutoRefresh() {
        const { isAutoRefreshEnabled } = this.demandQueuePerformanceStore;
        this.demandQueuePerformanceStore.toggleAutoRefresh(!isAutoRefreshEnabled);
    }

    @autobind
    handleRefreshClick() {
        this.demandQueuePerformanceStore.refreshQueueAndLockedItems();
    }

    @autobind
    handleGenerateReportsButtonClick() {
        const { reports } = this.demandQueuePerformanceStore;

        this.reportsModalStore.showReportsModal(reports);
    }

    /**
     * RENDERING METHODS
     */

    renderRemainingChart() {
        const { queueSizeHistory, isQueueSizeHistoryLoading } = this.demandQueuePerformanceStore;

        return (
            <div className={`${CN}__chart`}>
                <div className={cx(`${CN}__chart-header`, `${CN}__chart-header-remaining`)}>
                    {this.renderRemainingChartHeaderCells()}
                </div>
                <BlurLoader
                    isLoading={isQueueSizeHistoryLoading}
                    spinnerProps={{
                        label: 'Please, wait! Loading chart data ...'
                    }}
                >
                    <LineChart
                        noDataWarningMessage={WARNING_MESSAGES.METRICS.NO_METRICS_MESSAGE}
                        hasData={!!queueSizeHistory?.getRemainingStatistic.length}
                        maxYTicksValue={queueSizeHistory?.getRemainingStatistic.length ? undefined : 10}
                        margin={{
                            top: 30, bottom: 30, left: 40, right: 20
                        }}
                        chartClassName={`${CN}__remaining-chart`}
                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                        sliceTooltip={(props: SliceTooltipProps) => <SliceTooltip {...props} />}
                        analystChart
                        isLoading={isQueueSizeHistoryLoading}
                        data={queueSizeHistory?.getRemainingStatistic || []}
                        maxTicksValuesCount={MAX_CHART_TICKS_VALUES_COUNT}
                        axisLeft={{
                            tickPadding: 10
                        }}
                        enableArea
                    />
                </BlurLoader>
                <div className={`${CN}__chart-legends`}>
                    {this.renderRemainingChartLegends()}
                </div>
            </div>
        );
    }

    renderItemPlacementChart() {
        const { getItemPlacementMetricsStatistic, isItemsPlacementMetricsLoading } = this.demandQueuePerformanceStore;

        return (
            <div className={`${CN}__chart`}>
                <div className={`${CN}__chart-header`}>
                    {this.renderItemPlacementChartHeaderCells()}
                </div>
                <BlurLoader
                    isLoading={isItemsPlacementMetricsLoading}
                    spinnerProps={{
                        label: 'Please, wait! Loading chart data ...'
                    }}
                >
                    <LineChart
                        noDataWarningMessage={WARNING_MESSAGES.METRICS.NO_METRICS_MESSAGE}
                        hasData={!!getItemPlacementMetricsStatistic?.length}
                        maxYTicksValue={getItemPlacementMetricsStatistic?.length ? undefined : 10}
                        margin={{
                            top: 30, bottom: 30, left: 40, right: 20
                        }}
                        chartClassName={`${CN}__item-placement-chart`}
                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                        sliceTooltip={(props: SliceTooltipProps) => <SliceTooltip {...props} />}
                        analystChart
                        isLoading={isItemsPlacementMetricsLoading}
                        data={getItemPlacementMetricsStatistic}
                        maxTicksValuesCount={MAX_CHART_TICKS_VALUES_COUNT}
                        axisLeft={{
                            tickPadding: 10
                        }}
                    />
                </BlurLoader>
                <div className={`${CN}__chart-legends`}>
                    {this.renderItemPlacementLegends()}
                </div>
            </div>
        );
    }

    renderItemPlacementChartHeaderCells() {
        if (this.demandQueuePerformanceStore.getItemPlacementProgress) {
            const {
                reviewedProgress,
                receivedProgress,
                releasedProgress
            } = this.demandQueuePerformanceStore.getItemPlacementProgress;

            const cells = new Map<string, CurrentProgress>([
                ['Reviewed orders', reviewedProgress],
                ['Released orders', releasedProgress],
                ['New orders', receivedProgress]
            ]);

            return <ProgressCell className={`${CN}__progress`} cellsViewMap={cells} />;
        }

        return <ProgressCell className={`${CN}__progress`} cellsViewMap={new Map([])} />;
    }

    renderRemainingChartHeaderCells() {
        const { queue, hasEscalationQueueView, hasRegularQueueView } = this.demandQueuePerformanceStore;
        const remaining = typeof queue?.size !== 'undefined' ? queue.size : 'N/A';

        const cells = new Map<string, CurrentProgress>([
            ['Remaining orders', { current: remaining, progress: undefined }]
        ]);

        return (
            <>
                {queue ? (<ProgressCell className={`${CN}__progress`} cellsViewMap={cells} />) : <div />}
                <div />
                {(hasEscalationQueueView || hasRegularQueueView) && (
                    <div className={this.calloutAnchorClassName}>
                        {this.renderGoToQueueButton()}
                        {this.renderGoToQueueViewsOptions()}
                    </div>
                )}
            </>
        );
    }

    renderAssigneesList() {
        const { queue, isQueueLoading } = this.demandQueuePerformanceStore;

        const showDivider = queue
            && !!queue.supervisorsFacepilePersonas.length
            && !!queue.reviewersFacepilePersonas.length;

        const shimmer: JSX.Element = (
            <Shimmer
                width="140px"
                shimmerElements={[
                    { type: ShimmerElementType.circle, width: 24, height: 24 },
                    { type: ShimmerElementType.gap, width: 5 },
                    { type: ShimmerElementType.circle, width: 24, height: 24 },
                    { type: ShimmerElementType.gap, width: 5 },
                    { type: ShimmerElementType.circle, width: 24, height: 24 },
                    { type: ShimmerElementType.gap, width: 5 },
                    { type: ShimmerElementType.circle, width: 24, height: 24 },
                    { type: ShimmerElementType.gap, width: 5 },
                    { type: ShimmerElementType.circle, width: 24, height: 24 },
                    { type: ShimmerElementType.gap, width: 5 },
                ]}
            />
        );

        const faces: JSX.Element = (
            <>
                {queue && this.renderFaces(queue.supervisorsFacepilePersonas, MAX_SUPERVISORS_TO_SHOW, true)}
                {showDivider && (<div className={`${CN}__faces-wrapper-divider`} />)}
                {queue && this.renderFaces(queue.reviewersFacepilePersonas, MAX_REVIEWERS_TO_SHOW)}
            </>

        );

        return (
            <div className={`${CN}__faces-wrapper`}>
                {isQueueLoading ? shimmer : faces}
            </div>
        );
    }

    @autobind
    renderFaces(persons: IFacepilePersona[], maxToShow: number, supervisors: boolean = false) {
        return (
            <Facepile
                className={cx(`${CN}__faces`, supervisors && `${CN}__faces--supervisors`)}
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

    renderGoToQueueButton() {
        const { isQueueCalloutVisible } = this.state;
        let isMultiOptional: boolean = false;
        let onClickHandler: () => void = () => {
        };

        if (this.demandQueuePerformanceStore.queue?.views) {
            const { views } = this.demandQueuePerformanceStore.queue;

            if (views.length > 1) {
                isMultiOptional = true;
            }

            if (isMultiOptional) {
                onClickHandler = () => this.setState({
                    isQueueCalloutVisible: !isQueueCalloutVisible
                });
            } else {
                const regularQueueViewId = views[0]?.viewId;
                onClickHandler = () => this.handleNavigationToQueuePage(regularQueueViewId);
            }
        }

        return (
            <DefaultButton
                className={`${CN}__go-to-queue-btn`}
                onClick={onClickHandler}
            >
                <Text>Go to the queue</Text>
                {isMultiOptional && (
                    <FontIcon
                        className={`${CN}__control-btn-down`}
                        iconName="ChevronDownMed"
                    />
                )}
            </DefaultButton>
        );
    }

    renderGoToQueueViewsOptions() {
        const { isQueueCalloutVisible } = this.state;

        const viewTypeMap: { [key in QUEUE_VIEW_TYPE]?: string } = {
            [QUEUE_VIEW_TYPE.REGULAR]: 'Regular queue',
            [QUEUE_VIEW_TYPE.ESCALATION]: 'Escalation queue'
        };

        const sortByViewTypeName = (left: QueueView, right: QueueView) => {
            if (left.viewType < right.viewType) {
                return 1;
            }

            return -1;
        };

        if (this.demandQueuePerformanceStore.queue?.views) {
            const { views } = this.demandQueuePerformanceStore.queue;

            if (views.length === 1) {
                return null;
            }

            return (
                isQueueCalloutVisible && (
                    <Callout
                        onDismiss={() => this.setState({ isQueueCalloutVisible: false })}
                        className={`${CN}__queue-view-options`}
                        target={`.${this.calloutAnchorClassName}`}
                        isBeakVisible={false}
                        directionalHint={DirectionalHint.bottomRightEdge}
                        gapSpace={6}
                    >
                        {views
                            .sort(sortByViewTypeName)
                            .map(view => (
                                <Text
                                    className={`${CN}__queue-view-option`}
                                    onClick={() => this.handleNavigationToQueuePage(view.viewId)}
                                >
                                    {viewTypeMap[view.viewType]}
                                </Text>
                            ))}
                    </Callout>
                )

            );
        }

        return null;
    }

    renderRemainingChartLegends() {
        const legendsMap = new Map<string, string>([
            ['Remaining orders', COLORS.demandSupplyCharts.remaining]
        ]);

        return this.renderLegends(legendsMap);
    }

    renderItemPlacementLegends() {
        const legendsMap = new Map<string, string>([
            ['Reviewed orders', COLORS.demandSupplyCharts.reviewed],
            ['New orders', COLORS.demandSupplyCharts.received],
            ['Released orders', COLORS.demandSupplyCharts.released]
        ]);

        return this.renderLegends(legendsMap);
    }

    renderLegends(legendsMap: Map<string, string>) {
        return Array.from(legendsMap).map(([text, color]) => (
            <div className={`${CN}__legend`} key={text}>
                <div
                    className={`${CN}__legend-color-indicator`}
                    style={{
                        background: color
                    }}
                />
                <span
                    className={`${CN}__legend-text`}
                    style={{
                        color
                    }}
                >
                    {text}
                </span>
            </div>
        ));
    }

    renderLoadMoreBtn(queueItem: QueueItem) {
        const {
            isLoadingMoreItems, canLoadMore, viewId, viewType
        } = queueItem;

        if (!canLoadMore) {
            return null;
        }

        return (
            <button
                type="button"
                className={`${CN}__load_more_orders`}
                onClick={() => this.handleLoadMoreQueueItems(viewId, viewType)}
                disabled={isLoadingMoreItems}
            >
                {
                    isLoadingMoreItems
                        ? <Spinner />
                        : <Text variant="medium">Load more orders</Text>
                }
            </button>
        );
    }

    renderRegularQueueItemsDataTable() {
        const { regularQueueItems: { data, viewId }, hasRegularQueueView } = this.demandQueuePerformanceStore;

        return hasRegularQueueView && (
            <ExpandableGroup
                key="regular-orders"
                title="Regular orders"
                defaultExpanded
            >
                <DataTable
                    <Item>
                    data={data}
                    onClickCallback={item => this.handleNavigationToReviewConsole(viewId, item)}
                />
                {this.renderLoadMoreBtn(this.demandQueuePerformanceStore.regularQueueItems)}
            </ExpandableGroup>
        );
    }

    renderEscalatedQueueItemsDataTable() {
        const { escalatedQueueItem: { data, viewId }, hasEscalationQueueView } = this.demandQueuePerformanceStore;

        return hasEscalationQueueView && (
            <ExpandableGroup
                key="escalated-orders"
                title="Escalated orders"
                defaultExpanded
            >
                <DataTable
                    <Item>
                    data={data}
                    onClickCallback={item => this.handleNavigationToReviewConsole(viewId, item)}
                />
                {this.renderLoadMoreBtn(this.demandQueuePerformanceStore.escalatedQueueItem)}
            </ExpandableGroup>
        );
    }

    renderNoDataMessage() {
        return (
            <div className={cx(`${CN}__realtime-data-header`, `${CN}__realtime-data-header--data-not-available`)}>

                <MessageBar
                    messageBarType={MessageBarType.warning}
                    messageBarIconProps={{ iconName: 'Warning', className: `${CN}__warning-message-icon` }}
                >
                    <div className={cx(`${CN}__real-time-title`, `${CN}__real-time-title--data-not-available`)}>
                        Right now there are no items near to SLA or near to Timeout
                    </div>
                </MessageBar>
            </div>
        );
    }

    renderNoRealTimeDataMessage() {
        return (
            <div className={cx(`${CN}__realtime-data-header`, `${CN}__realtime-data-header--no-data`)}>

                <MessageBar
                    messageBarType={MessageBarType.warning}
                    messageBarIconProps={{ iconName: 'Warning', className: `${CN}__warning-message-icon` }}
                >
                    <div className={cx(`${CN}__real-time-title`, `${CN}__real-time-title--no-data`)}>
                        Real time data is not available for this queue
                    </div>
                </MessageBar>
            </div>
        );
    }

    renderQueueName() {
        const { isQueueLoading } = this.demandQueuePerformanceStore;

        return isQueueLoading
            ? (
                <div className={`${CN}__queue-title-wrap`}>
                    <span className={`${CN}__queue-title`}>Queue:</span>
                    <Shimmer
                        className={`${CN}__queue-title-shimmer`}
                        styles={{
                            shimmerWrapper: {
                                paddingTop: 2,
                                height: 10
                            }
                        }}
                        width="200px"
                    />
                </div>
            )
            : `Queue: ${this.demandQueuePerformanceStore.getQueueName || this.demandQueuePerformanceStore.getQueueId}`;
    }

    renderRealTimeDataSection() {
        const {
            lastQueueItemsUpdated, isQueueItemsLoading, isAutoRefreshEnabled, isQueueItemsDataAvailable
        } = this.demandQueuePerformanceStore;

        return (
            <>
                <div className={`${CN}__realtime-data-header`}>
                    <div className={`${CN}__real-time-title`}>Real time data</div>
                    <div className={`${CN}__controls`}>
                        <div className={`${CN}__action_btns`}>
                            <div>
                                <Text className={`${CN}__meta-title`}>Updated: </Text>
                                <Text className={`${CN}__meta-value`}>{lastQueueItemsUpdated}</Text>
                            </div>
                            <div className={`${CN}__refresh-controls`}>
                                <CommandBarButton
                                    text="Refresh list"
                                    iconProps={{ iconName: 'Refresh' }}
                                    className={`${CN}__action-btn`}
                                    onClick={this.handleRefreshClick}
                                    disabled={isQueueItemsLoading}
                                />
                                <Toggle
                                    label="Auto-refresh (5 min)"
                                    className={`${CN}__action-btn ${CN}__action-btn--auto-refresh`}
                                    checked={isAutoRefreshEnabled}
                                    inlineLabel
                                    onChange={this.handleOnToggleAutoRefresh}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {isQueueItemsDataAvailable && !isQueueItemsLoading && this.renderNoDataMessage()}
                <div>
                    <div className={`${CN}__queue-items-tables`}>
                        {this.renderRegularQueueItemsDataTable()}
                        {this.renderEscalatedQueueItemsDataTable()}
                    </div>
                </div>
            </>
        );
    }

    renderRealtimeSectionShimmerSubstitution() {
        const customGroupOne = () => (
            <ShimmerElementsGroup
                shimmerElements={[
                    { type: ShimmerElementType.line, width: 140, height: 25 },
                    { type: ShimmerElementType.gap, width: 10 },
                    { type: ShimmerElementType.line, width: 200, height: 25 },
                    { type: ShimmerElementType.gap, width: 280, height: 25 },
                    { type: ShimmerElementType.line, width: 100, height: 25 },
                ]}
            />
        );

        return (
            <div className={`${CN}__shimmer-sub`}>
                <Shimmer className={`${CN}__shimmer-custom-group-wrap `} customElementsGroup={customGroupOne()} />
                <Shimmer
                    className={`${CN}__shimmer-custom-group-wrap `}
                    shimmerElements={[
                        { type: ShimmerElementType.line, width: 600, height: 20 },
                        { type: ShimmerElementType.gap, width: 20 },
                    ]}
                />
                <Shimmer
                    className={`${CN}__shimmer-custom-group-wrap `}
                    shimmerElements={[
                        { type: ShimmerElementType.line, width: 700, height: 20 },
                        { type: ShimmerElementType.gap, width: 40 },
                    ]}
                />
            </div>
        );
    }

    renderGenerateReportButton() {
        const { isGenerateReportsButtonDisabled } = this.demandQueuePerformanceStore;

        return (
            <DefaultButton
                disabled={isGenerateReportsButtonDisabled}
                className={`${CN}__generate-reports-button`}
                text="Generate reports"
                onClick={this.handleGenerateReportsButtonClick}
            />
        );
    }

    renderCustomSubHeader() {
        const { aggregation } = this.demandQueuePerformanceStore;
        return (
            <div className={`${CN}__custom-sub-header`}>
                {this.renderAssigneesList()}
                <div className={cx(`${CN}__switch`)}>
                    <span className={`${CN}__switch-title`}>View:</span>
                    <div className={`${CN}__switch-items`}>
                        <SwitchTabs
                            <CHART_AGGREGATION_PERIOD>
                            activeViewTab={aggregation}
                            onViewChange={this.handleAggregationChange}
                            viewMap={CHART_AGGREGATION_PERIOD_DISPLAY}
                        />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const {
            aggregation,
            isQueueLoading,
            isRealtimeDataAvailable,
            riskScoreDistributionStore
        } = this.demandQueuePerformanceStore;

        const realTimeDataSectionToRender: JSX.Element = isRealtimeDataAvailable
            ? this.renderNoRealTimeDataMessage()
            : this.renderRealTimeDataSection();

        return (
            <div className={CN}>
                {this.renderGenerateReportButton()}
                <AggregationHeader
                    <CHART_AGGREGATION_PERIOD>
                    activeTab={aggregation}
                    className={cx(`${CN}__aggregation-header`,)}
                    title={this.renderQueueName()}
                    viewSwitchName="View:"
                    onViewChange={this.handleAggregationChange}
                    viewMap={CHART_AGGREGATION_PERIOD_DISPLAY}
                    withSwitchTabs={false}
                />
                {this.renderCustomSubHeader()}
                <section className={`${CN}__charts`}>
                    {this.renderRemainingChart()}
                    {this.renderItemPlacementChart()}
                </section>
                <section className={`${CN}__wrapper`}>
                    <div className={`${CN}__real-time-data`}>
                        {isQueueLoading
                            ? (this.renderRealtimeSectionShimmerSubstitution())
                            : realTimeDataSectionToRender}
                    </div>
                    <div className={`${CN}__score-distribution-chart-container`}>
                        <ScoreDistribution fraudScoreDistributionStore={riskScoreDistributionStore} />
                    </div>
                </section>

            </div>
        );
    }
}
