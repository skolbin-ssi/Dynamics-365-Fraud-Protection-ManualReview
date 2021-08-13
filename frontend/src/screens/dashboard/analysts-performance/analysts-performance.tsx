// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import '../queue-performance/queue-performance.scss';
import './analysts-performance.scss';

import autoBind from 'autobind-decorator';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { disposeOnUnmount, observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { DefaultButton } from '@fluentui/react/lib/Button';

import {
    CHART_AGGREGATION_PERIOD,
    CHART_AGGREGATION_PERIOD_DISPLAY,
    PERFORMANCE_RATING,
    ROUTES,
    TOP_ANALYST_DISPLAY_VIEW,
    WARNING_MESSAGES,
} from '../../../constants';
import { AnalystPerformance } from '../../../models/dashboard';
import { TYPES } from '../../../types';
import { readUrlSearchQueryOptions, stringifyIntoUrlQueryString } from '../../../utility-services';
import { formatToQueryDateString } from '../../../utils/date';
import { DashboardScreenStore, ReportsModalStore, UpdateQuerySearchReactionParams } from '../../../view-services';
import { AnalystsPerformanceStore } from '../../../view-services/dashboard/analysts-performance-store';
import { BlurLoader } from '../blur-loader';
import { DataGridList } from '../data-grid-list';
import { LineChart } from '../line-chart';
import { SwitchHeader as AggregationHeader, SwitchHeader } from '../switch-header';

const CN = 'queues-performance';

interface QueuePerformanceRouterParams {
    queueId: string
}

interface QueuePerformanceProps extends RouteComponentProps<QueuePerformanceRouterParams> {
}

@observer
export class AnalystsPerformance extends Component<QueuePerformanceProps, any> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.ANALYSTS_PERFORMANCE_STORE)
    private analystsPerformanceStore!: AnalystsPerformanceStore;

    @resolve(TYPES.DASHBOARD_SCREEN_STORE)
    private dashboardScreenStore!: DashboardScreenStore;

    @resolve(TYPES.REPORTS_MODAL_STORE)
    private reportsModalStore!: ReportsModalStore;

    async componentDidMount() {
        const { location: { search } } = this.props;
        const query = readUrlSearchQueryOptions(search, { selectedIds: true, rating: true, aggregation: true });

        if (query.aggregation) {
            this.analystsPerformanceStore.setAggregation(query.aggregation as CHART_AGGREGATION_PERIOD);
        }

        if (query.selectedIds) {
            this.analystsPerformanceStore.setUrlSelectedIds(query.selectedIds);
        }
        if (query.rating) {
            this.analystsPerformanceStore.setRating(query.rating as PERFORMANCE_RATING);
        }

        /**
         * disposeOnUnmount - makes sure that the autorun function will be disposed and
         * automatically executed as part of the componentWillUnmount lifecycle event.
         */
        disposeOnUnmount(this, this.analystsPerformanceStore.loadData());
        disposeOnUnmount(this, this.analystsPerformanceStore.updateUrlParams(this.updateParams));
    }

    componentWillUnmount(): void {
        this.analystsPerformanceStore.clearPerformanceData();
    }

    getDataTableHeader() {
        const { rating } = this.analystsPerformanceStore;
        if (rating === PERFORMANCE_RATING.ALL) {
            return TOP_ANALYST_DISPLAY_VIEW.get(rating)!;
        }

        return `${TOP_ANALYST_DISPLAY_VIEW.get(rating)} analysts`;
    }

    getLineChartYScaleMaxValue() {
        const { lineChartData } = this.analystsPerformanceStore;
        if (!lineChartData.length) {
            return 10;
        }

        return undefined;
    }

    @autoBind
    handleSelectionChange(queueId: string) {
        this.analystsPerformanceStore.setChecked(queueId);
    }

    @autoBind
    handleQueuePerformanceRatingChange(label: PERFORMANCE_RATING) {
        const rating = PERFORMANCE_RATING[label];
        if (rating) {
            this.analystsPerformanceStore.setRating(rating);
        }
    }

    @autoBind
    handleRowClick(analyst: AnalystPerformance) {
        this.history.push(
            ROUTES.build.dashboard.analyst(analyst.id)
        );
    }

    @autoBind
    handleAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        this.analystsPerformanceStore.setAggregation(label);
    }

    @autoBind
    handleGenerateReportsButtonClick() {
        const { reports } = this.analystsPerformanceStore;

        this.reportsModalStore.showReportsModal(reports);
    }

    @autoBind
    updateParams({
        ids, rating, aggregation, from, to,
    }: UpdateQuerySearchReactionParams) {
        const strigifiedFields = stringifyIntoUrlQueryString({
            selectedIds: ids,
            rating,
            aggregation,
            from: formatToQueryDateString(from, null),
            to: formatToQueryDateString(to, null),
        });

        this.history.replace(`${ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE}?${strigifiedFields}`);
        this.analystsPerformanceStore.setUrlSelectedIds(ids); // sync URL selected ids with store selected Ids
    }

    renderGenerateReportButton() {
        const { isDataLoading } = this.analystsPerformanceStore;

        return (
            <DefaultButton
                disabled={isDataLoading}
                className={`${CN}__generate-reports-button`}
                text="Generate reports"
                onClick={this.handleGenerateReportsButtonClick}
            />
        );
    }

    render() {
        const {
            isDataLoading,
            rating,
            getPerformanceData,
            lineChartData,
            hasStorePerformanceData,
            hasSelectedItems,
            aggregation
        } = this.analystsPerformanceStore;

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
                <BlurLoader
                    isLoading={isDataLoading}
                    spinnerProps={{
                        label: 'Please, wait! Loading chart data ...'
                    }}
                >
                    <LineChart
                        isLoading={isDataLoading}
                        hasData={hasStorePerformanceData}
                        hasSelectedItems={hasSelectedItems}
                        noDataWarningMessage={WARNING_MESSAGES.NO_DATA_FOR_SELECTED_PERIOD_MESSAGE}
                        noSelectedItemsWarningMessage={WARNING_MESSAGES.NO_SELECTED_ANALYST_ITEMS}
                        analystChart
                        maxYTicksValue={this.getLineChartYScaleMaxValue()}
                        data={lineChartData}
                    />
                </BlurLoader>
                <section className={`${CN}__decision-section`}>
                    <div className={`${CN}__decision-table`}>
                        <SwitchHeader
                            <PERFORMANCE_RATING>
                            className={`${CN}__switch-header`}
                            activeTab={rating}
                            subTitle="Data sorted by number of reviews"
                            title={this.getDataTableHeader()}
                            onViewChange={this.handleQueuePerformanceRatingChange}
                            viewMap={TOP_ANALYST_DISPLAY_VIEW}
                        />
                        <DataGridList
                            className={`${CN}__data-table`}
                            isAnalystTable
                            isLoading={isDataLoading}
                            onRowClick={this.handleRowClick}
                            onRowSelection={this.handleSelectionChange}
                            data={getPerformanceData}
                        />
                    </div>
                </section>
            </>
        );
    }
}
