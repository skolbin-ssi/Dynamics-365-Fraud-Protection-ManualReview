// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import autoBind from 'autobind-decorator';
import { BaseOverturnedPerformanceStore } from '../../../view-services/dashboard/base-overturned-performance-store';
import { BasicEntityPerformance } from '../../../models/dashboard';
import { SwitchHeader as AggregationHeader, SwitchHeader } from '../switch-header';
import {
    WARNING_MESSAGES,
    PERFORMANCE_RATING,
    TOP_QUEUES_DISPLAY_VIEW,
    CHART_AGGREGATION_PERIOD,
    CHART_AGGREGATION_PERIOD_DISPLAY
} from '../../../constants';
import { BlurLoader } from '../blur-loader';
import { BarChart } from '../bar-chart';
import { AccuracyDataTable } from '../accuracy-data-table';

import './overturned-performance.scss';

interface OverturnedPerformanceComponentProps<T extends BasicEntityPerformance> {
    overturnedPerformanceStore: BaseOverturnedPerformanceStore<T>
}

const CN = 'overturned-performance';

@observer
export class OverturnedPerformance<T extends BasicEntityPerformance> extends Component<OverturnedPerformanceComponentProps<T>, never> {
    getQueuesOverturnedDataTableHeaderTitle() {
        const { overturnedPerformanceStore: { rating } } = this.props;
        if (rating === PERFORMANCE_RATING.ALL) {
            return TOP_QUEUES_DISPLAY_VIEW.get(rating)!;
        }

        return `${TOP_QUEUES_DISPLAY_VIEW.get(rating)} queues`;
    }

    @autoBind
    handleOverturnedChartAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        const { overturnedPerformanceStore } = this.props;
        overturnedPerformanceStore.setAggregation(label);
    }

    @autoBind
    handleOverturnedPerformanceRatingChange(label: PERFORMANCE_RATING) {
        const { overturnedPerformanceStore } = this.props;

        const rating = PERFORMANCE_RATING[label]!;
        overturnedPerformanceStore.setRating(rating);
    }

    @autoBind
    handleAccuracySelectionChange(analystId: string) {
        const { overturnedPerformanceStore } = this.props;

        overturnedPerformanceStore.setChecked(analystId);
    }

    render() {
        const { overturnedPerformanceStore } = this.props;
        const {
            rating,
            aggregation,
            isDataLoading,
            hasStorePerformanceData,
            hasSelectedItems,
            barChartData,
            getPerformanceData
        } = overturnedPerformanceStore;

        return (
            <div>
                <div className={`${CN}__overturned-chart-container`}>
                    <AggregationHeader
                        <CHART_AGGREGATION_PERIOD>
                        activeTab={aggregation}
                        title="Overturn chart"
                        subTitle="Good decisions include Watch"
                        viewSwitchName="View:"
                        onViewChange={this.handleOverturnedChartAggregationChange}
                        viewMap={CHART_AGGREGATION_PERIOD_DISPLAY}
                    />
                    <BlurLoader
                        isLoading={isDataLoading}
                        spinnerProps={{
                            label: 'Please, wait! Loading chart data ...'
                        }}
                    >
                        <BarChart
                            hasData={hasStorePerformanceData}
                            hasSelectedItems={hasSelectedItems}
                            noDataWarningMessage={WARNING_MESSAGES.NO_DATA_FOR_SELECTED_PERIOD_MESSAGE}
                            noSelectedItemsWarningMessage={WARNING_MESSAGES.NO_SELECTED_QUEUE_ITEMS}
                            data={barChartData}
                            isDataLoading={isDataLoading}
                        />
                    </BlurLoader>
                </div>
                <div>
                    <SwitchHeader
                        <PERFORMANCE_RATING>
                        className={`${CN}__switch-header`}
                        activeTab={rating}
                        subTitle="Data sorted by accuracy rate"
                        title={this.getQueuesOverturnedDataTableHeaderTitle()}
                        onViewChange={this.handleOverturnedPerformanceRatingChange}
                        viewMap={TOP_QUEUES_DISPLAY_VIEW}
                    />
                    <AccuracyDataTable
                        isLoading={isDataLoading}
                        onRowSelection={this.handleAccuracySelectionChange}
                        data={getPerformanceData}
                    />
                </div>
            </div>
        );
    }
}
