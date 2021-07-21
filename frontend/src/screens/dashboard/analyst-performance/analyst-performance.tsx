// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './analyst-performance.scss';

import autoBind from 'autobind-decorator';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { disposeOnUnmount, observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import {
    CHART_AGGREGATION_PERIOD,
    PERFORMANCE_RATING,
    ROUTES,
} from '../../../constants';
import { QueuePerformance } from '../../../models/dashboard';
import { TYPES } from '../../../types';
import { readUrlSearchQueryOptions, stringifyIntoUrlQueryString } from '../../../utility-services';
import { formatToQueryDateString } from '../../../utils/date';
import {
    AnalystPerformanceStore,
    QueueOverturnedPerformanceStore,
    ReportsModalStore,
    UpdateQuerySearchReactionParams,
} from '../../../view-services';
import { EntityHeader } from '../entity-header';
import { OverturnedPerformance } from '../overturned-performance';
import { PerformanceOverview } from './performance-overview';
import { TotalReview } from './total-review';

export interface AnalystPerformanceRouterParams {
    analystId: string
}

interface AnalystPerformanceProps extends RouteComponentProps<AnalystPerformanceRouterParams> {
}

@observer
export class AnalystPerformance extends Component<AnalystPerformanceProps, any> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.QUEUE_OVERTURNED_PERFORMANCE_STORE)
    private overturnedPerformanceStore!: QueueOverturnedPerformanceStore;

    @resolve(TYPES.DASHBOARD_ANALYST_PERFORMANCE_STORE)
    private analystPerformanceStore!: AnalystPerformanceStore;

    @resolve(TYPES.REPORTS_MODAL_STORE)
    private reportsModalStore!: ReportsModalStore;

    componentDidMount(): void {
        this.readInitialQuerySearchAndUpdateStores();

        this.analystPerformanceStore.loadAnalyst();

        disposeOnUnmount(this, this.analystPerformanceStore.loadData());
        disposeOnUnmount(this, this.analystPerformanceStore.updateUrlParams(this.updateQueueUrlQuerySearch));

        disposeOnUnmount(this, this.overturnedPerformanceStore.loadData(this.analystPerformanceStore));
        disposeOnUnmount(this, this.overturnedPerformanceStore.updateUrlParams(this.updateOverturnedUrlQuerySearch));
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
            this.overturnedPerformanceStore.clearUrlSelectedIds();
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

    @autoBind
    handleGenerateReportsButtonClick() {
        const analystPerformanceReports = this.analystPerformanceStore.reports();
        const overturnedPerformanceReports = this.overturnedPerformanceStore.reports();

        this.reportsModalStore.showReportsModal([...analystPerformanceReports, ...overturnedPerformanceReports]);
    }

    @autoBind
    updateOverturnedUrlQuerySearch({
        ids, rating, aggregation, from, to,
    }: UpdateQuerySearchReactionParams) {
        const { location: { search } } = this.props;
        const { analystId } = this.analystPerformanceStore;

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

        this.history.replace(`${ROUTES.build.dashboard.analyst(analystId)}?${strigifiedFields}`);

        this.overturnedPerformanceStore.setUrlSelectedIds(ids); // sync URL selected ids with store selected Ids
    }

    @autoBind
    updateQueueUrlQuerySearch({
        ids, rating, aggregation, from, to,
    }: UpdateQuerySearchReactionParams) {
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
            overturnedAggregation: searchPart.aggregation,
            from: formatToQueryDateString(from, null),
            to: formatToQueryDateString(to, null),
        });

        this.history.replace(`${ROUTES.build.dashboard.analyst(analystId)}?${stringifiedFields}`);
        this.analystPerformanceStore.setUrlSelectedIds(ids); // sync URL selected ids with store selected Ids
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
            this.overturnedPerformanceStore.setRating(query.overturnedRating as PERFORMANCE_RATING);
        }

        if (query.overturnedIds) {
            this.overturnedPerformanceStore.setUrlSelectedIds(query.overturnedIds);
        }

        if (query.aggregation) {
            this.analystPerformanceStore.setAggregation(query.aggregation as CHART_AGGREGATION_PERIOD);
        }

        if (query.overturnedAggregation) {
            this.overturnedPerformanceStore.setAggregation(query.overturnedAggregation as CHART_AGGREGATION_PERIOD);
        }
    }

    render() {
        const { isGenerateButtonsDisabled } = this.analystPerformanceStore;
        const { isDataLoading } = this.overturnedPerformanceStore;

        return (
            <>
                <EntityHeader
                    isGenerateReportButtonDisabled={isGenerateButtonsDisabled || isDataLoading}
                    handleGenerateReportsButtonClick={this.handleGenerateReportsButtonClick}
                    analystPerformanceStore={this.analystPerformanceStore}
                />
                <TotalReview analystPerformanceStore={this.analystPerformanceStore} />
                <PerformanceOverview analystPerformanceStore={this.analystPerformanceStore} />
                <OverturnedPerformance<QueuePerformance> overturnedPerformanceStore={this.overturnedPerformanceStore} />
            </>

        );
    }
}
