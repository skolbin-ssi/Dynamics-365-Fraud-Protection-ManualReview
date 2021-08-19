// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './personal-performance.scss';

import autoBind from 'autobind-decorator';
import { History } from 'history';
import { resolve } from 'inversify-react';
import { disposeOnUnmount, observer } from 'mobx-react';
import queryString from 'query-string';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { ReportsModal } from '../../components/reports-modal';
import { ROUTES } from '../../constants';
import { QueuePerformance } from '../../models/dashboard';
import { TYPES } from '../../types';
import { PerformanceParsedQueryUrl } from '../../utility-services';
import { formatToQueryDateString } from '../../utils/date';
import {
    AnalystPerformanceStore,
    CurrentUserStore,
    DashboardScreenStore,
    QueueOverturnedPerformanceStore,
    ReportsModalStore,
    UpdateQuerySearchReactionParams
} from '../../view-services';
import { PerformanceOverview } from '../dashboard/analyst-performance/performance-overview';
import { TotalReview } from '../dashboard/analyst-performance/total-review';
import { DashboardHeader } from '../dashboard/dashboard-header';
import { EntityHeader } from '../dashboard/entity-header';
import { OverturnedPerformance } from '../dashboard/overturned-performance';

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

        this.dashboardScreenStore.setParsedUrlParams(parsedQuery);
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
    handleGenerateReportsButtonClick() {
        const analystPerformanceReports = this.analystPerformanceStore.reports(true);
        const overturnedPerformanceReports = this.overturnedPerformanceStore.reports(true);

        this.reportsModalStore.showReportsModal([...analystPerformanceReports, ...overturnedPerformanceReports]);
    }

    @autoBind
    updateOverturnedUrlQuerySearchParams(params: UpdateQuerySearchReactionParams) {
        const { ids, rating, aggregation } = this.getUrlParsedQuery();
        const {
            ids: overturnedIds,
            aggregation: overturnedAggregation,
            rating: overturnedRating,
            from,
            to,
        } = params;

        const mergedParams = {
            ids,
            rating,
            aggregation,
            overturnedIds,
            overturnedRating,
            overturnedAggregation,
            from: formatToQueryDateString(from, null),
            to: formatToQueryDateString(to, null),
        };

        const stringifiedUrlParams = queryString.stringify(mergedParams, { arrayFormat: 'comma' });

        this.history.replace(`${ROUTES.PERSONAL_PERFORMANCE}?${stringifiedUrlParams}`);
        this.overturnedPerformanceStore.setUrlSelectedIds(overturnedIds); // sync URL selected ids with store selected overturnedIds
    }

    @autoBind
    updateUrlQuerySearchParams(params: UpdateQuerySearchReactionParams) {
        const { overturnedIds, overturnedRating, overturnedAggregation } = this.getUrlParsedQuery();
        const {
            ids,
            aggregation,
            rating,
            from,
            to,
        } = params;

        const mergedParams = {
            ids,
            rating,
            aggregation,
            overturnedIds,
            overturnedRating,
            overturnedAggregation,
            from: formatToQueryDateString(from, null),
            to: formatToQueryDateString(to, null),
        };

        const stringifiedUrlParams = queryString.stringify(mergedParams, { arrayFormat: 'comma' });

        this.history.replace(`${ROUTES.PERSONAL_PERFORMANCE}?${stringifiedUrlParams}`);
        this.analystPerformanceStore.setUrlSelectedIds(params.ids); // sync URL selected ids with store selected Ids
    }

    renderReportsModal() {
        const { fromDate, toDate } = this.dashboardScreenStore;
        return (
            <ReportsModal fromDate={fromDate} toDate={toDate} />
        );
    }

    render() {
        const { isGenerateButtonsDisabled } = this.analystPerformanceStore;
        const { isDataLoading } = this.overturnedPerformanceStore;

        return (
            <div className={CN}>
                <DashboardHeader
                    user={null}
                    isSearchBarDisplayed
                    dashboardScreenStore={this.dashboardScreenStore}
                />
                <div className={`${CN}__content`}>
                    <EntityHeader
                        isGenerateReportButtonDisabled={isGenerateButtonsDisabled || isDataLoading}
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
