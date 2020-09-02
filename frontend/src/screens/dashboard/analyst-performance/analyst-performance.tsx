import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import autoBind from 'autobind-decorator';
import { resolve } from 'inversify-react';
import { History } from 'history';
import { disposeOnUnmount, observer } from 'mobx-react';
import cx from 'classnames';

import { SliceTooltipProps } from '@nivo/line';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Persona, PersonaSize } from '@fluentui/react/lib/Persona';

import { AccuracyDataTable } from '../accuracy-data-table';
import { SwitchHeader as AggregationHeader, SwitchHeader } from '../switch-header';

import { LineChart, SliceTooltip } from '../line-chart';
import { PieChart } from '../pie-chart';
import { BlurLoader } from '../blur-loader';
import { BarChart } from '../bar-chart';

import ArrowUpGreen from '../../../assets/icon/arrows/arrow-up-top-right-green.svg';
import ArrowUpRed from '../../../assets/icon/arrows/arrow-up-top-right-red.svg';

import { ReportsModalStore, UpdateQuerySearchReactionParams } from '../../../view-services';
import {
    CHART_AGGREGATION_PERIOD,
    CHART_AGGREGATION_PERIOD_DISPLAY,
    PERFORMANCE_RATING,
    ROUTES,
    TOP_QUEUES_DISPLAY_VIEW,
    WARNING_MESSAGES,
} from '../../../constants';
import { TYPES } from '../../../types';
import { DataGridList } from '../data-grid-list';

import './analyst-performance.scss';
import { AnalystPerformanceStore } from '../../../view-services/dashboard/analyst-performance-store';
import { CurrentProgress } from '../../../models/dashboard/progress-performance-metric';
import { QueueOverturnedPerformanceStore } from '../../../view-services/dashboard/queue-overturned-performance-store';
import { readUrlSearchQueryOptions, stringifyIntoUrlQueryString } from '../../../utility-services';

const CN = 'analyst-performance';

interface AnalystPerformanceRouterParams {
    analystId: string
}

interface AnalystPerformanceProps extends RouteComponentProps<AnalystPerformanceRouterParams> {
}

@observer
export class AnalystPerformance extends Component<AnalystPerformanceProps, any> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.QUEUE_OVERTURNED_PERFORMANCE_STORE)
    private queueOverturnedPerformanceStore!: QueueOverturnedPerformanceStore;

    @resolve(TYPES.DASHBOARD_ANALYST_PERFORMANCE_STORE)
    private analystPerformanceStore!: AnalystPerformanceStore;

    @resolve(TYPES.REPORTS_MODAL_STORE)
    private reportsModalStore!: ReportsModalStore;

    componentDidMount(): void {
        this.readInitialQuerySearchAndUpdateStores();

        this.analystPerformanceStore.loadAnalyst();

        disposeOnUnmount(this, this.analystPerformanceStore.loadData());
        disposeOnUnmount(this, this.analystPerformanceStore.updateUrlParams(this.updateQueueUrlQuerySearch));

        disposeOnUnmount(this, this.queueOverturnedPerformanceStore.loadData(this.analystPerformanceStore));
        disposeOnUnmount(this, this.queueOverturnedPerformanceStore.updateUrlParams(this.updateOverturnedUrlQuerySearch));
    }

    componentDidUpdate(prevProps: AnalystPerformanceProps): void {
        const { match: { params: { analystId: prevAnalystId } } } = prevProps;
        const { match: { params: { analystId } } } = this.props;

        /**
         * When specific queue in dashboard header search is selected(clicked),
         * updates current store queue id, in order to trigger store's autoruns
         * and load a new data by specific queue id
         */
        if (prevAnalystId !== analystId) {
            this.queueOverturnedPerformanceStore.clearUrlSelectedIds();
            this.analystPerformanceStore.clearAnalyst();
            this.analystPerformanceStore.setAnalystId(analystId);
            this.analystPerformanceStore.loadAnalyst();
        }
    }

    componentWillUnmount(): void {
        this.analystPerformanceStore.clearAnalystId();
        this.analystPerformanceStore.clearAnalyst();
        this.analystPerformanceStore.clearPerformanceData();
    }

    getLineChartYScaleMaxValue() {
        const { lineChartData, maxYTicksValue } = this.analystPerformanceStore;
        if (!lineChartData.length) {
            return 10;
        }

        if (maxYTicksValue < 10) {
            return maxYTicksValue;
        }

        return undefined;
    }

    getDataTableHeaderTitle() {
        const { rating } = this.analystPerformanceStore;
        if (rating === PERFORMANCE_RATING.ALL) {
            return TOP_QUEUES_DISPLAY_VIEW.get(rating)!;
        }

        return `${TOP_QUEUES_DISPLAY_VIEW.get(rating)} queues`;
    }

    getQueuesOverturnedDataTableHeaderTitle() {
        const { rating } = this.queueOverturnedPerformanceStore;
        if (rating === PERFORMANCE_RATING.ALL) {
            return TOP_QUEUES_DISPLAY_VIEW.get(rating)!;
        }

        return `${TOP_QUEUES_DISPLAY_VIEW.get(rating)} queues`;
    }

    readInitialQuerySearchAndUpdateStores() {
        const { match: { params: { analystId } }, location: { search } } = this.props;

        if (analystId) {
            this.analystPerformanceStore.setAnalystId(analystId);
        }

        const query = readUrlSearchQueryOptions(search, {
            selectedIds: true, rating: true, overturnedRating: true, overturnedIds: true, aggregation: true
        });

        if (query.rating) {
            this.analystPerformanceStore.setRating(query.rating as PERFORMANCE_RATING);
        }

        if (query.selectedIds) {
            this.analystPerformanceStore.setUrlSelectedIds(query.selectedIds);
        }

        if (query.overturnedRating) {
            this.queueOverturnedPerformanceStore.setRating(query.overturnedRating as PERFORMANCE_RATING);
        }

        if (query.overturnedIds) {
            this.queueOverturnedPerformanceStore.setUrlSelectedIds(query.overturnedIds);
        }

        if (query.aggregation) {
            this.analystPerformanceStore.setAggregation(query.aggregation as CHART_AGGREGATION_PERIOD);
        }

        if (query.overturnedAggregation) {
            this.queueOverturnedPerformanceStore.setAggregation(query.overturnedAggregation as CHART_AGGREGATION_PERIOD);
        }
    }

    @autoBind
    updateQueueUrlQuerySearch({ ids, rating, aggregation }: UpdateQuerySearchReactionParams) {
        const { location: { search } } = this.props;
        const { analystId } = this.analystPerformanceStore;
        const searchPart = readUrlSearchQueryOptions(search, {
            overturnedIds: true,
            overturnedRating: true,
            overturnedAggregation: true
        });

        const stringifiedFields = stringifyIntoUrlQueryString({
            selectedIds: ids,
            rating,
            aggregation,
            overturnedIds: searchPart.overturnedIds,
            overturnedRating: searchPart.overturnedRating,
            overturnedAggregation: searchPart.aggregation
        });

        this.history.replace(`${ROUTES.build.dashboard.analyst(analystId)}?${stringifiedFields}`);
        this.analystPerformanceStore.setUrlSelectedIds(ids); // sync URL selected ids with store selected Ids
    }

    @autoBind
    updateOverturnedUrlQuerySearch({ ids, rating, aggregation }: UpdateQuerySearchReactionParams) {
        const { location: { search } } = this.props;
        const { analystId } = this.analystPerformanceStore;

        const searchPart = readUrlSearchQueryOptions(search, { selectedIds: true, rating: true, aggregation: true });

        const strigifiedFields = stringifyIntoUrlQueryString({
            selectedIds: searchPart.selectedIds,
            rating: searchPart.rating,
            aggregation: searchPart.aggregation,
            overturnedIds: ids,
            overturnedRating: rating,
            overturnedAggregation: aggregation
        });

        this.history.replace(`${ROUTES.build.dashboard.analyst(analystId)}?${strigifiedFields}`);

        this.queueOverturnedPerformanceStore.setUrlSelectedIds(ids); // sync URL selected ids with store selected Ids
    }

    @autoBind
    handleSelectionChange(queueId: string) {
        this.analystPerformanceStore.setChecked(queueId);
    }

    @autoBind
    handleAccuracySelectionChange(analystId: string) {
        this.queueOverturnedPerformanceStore.setChecked(analystId);
    }

    @autoBind
    handleQueuePerformanceRatingChange(label: PERFORMANCE_RATING) {
        const rating = PERFORMANCE_RATING[label]!;
        this.analystPerformanceStore.setRating(rating);
    }

    @autoBind
    handleOverturnedPerformanceRatingChange(label: PERFORMANCE_RATING) {
        const rating = PERFORMANCE_RATING[label]!;
        this.queueOverturnedPerformanceStore.setRating(rating);
    }

    @autoBind
    handleOverturnedChartAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        this.queueOverturnedPerformanceStore.setAggregation(label);
    }

    @autoBind
    handleQueueAggregationChange(label: CHART_AGGREGATION_PERIOD) {
        this.analystPerformanceStore.setAggregation(label);
    }

    @autoBind
    handleGenerateReportsButtonClick() {
        const { reports: analystPerformanceReports } = this.analystPerformanceStore;
        const { reports: overturnedPerformanceReports } = this.queueOverturnedPerformanceStore;

        this.reportsModalStore.showReportsModal([...analystPerformanceReports, ...overturnedPerformanceReports]);
    }

    @autoBind
    renderProgressTableCells() {
        const { progressPerformanceMetric, processingTimeMetric } = this.analystPerformanceStore;
        if (progressPerformanceMetric && processingTimeMetric) {
            // TODO: Move string keys to the constant values, and create a mapper related with reports
            const renderMapCells = new Map<string, CurrentProgress>([
                ['Number of decisions', progressPerformanceMetric.reviewedProgress],
                ['Annual number of decisions', progressPerformanceMetric.annualReviewedProgress],
                ['Approved orders', progressPerformanceMetric.approvedProgress],
                ['Annual approved orders', progressPerformanceMetric.annualApprovedProgress],
                ['Watched orders', progressPerformanceMetric.watchedProgress],
                ['Annual watched orders', progressPerformanceMetric.annualWatchedProgress],
                ['Rejected orders', progressPerformanceMetric.rejectedProgress],
                ['Annual rejected orders', progressPerformanceMetric.annualRejectedProgress],
                ['Escalated orders', progressPerformanceMetric.escalatedProgress],
                ['Annual escalated orders', progressPerformanceMetric.annualEscalatedProgress],
                ['Wasted time', processingTimeMetric.waistedTime],
                ['Avg. time to make decision', processingTimeMetric.getTimeToMakeDecision]
            ]);

            const renderArrow = (progress: number) => {
                if (progress === 0) {
                    return null;
                }

                return (
                    <div className={`${CN}__progress-percent-arrow`}>
                        {progress > 0 ? <ArrowUpGreen /> : <ArrowUpRed />}
                    </div>
                );
            };

            return Array.from(renderMapCells).map(([cellTitle, metric]) => (
                <div key={cellTitle} className={`${CN}__decision-cell`}>
                    <div className={`${CN}__progress-item-title`}>{cellTitle}</div>
                    <span className={`${CN}__progress-number`}>
                        <span>{metric.current}</span>
                        {metric.progress !== undefined && (
                            <div className={cx(
                                `${CN}__progress-percents`,
                                { [`${CN}__progress-percents--red`]: metric.progress < 0 },
                                { [`${CN}__progress-percents--green`]: metric.progress > 0 }
                            )}
                            >
                                {renderArrow(metric.progress)}
                                <div>{metric.progress}</div>
                                %
                            </div>
                        )}
                    </span>

                </div>
            ));
        }

        return null;
    }

    renderAnalystPersona() {
        const { analystAsPersona } = this.analystPerformanceStore;

        if (analystAsPersona) {
            const { text, secondaryText, imageUrl } = analystAsPersona;

            return (
                <>
                    <Persona imageUrl={imageUrl} text={text} size={PersonaSize.size32} className={`${CN}__persona`} />
                    <div className={`${CN}__persona-email`}>{secondaryText}</div>
                </>
            );
        }

        return null;
    }

    render() {
        const {
            isDataLoading,
            rating,
            getPerformanceData,
            pieChartData,
            hasSelectedItems,
            hasStorePerformanceData,
            lineChartData,
            aggregation,
            isTotalPerformanceLoading,
        } = this.analystPerformanceStore;

        const {
            rating: overturnedRating,
            getPerformanceData: overturnedPerformanceData,
            hasStorePerformanceData: overturnedHasStorePerformanceData,
            aggregation: overturnedChartAggregation,
            isDataLoading: isOverturnedDataLoading,
            hasSelectedItems: hasOverturnedSelectedItems,
            barChartData
        } = this.queueOverturnedPerformanceStore;

        return (
            <>
                <div className={`${CN}__header`}>
                    <div className={`${CN}__sub-header `}>
                        <span className={`${CN}__header-title`}>Fraud analyst: </span>
                        {this.renderAnalystPersona()}
                    </div>
                    <DefaultButton text="Generate reports" onClick={this.handleGenerateReportsButtonClick} />
                </div>
                <section className={`${CN}__total-review-section`}>
                    <AggregationHeader
                        <CHART_AGGREGATION_PERIOD>
                        activeTab={aggregation}
                        className={`${CN}__aggregation-header`}
                        title="Total review"
                        viewSwitchName="View:"
                        onViewChange={this.handleQueueAggregationChange}
                        viewMap={CHART_AGGREGATION_PERIOD_DISPLAY}
                    />
                    <LineChart
                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                        sliceTooltip={(props: SliceTooltipProps) => <SliceTooltip {...props} showSummaryRow />}
                        hasData={hasStorePerformanceData}
                        hasSelectedItems={hasSelectedItems}
                        noDataWarningMessage={WARNING_MESSAGES.NO_DATA_FOR_SELECTED_PERIOD_MESSAGE}
                        noSelectedItemsWarningMessage={WARNING_MESSAGES.NO_SELECTED_QUEUE_ITEMS}
                        analystChart
                        isLoading={isDataLoading}
                        data={lineChartData}
                        maxYTicksValue={this.getLineChartYScaleMaxValue()}
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
                            className={`${CN}__data-table`}
                            isLoading={isDataLoading}
                            onRowSelection={this.handleSelectionChange}
                            data={getPerformanceData}
                        />
                    </div>
                </section>
                <section className={`${CN}__analyst-overview-section`}>
                    <div className={`${CN}__analyst-overview-section-title`}>Analyst overview</div>
                    <div className={`${CN}__analyst-overview-section-content`}>
                        <div className={`${CN}__analyst-progress-table`}>
                            {this.renderProgressTableCells()}
                        </div>
                        <div className={`${CN}__decision-pie-chart`}>
                            <BlurLoader
                                isLoading={isTotalPerformanceLoading}
                                spinnerProps={{
                                    label: 'Please, wait! Loading chart data ...'
                                }}
                            >
                                <PieChart data={pieChartData} className={`${CN}__pie-chart`} />
                            </BlurLoader>
                        </div>
                    </div>
                </section>
                <section className={`${CN}__overturned-analytics-section`}>
                    <div className={`${CN}__overturned-chart-container`}>
                        <AggregationHeader
                            <CHART_AGGREGATION_PERIOD>
                            activeTab={overturnedChartAggregation}
                            className={`${CN}__aggregation-header`}
                            title="Overturned chart"
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
                                noSelectedItemsWarningMessage={WARNING_MESSAGES.NO_SELECTED_QUEUE_ITEMS}
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
                            subTitle="Data sorted by accuracy rate"
                            title={this.getQueuesOverturnedDataTableHeaderTitle()}
                            onViewChange={this.handleOverturnedPerformanceRatingChange}
                            viewMap={TOP_QUEUES_DISPLAY_VIEW}
                        />
                        <AccuracyDataTable
                            className={`${CN}__data-table`}
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
