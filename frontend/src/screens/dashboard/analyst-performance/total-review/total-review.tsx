// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './total-review.scss';

import autoBind from 'autobind-decorator';
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import { SliceTooltipProps } from '@nivo/line';

import {
    CHART_AGGREGATION_PERIOD,
    CHART_AGGREGATION_PERIOD_DISPLAY,
    PERFORMANCE_RATING,
    TOP_QUEUES_DISPLAY_VIEW,
    WARNING_MESSAGES
} from '../../../../constants';
import { AnalystPerformanceStore } from '../../../../view-services';
import { DataGridList } from '../../data-grid-list';
import { LineChart, SliceTooltip } from '../../line-chart';
import { SwitchHeader as AggregationHeader, SwitchHeader } from '../../switch-header';

interface TotalReviewComponentProps {
    analystPerformanceStore: AnalystPerformanceStore
}

const CN = 'total-review';

@observer
export class TotalReview extends Component<TotalReviewComponentProps, never> {
    getLineChartYScaleMaxValue() {
        const { analystPerformanceStore: { lineChartData, maxYTicksValue } } = this.props;
        if (!lineChartData.length) {
            return 10;
        }

        if (maxYTicksValue < 10) {
            return maxYTicksValue;
        }

        return undefined;
    }

    getDataTableHeaderTitle() {
        const { analystPerformanceStore: { rating } } = this.props;
        if (rating === PERFORMANCE_RATING.ALL) {
            return TOP_QUEUES_DISPLAY_VIEW.get(rating)!;
        }

        return `${TOP_QUEUES_DISPLAY_VIEW.get(rating)} queues`;
    }

    @autoBind
    handleQueueAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        const { analystPerformanceStore } = this.props;

        analystPerformanceStore.setAggregation(label);
    }

    @autoBind
    handleQueuePerformanceRatingChange(label: PERFORMANCE_RATING) {
        const { analystPerformanceStore } = this.props;

        const rating = PERFORMANCE_RATING[label]!;
        analystPerformanceStore.setRating(rating);
    }

    @autoBind
    handleSelectionChange(queueId: string) {
        const { analystPerformanceStore } = this.props;

        analystPerformanceStore.setChecked(queueId);
    }

    render() {
        const {
            analystPerformanceStore: {
                aggregation,
                hasStorePerformanceData,
                hasSelectedItems,
                isDataLoading,
                lineChartData,
                rating,
                getPerformanceData
            }
        } = this.props;

        return (
            <section className={`${CN}__total-review-section`}>
                <AggregationHeader
                    <CHART_AGGREGATION_PERIOD>
                    activeTab={aggregation}
                    title="Hit rate"
                    viewSwitchName="View:"
                    onViewChange={this.handleQueueAggregationChange}
                    viewMap={CHART_AGGREGATION_PERIOD_DISPLAY}
                />
                <LineChart
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    sliceTooltip={(props: SliceTooltipProps) => <SliceTooltip {...props} showSummaryRow={false} showPercentage />}
                    hasData={hasStorePerformanceData}
                    hasSelectedItems={hasSelectedItems}
                    noDataWarningMessage={WARNING_MESSAGES.NO_DATA_FOR_SELECTED_PERIOD_MESSAGE}
                    noSelectedItemsWarningMessage={WARNING_MESSAGES.NO_SELECTED_QUEUE_ITEMS}
                    analystChart
                    isLoading={isDataLoading}
                    data={lineChartData}
                    maxYTicksValue={this.getLineChartYScaleMaxValue()}
                    showPercentage
                />
                <div className={`${CN}__total-review-table`}>
                    <SwitchHeader
                        <PERFORMANCE_RATING>
                        className={`${CN}__switch-header`}
                        activeTab={rating}
                        subTitle="Data sorted by number of reviews"
                        title={this.getDataTableHeaderTitle()}
                        onViewChange={this.handleQueuePerformanceRatingChange}
                        viewMap={TOP_QUEUES_DISPLAY_VIEW}
                    />
                    <DataGridList
                        isLoading={isDataLoading}
                        onRowSelection={this.handleSelectionChange}
                        data={getPerformanceData}
                    />
                </div>
            </section>
        );
    }
}
