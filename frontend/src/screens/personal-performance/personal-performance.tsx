// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { RouteComponentProps } from 'react-router-dom';
import { disposeOnUnmount, observer } from 'mobx-react';
import autoBind from 'autobind-decorator';
import queryString from 'query-string';

import { DashboardHeader } from '../dashboard/dashboard-header';
import { EntityHeader } from '../dashboard/entity-header';
import { TotalReview } from '../dashboard/analyst-performance/total-review';
import { PerformanceOverview } from '../dashboard/analyst-performance/performance-overview';
import { OverturnedPerformance } from '../dashboard/overturned-performance';

import { TYPES } from '../../types';
import { ROUTES } from '../../constants';
import { ReportsModal } from '../../components/reports-modal';
import { QueuePerformance } from '../../models/dashboard';

import {
    ReportsModalStore,
    CurrentUserStore,
    DashboardScreenStore,
    AnalystPerformanceStore,
    QueueOverturnedPerformanceStore,
    UpdateQuerySearchReactionParams
} from '../../view-services';
import { PerformanceParsedQueryUrl } from '../../utility-services';

import './personal-performance.scss';

export interface PersonalPerformanceComponentProps extends RouteComponentProps {}

const CN = 'personal-performance';

@observer
export class PersonalPerformance extends Component<PersonalPerformanceComponentProps, never> {
    @resolve(TYPES.DASHBOARD_SCREEN_STORE)
    private dashboardScreenStore!: DashboardScreenStore;

    @resolve(TYPES.DASHBOARD_ANALYST_PERFORMANCE_STORE)
    private analystPerformanceStore!: AnalystPerformanceStore;

    @resolve(TYPES.QUEUE_OVERTURNED_PERFORMANCE_STORE)
    private overturnedPerformanceStore!: QueueOverturnedPerformanceStore;

    @resolve(TYPES.CURRENT_USER_STORE)
    private currentUserStore!: CurrentUserStore;

    @resolve(TYPES.REPORTS_MODAL_STORE)
    private reportsModalStore!: ReportsModalStore;

    @resolve(TYPES.HISTORY)
    private history!: History;

    componentDidMount(): void {
        const parsedQuery = this.getUrlParsedQuery();

        const { user } = this.currentUserStore;

        if (user) {
            this.analystPerformanceStore.setAnalyst(user);
            this.analystPerformanceStore.setAnalystId(user.id);
        }

        this.analystPerformanceStore.setParsedUrlParams(parsedQuery);
        this.overturnedPerformanceStore.setParsedUrlParams(parsedQuery);

        disposeOnUnmount(this, this.analystPerformanceStore.loadData());
        disposeOnUnmount(this, this.analystPerformanceStore.updateUrlParams(this.updateUrlQuerySearchParams));

        disposeOnUnmount(this, this.overturnedPerformanceStore.loadData(this.analystPerformanceStore));
        disposeOnUnmount(this, this.overturnedPerformanceStore.updateUrlParams(this.updateOverturnedUrlQuerySearchParams));
    }

    getUrlParsedQuery() {
        const { location: { search } } = this.props;
        return queryString
            .parse(search, { arrayFormat: 'comma' }) as PerformanceParsedQueryUrl;
    }

    @autoBind
    updateOverturnedUrlQuerySearchParams(params: UpdateQuerySearchReactionParams) {
        const { ids, rating, aggregation } = this.getUrlParsedQuery();
        const { ids: overturnedIds, aggregation: overturnedAggregation, rating: overturnedRating } = params;

        const mergerParams = {
            ids, rating, aggregation, overturnedIds, overturnedRating, overturnedAggregation
        };

        const strigifiedUrlParams = queryString.stringify(mergerParams, { arrayFormat: 'comma' });

        this.history.replace(`${ROUTES.PERSONAL_PERFORMANCE}?${strigifiedUrlParams}`);
        this.overturnedPerformanceStore.setUrlSelectedIds(overturnedIds); // sync URL selected ids with store selected overturnedIds
    }

    @autoBind
    updateUrlQuerySearchParams(params: UpdateQuerySearchReactionParams) {
        const { overturnedIds, overturnedRating, overturnedAggregation } = this.getUrlParsedQuery();

        const mergedParams = {
            ...params, overturnedAggregation, overturnedRating, overturnedIds
        };
        const strigifiedUrlParams = queryString.stringify(mergedParams, { arrayFormat: 'comma' });

        this.history.replace(`${ROUTES.PERSONAL_PERFORMANCE}?${strigifiedUrlParams}`);
        this.analystPerformanceStore.setUrlSelectedIds(params.ids); // sync URL selected ids with store selected Ids
    }

    @autoBind
    handleGenerateReportsButtonClick() {
        const { reports: analystPerformanceReports } = this.analystPerformanceStore;
        const { reports: overturnedPerformanceReports } = this.overturnedPerformanceStore;

        this.reportsModalStore.showReportsModal([...analystPerformanceReports, ...overturnedPerformanceReports]);
    }

    renderReportsModal() {
        const { fromDate, toDate } = this.dashboardScreenStore;
        return (
            <ReportsModal fromDate={fromDate} toDate={toDate} />
        );
    }

    render() {
        return (
            <div className={CN}>
                <DashboardHeader
                    isSearchBarDisplayed
                    dashboardScreenStore={this.dashboardScreenStore}
                />
                <div className={`${CN}__content`}>
                    <EntityHeader
                        handleGenerateReportsButtonClick={this.handleGenerateReportsButtonClick}
                        analystPerformanceStore={this.analystPerformanceStore}
                    />
                    <TotalReview analystPerformanceStore={this.analystPerformanceStore} />
                    <PerformanceOverview analystPerformanceStore={this.analystPerformanceStore} />
                    <OverturnedPerformance<QueuePerformance> overturnedPerformanceStore={this.overturnedPerformanceStore} />
                </div>
                <footer className={`${CN}__footer`} />
                {this.renderReportsModal()}
            </div>
        );
    }
}
