import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import autoBind from 'autobind-decorator';
import { resolve } from 'inversify-react';
import { History } from 'history';
import { disposeOnUnmount, observer } from 'mobx-react';

import { DefaultButton } from '@fluentui/react/lib/Button';

import { LineChart } from '../line-chart';
import { DataGridList } from '../data-grid-list';
import { SwitchHeader as AggregationHeader, SwitchHeader } from '../switch-header';

import {
    CHART_AGGREGATION_PERIOD, CHART_AGGREGATION_PERIOD_DISPLAY,
    PERFORMANCE_RATING,
    ROUTES,
    TOP_QUEUES_DISPLAY_VIEW, WARNING_MESSAGES,
} from '../../../constants';
import {
    DashboardScreenStore,
    QueuesPerformanceStore,
    ReportsModalStore,
    UpdateQuerySearchReactionParams
} from '../../../view-services';
import { readUrlSearchQueryOptions, stringifyIntoUrlQueryString } from '../../../utility-services';

import { TYPES } from '../../../types';
import { QueuePerformance } from '../../../models/dashboard';

import './queues-performance.scss';

const CN = 'queues-performance';

interface QueuePerformanceProps extends RouteComponentProps {
}

@observer
export class QueuesPerformance extends Component<QueuePerformanceProps, any> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.QUEUES_PERFORMANCE_STORE)
    private queuesPerformanceStore!: QueuesPerformanceStore;

    @resolve(TYPES.DASHBOARD_SCREEN_STORE)
    private dashboardScreenStore!: DashboardScreenStore;

    @resolve(TYPES.REPORTS_MODAL_STORE)
    private reportsModalStore!: ReportsModalStore;

    componentDidMount(): void {
        const { location: { search } } = this.props;
        const query = readUrlSearchQueryOptions(search, { selectedIds: true, rating: true, aggregation: true });

        if (query.selectedIds) {
            this.queuesPerformanceStore.setUrlSelectedIds(query.selectedIds);
        }

        if (query.rating) {
            this.queuesPerformanceStore.setRating(query.rating as PERFORMANCE_RATING);
        }

        if (query.aggregation) {
            this.queuesPerformanceStore.setAggregation(query.aggregation as CHART_AGGREGATION_PERIOD);
        }

        /**
         * disposeOnUnmount - makes sure that the autorun function will be disposed and
         * automatically executed as part of the componentWillUnmount lifecycle event.
         */
        disposeOnUnmount(this, this.queuesPerformanceStore.loadData());
        disposeOnUnmount(this, this.queuesPerformanceStore.updateUrlParams(this.updateParams));
    }

    componentWillUnmount(): void {
        this.queuesPerformanceStore.clearPerformanceData();
    }

    getLineChartYScaleMaxValue() {
        const { lineChartData } = this.queuesPerformanceStore;
        if (!lineChartData.length) {
            return 10;
        }

        return undefined;
    }

    getDataTableHeader() {
        const { rating } = this.queuesPerformanceStore;
        if (rating === PERFORMANCE_RATING.ALL) {
            return TOP_QUEUES_DISPLAY_VIEW.get(rating)!;
        }

        return `${TOP_QUEUES_DISPLAY_VIEW.get(rating)} queues`;
    }

    @autoBind
    updateParams({ ids, rating, aggregation }: UpdateQuerySearchReactionParams) {
        const strigifiedFields = stringifyIntoUrlQueryString({
            selectedIds: ids,
            rating,
            aggregation
        });

        this.history.replace(`${ROUTES.DASHBOARD_QUEUES_PERFORMANCE}?${strigifiedFields}`);
        this.queuesPerformanceStore.setUrlSelectedIds(ids); // sync URL selected ids with store selected Ids
    }

    @autoBind
    handleSelectionChange(queueId: string) {
        this.queuesPerformanceStore.setChecked(queueId);
    }

    @autoBind
    handleRowClick(queue: QueuePerformance) {
        this.history.push(
            ROUTES.build.dashboard.queue(queue.id)
        );
    }

    @autoBind
    handleQueuePerformanceRatingChange(label: PERFORMANCE_RATING) {
        const rating = PERFORMANCE_RATING[label]!;
        this.queuesPerformanceStore.setRating(rating);
    }

    @autoBind
    handleAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        this.queuesPerformanceStore.setAggregation(label);
    }

    @autoBind
    handleGenerateReportsButtonClick() {
        const { reports } = this.queuesPerformanceStore;

        this.reportsModalStore.showReportsModal(reports);
    }

    renderGenerateReportButton() {
        return (
            <DefaultButton
                className={`${CN}__generate-reports-button`}
                text="Generate reports"
                onClick={this.handleGenerateReportsButtonClick}
            />
        );
    }

    render() {
        const {
            getPerformanceData = [],
            lineChartData,
            isDataLoading,
            hasSelectedItems,
            hasStorePerformanceData,
            aggregation,
            rating
        } = this.queuesPerformanceStore;

        return (
            <>
                {this.renderGenerateReportButton()}
                <AggregationHeader
                    <CHART_AGGREGATION_PERIOD>
                    activeTab={aggregation}
                    className={`${CN}__aggregation-header`}
                    title="Total review"
                    viewSwitchName="View:"
                    onViewChange={this.handleAggregationChange}
                    viewMap={CHART_AGGREGATION_PERIOD_DISPLAY}
                />
                <LineChart
                    hasData={hasStorePerformanceData}
                    hasSelectedItems={hasSelectedItems}
                    noDataWarningMessage={WARNING_MESSAGES.NO_DATA_FOR_SELECTED_PERIOD_MESSAGE}
                    noSelectedItemsWarningMessage={WARNING_MESSAGES.NO_SELECTED_QUEUE_ITEMS}
                    isLoading={isDataLoading}
                    data={lineChartData}
                    maxYTicksValue={this.getLineChartYScaleMaxValue()}
                    enableArea
                />
                <div>
                    <SwitchHeader
                        <PERFORMANCE_RATING>
                        className={`${CN}__switch-header`}
                        activeTab={rating}
                        subTitle="Data sorted by number of reviews"
                        title={this.getDataTableHeader()}
                        onViewChange={this.handleQueuePerformanceRatingChange}
                        viewMap={TOP_QUEUES_DISPLAY_VIEW}
                    />
                    <DataGridList
                        isLoading={isDataLoading}
                        onRowClick={this.handleRowClick}
                        onRowSelection={this.handleSelectionChange}
                        data={getPerformanceData}
                    />
                </div>
            </>

        );
    }
}
