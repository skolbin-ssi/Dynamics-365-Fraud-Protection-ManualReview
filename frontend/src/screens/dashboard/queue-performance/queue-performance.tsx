// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './queue-performance.scss';

import autoBind from 'autobind-decorator';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { disposeOnUnmount, observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { DefaultButton } from '@fluentui/react/lib/Button';
import { Shimmer } from '@fluentui/react/lib/Shimmer';

import {
    CHART_AGGREGATION_PERIOD,
    CHART_AGGREGATION_PERIOD_DISPLAY,
    PERFORMANCE_RATING,
    ROUTES,
    TOP_ANALYST_DISPLAY_VIEW,
    WARNING_MESSAGES,
} from '../../../constants';
import { TYPES } from '../../../types';
import { readUrlSearchQueryOptions, stringifyIntoUrlQueryString } from '../../../utility-services';
import { formatToQueryDateString } from '../../../utils/date';
import {
    AnalystOverturnedPerformanceStore,
    DashboardScreenStore,
    QueuePerformanceStore,
    ReportsModalStore,
    UpdateQuerySearchReactionParams
} from '../../../view-services';
import { AccuracyDataTable } from '../accuracy-data-table';
import { BarChart } from '../bar-chart';
import { BlurLoader } from '../blur-loader';
import { DataTableCompact } from '../data-table-compact';
import { LineChart } from '../line-chart';
import { SwitchHeader as AggregationHeader, SwitchHeader } from '../switch-header';
import { ScoreDistribution } from './score-distribution';

const CN = 'queue-performance';

interface QueuePerformanceRouterParams {
    queueId: string
}

interface QueuePerformanceProps extends RouteComponentProps<QueuePerformanceRouterParams> {
}

@observer
export class QueuePerformance extends Component<RouteComponentProps<QueuePerformanceRouterParams>, any> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.QUEUE_PERFORMANCE_STORE)
    private queuePerformanceStore!: QueuePerformanceStore;

    @resolve(TYPES.OVERTURNED_PERFORMANCE_STORE)
    private overturnedPerformanceStore!: AnalystOverturnedPerformanceStore;

    @resolve(TYPES.DASHBOARD_SCREEN_STORE)
    private dashboardScreenStore!: DashboardScreenStore;

    @resolve(TYPES.REPORTS_MODAL_STORE)
    private reportsModalStore!: ReportsModalStore;

    componentDidMount(): void {
        this.readInitialQuerySearchAndUpdateStores();

        this.queuePerformanceStore.loadQueue();
        /**
         * disposeOnUnmount - makes sure that the autorun function will be disposed and
         * automatically executed as part of the componentWillUnmount lifecycle event.
         */
        disposeOnUnmount(this, this.queuePerformanceStore.loadData());
        disposeOnUnmount(this, this.queuePerformanceStore.updateUrlParams(this.updateQueueUrlQuerySearch));

        disposeOnUnmount(this, this.overturnedPerformanceStore.loadAnalystData(this.queuePerformanceStore));
        disposeOnUnmount(this, this.overturnedPerformanceStore.updateUrlParams(this.updateOverturnedUrlQuerySearch));
    }

    componentDidUpdate(prevProps: QueuePerformanceProps): void {
        const { match: { params: { queueId: prevQueueId } } } = prevProps;
        const { match: { params: { queueId } } } = this.props;

        /**
         * When specific queue in dashboard header search is selected(clicked),
         * updates current store queue id, in order to trigger store's autoruns
         * and load a new data by specific queue id
         */
        if (prevQueueId !== queueId) {
            this.overturnedPerformanceStore.clearUrlSelectedIds();
            this.queuePerformanceStore.clearQueue();
            this.queuePerformanceStore.setQueueId(queueId);
            this.queuePerformanceStore.loadQueue();
        }
    }

    componentWillUnmount(): void {
        this.queuePerformanceStore.clearPerformanceData();
        this.queuePerformanceStore.clearQueue();
    }

    @autoBind
    handleSelectionChange(queueId: string) {
        this.queuePerformanceStore.setChecked(queueId);
    }

    @autoBind
    handleAccuracySelectionChange(analystId: string) {
        this.overturnedPerformanceStore.setChecked(analystId);
    }

    @autoBind
    handleQueuePerformanceRatingChange(label: PERFORMANCE_RATING) {
        const rating = PERFORMANCE_RATING[label]!;
        this.queuePerformanceStore.setRating(rating);
    }

    @autoBind
    handleOverturnedPerformanceRatingChange(label: PERFORMANCE_RATING) {
        const rating = PERFORMANCE_RATING[label]!;
        this.overturnedPerformanceStore.setRating(rating);
    }

    @autoBind
    handleOverturnedChartAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        this.overturnedPerformanceStore.setAggregation(label);
    }

    @autoBind
    handleQueuePerformanceAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        this.queuePerformanceStore.setAggregation(label);
    }

    @autoBind
    handleGenerateReportsButtonClick() {
        const { reports: queuePerformanceReports } = this.queuePerformanceStore;
        const { reports: overturnedPerformanceReports } = this.overturnedPerformanceStore;

        this.reportsModalStore.showReportsModal([...queuePerformanceReports, ...overturnedPerformanceReports]);
    }

    getLineChartYScaleMaxValue() {
        const { lineChartData } = this.queuePerformanceStore;
        if (!lineChartData.length) {
            return 10;
        }

        return undefined;
    }

    getQueueAnalystDataTableHeaderTitle() {
        const { rating } = this.queuePerformanceStore;
        if (rating === PERFORMANCE_RATING.ALL) {
            return TOP_ANALYST_DISPLAY_VIEW.get(rating)!;
        }

        return `${TOP_ANALYST_DISPLAY_VIEW.get(rating)} analysts`;
    }

    getOverturnedAnalystDataTableHeaderTitle() {
        const { rating } = this.overturnedPerformanceStore;
        if (rating === PERFORMANCE_RATING.ALL) {
            return TOP_ANALYST_DISPLAY_VIEW.get(rating)!;
        }

        return `${TOP_ANALYST_DISPLAY_VIEW.get(rating)} analysts`;
    }

    readInitialQuerySearchAndUpdateStores() {
        const { match: { params: { queueId } }, location: { search } } = this.props;
        this.queuePerformanceStore.setQueueId(queueId);

        const query = readUrlSearchQueryOptions(search, {
            selectedIds: true, rating: true, overturnedRating: true, overturnedIds: true, overturnedAggregation: true, aggregation: true
        });

        if (query.rating) {
            this.queuePerformanceStore.setRating(query.rating as PERFORMANCE_RATING);
        }

        if (query.selectedIds) {
            this.queuePerformanceStore.setUrlSelectedIds(query.selectedIds);
        }

        if (query.overturnedRating) {
            this.overturnedPerformanceStore.setRating(query.overturnedRating as PERFORMANCE_RATING);
        }

        if (query.overturnedIds) {
            this.overturnedPerformanceStore.setUrlSelectedIds(query.overturnedIds);
        }

        if (query.aggregation) {
            this.queuePerformanceStore.setAggregation(query.aggregation as CHART_AGGREGATION_PERIOD);
        }

        if (query.overturnedAggregation) {
            this.overturnedPerformanceStore.setAggregation(query.overturnedAggregation as CHART_AGGREGATION_PERIOD);
        }
    }

    @autoBind
    updateQueueUrlQuerySearch({
        ids, rating, aggregation, from, to,
    }: UpdateQuerySearchReactionParams) {
        const { location: { search } } = this.props;
        const { queueId } = this.queuePerformanceStore;
        const searchPart = readUrlSearchQueryOptions(search,
            {
                overturnedIds: true,
                overturnedRating: true,
                overturnedAggregation: true,
            });

        const stringifiedQuery = stringifyIntoUrlQueryString({
            selectedIds: ids,
            rating,
            aggregation,
            overturnedIds: searchPart.overturnedIds,
            overturnedRating: searchPart.overturnedRating,
            overturnedAggregation: searchPart.aggregation,
            from: formatToQueryDateString(from, null),
            to: formatToQueryDateString(to, null),
        });

        this.history.replace(`${ROUTES.build.dashboard.queue(queueId)}?${stringifiedQuery}`);
        this.queuePerformanceStore.setUrlSelectedIds(ids); // sync URL selected ids with store selected Ids
    }

    @autoBind
    updateOverturnedUrlQuerySearch({
        ids, rating, aggregation, from, to,
    }: UpdateQuerySearchReactionParams) {
        const { location: { search } } = this.props;
        const { queueId } = this.queuePerformanceStore;

        const searchPart = readUrlSearchQueryOptions(search, { selectedIds: true, rating: true, aggregation: true });

        const strigifiedFields = stringifyIntoUrlQueryString({
            selectedIds: searchPart.selectedIds,
            rating: searchPart.rating,
            aggregation: searchPart.aggregation,
            overturnedIds: ids,
            overturnedRating: rating,
            overturnedAggregation: aggregation,
            from: formatToQueryDateString(from, null),
            to: formatToQueryDateString(to, null),
        });

        this.history.replace(`${ROUTES.build.dashboard.queue(queueId)}?${strigifiedFields}`);

        this.overturnedPerformanceStore.setUrlSelectedIds(ids); // sync URL selected ids with store selected Ids
    }

    renderQueueName() {
        const { isQueueLoading, getQueueName } = this.queuePerformanceStore;

        return isQueueLoading
            ? (
                <div className={`${CN}__queue-name-container`}>
                    <span>Queue:</span>
                    <Shimmer
                        className={`${CN}__queue-name-shimmer`}
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
            : `Queue: ${getQueueName}`;
    }

    render() {
        const {
            isDataLoading,
            rating,
            getPerformanceData,
            riskScoreDistributionBarChartData,
            substitutionRiskScoreDistributionBarChartData,
            hasSelectedItems,
            hasStorePerformanceData,
            lineChartData,
            aggregation,
            isRiskScoreDistributionDataLoading,
            isGenerateReportButtonDisabled
        } = this.queuePerformanceStore;

        const {
            rating: overturnedRating,
            getPerformanceData: overturnedPerformanceData,
            hasStorePerformanceData: overturnedHasStorePerformanceData,
            aggregation: overturnedAggregation,
            isDataLoading: isOverturnedDataLoading,
            hasSelectedItems: hasOverturnedSelectedItems,
            barChartData
        } = this.overturnedPerformanceStore;

        return (
            <>
                <div className={`${CN}__header`}>
                    <div className={`${CN}__header-title`}>
                        {this.renderQueueName()}
                    </div>

                    <DefaultButton
                        disabled={isGenerateReportButtonDisabled || isOverturnedDataLoading}
                        text="Generate reports"
                        onClick={this.handleGenerateReportsButtonClick}
                    />
                </div>
                <section className={`${CN}__performance-analyst-section`}>
                    <AggregationHeader
                        <CHART_AGGREGATION_PERIOD>
                        activeTab={aggregation}
                        className={`${CN}__aggregation-header`}
                        title="Total review"
                        viewSwitchName="View:"
                        onViewChange={this.handleQueuePerformanceAggregationChange}
                        viewMap={CHART_AGGREGATION_PERIOD_DISPLAY}
                    />
                    <LineChart
                        hasData={hasStorePerformanceData}
                        hasSelectedItems={hasSelectedItems}
                        noDataWarningMessage={WARNING_MESSAGES.NO_DATA_FOR_SELECTED_PERIOD_MESSAGE}
                        noSelectedItemsWarningMessage={WARNING_MESSAGES.NO_SELECTED_ANALYST_ITEMS}
                        analystChart
                        isLoading={isDataLoading}
                        data={lineChartData}
                        maxYTicksValue={this.getLineChartYScaleMaxValue()}
                    />
                    <section className={`${CN}__decision-section`}>
                        <div className={`${CN}__decision-table`}>
                            <SwitchHeader
                                <PERFORMANCE_RATING>
                                className={`${CN}__switch-header`}
                                activeTab={rating}
                                subTitle="Data sorted by number of reviews"
                                title={this.getQueueAnalystDataTableHeaderTitle()}
                                onViewChange={this.handleQueuePerformanceRatingChange}
                                viewMap={TOP_ANALYST_DISPLAY_VIEW}
                            />
                            <DataTableCompact
                                className={`${CN}__data-table`}
                                isAnalystTable
                                isLoading={isDataLoading}
                                onRowSelection={this.handleSelectionChange}
                                data={getPerformanceData}
                            />
                        </div>
                        <div className={`${CN}__decision-pie-chart`}>
                            <ScoreDistribution
                                isEmpty={!riskScoreDistributionBarChartData.length}
                                data={riskScoreDistributionBarChartData.length
                                    ? riskScoreDistributionBarChartData
                                    : substitutionRiskScoreDistributionBarChartData}
                                isDataLoading={isRiskScoreDistributionDataLoading}
                            />
                        </div>
                    </section>
                </section>
                <section className={`${CN}__overturned-analytics-section`}>
                    <div className={`${CN}__overturned-chart-container`}>
                        <AggregationHeader
                            <CHART_AGGREGATION_PERIOD>
                            activeTab={overturnedAggregation}
                            className={`${CN}__aggregation-header`}
                            title="Overturn chart"
                            subTitle="Good decisions include Watch"
                            viewSwitchName="View:"
                            onViewChange={this.handleOverturnedChartAggregationChange}
                            viewMap={CHART_AGGREGATION_PERIOD_DISPLAY}
                        />
                        <BlurLoader
                            isLoading={isOverturnedDataLoading}
                            spinnerProps={{
                                label: 'Please, wait! Loading chart data ...'
                            }}
                        >
                            <BarChart
                                hasData={overturnedHasStorePerformanceData}
                                hasSelectedItems={hasOverturnedSelectedItems}
                                noDataWarningMessage={WARNING_MESSAGES.NO_DATA_FOR_SELECTED_PERIOD_MESSAGE}
                                noSelectedItemsWarningMessage={WARNING_MESSAGES.NO_SELECTED_ANALYST_ITEMS}
                                className={`${CN}__overturned-chart`}
                                data={barChartData}
                                isDataLoading={isOverturnedDataLoading}
                            />
                        </BlurLoader>
                    </div>
                    <div className={`${CN}__overturned-table`}>
                        <SwitchHeader
                            <PERFORMANCE_RATING>
                            className={`${CN}__switch-header`}
                            activeTab={overturnedRating}
                            subTitle="Data sorted by average overturn rate"
                            title={this.getOverturnedAnalystDataTableHeaderTitle()}
                            onViewChange={this.handleOverturnedPerformanceRatingChange}
                            viewMap={TOP_ANALYST_DISPLAY_VIEW}
                        />
                        <AccuracyDataTable
                            className={`${CN}__data-table`}
                            isAnalystTable
                            isLoading={isOverturnedDataLoading}
                            onRowSelection={this.handleAccuracySelectionChange}
                            data={overturnedPerformanceData}
                        />
                    </div>
                </section>
            </>

        );
    }
}
