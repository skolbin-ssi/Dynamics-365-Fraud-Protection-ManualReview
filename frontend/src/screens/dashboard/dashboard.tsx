// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import autoBind from 'autobind-decorator';
import { resolve } from 'inversify-react';
import { History } from 'history';
import { observer } from 'mobx-react';
import {
    Redirect, Route, RouteComponentProps, Switch
} from 'react-router-dom';

import { DashboardHeader } from './dashboard-header';
import { DemandSupply } from './demand-supply';
import { DemandSupplyByQueue } from './demand-supply-by-queue';
import { QueuesPerformance } from './queues-performance';
import { QueuePerformance } from './queue-performance';
import { AnalystsPerformance } from './analysts-performance';
import { AnalystPerformance } from './analyst-performance';
import { SwitchTabs } from '../../components/switch-tabs';
import {
    CurrentUserStore,
    DashboardScreenStore,
    QueuePerformanceStore,
} from '../../view-services';
import { readUrlSearchQueryOptions } from '../../utility-services';
import {
    DASHBOARD_MANAGEMENT,
    DASHBOARD_SEGMENTATION,
    DASHBOARD_SEGMENTATION_DISPLAY_VIEW,
    ROUTES,
} from '../../constants';
import { Queue, User } from '../../models';
import { TYPES } from '../../types';
import { ReportsModal } from '../../components/reports-modal';

import './dashboard.scss';

const CN = 'dashboard';

interface DashboardProps extends RouteComponentProps {
}

@observer
export class Dashboard extends Component<DashboardProps, any> {
    @resolve(TYPES.HISTORY)
    private history!: History;

    @resolve(TYPES.DASHBOARD_SCREEN_STORE)
    private dashboardScreenStore!: DashboardScreenStore;

    @resolve(TYPES.QUEUE_PERFORMANCE_STORE)
    private queuePerformanceStore!: QueuePerformanceStore;

    @resolve(TYPES.CURRENT_USER_STORE)
    private userStore!: CurrentUserStore;

    componentDidMount() {
        const { location: { search } } = this.props;
        const query = readUrlSearchQueryOptions(search, { from: true, to: true });

        this.dashboardScreenStore.setParsedUrlParams(query);
    }

    componentDidUpdate(prevProps: DashboardProps) {
        const { location: { pathname } } = this.props;
        const { location: { pathname: prevPathname } } = prevProps;
        const dashboard = document.getElementById('dashboard');

        /**
         * This is the known solution for scrolling to the top of the page after the route change.
         * For more details see https://reactrouter.com/web/guides/scroll-restoration
         * We need it here, since the dashboard div has overflow-y: auto
         */
        if (dashboard && pathname !== prevPathname) {
            dashboard.scrollTo(0, 0);
        }
    }

    @autoBind
    getActiveSegmentationTab() {
        const { match: { path } } = this.props;

        if (path === ROUTES.DASHBOARD_QUEUES_PERFORMANCE) {
            return DASHBOARD_SEGMENTATION.QUEUES;
        }

        if (path === ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE) {
            return DASHBOARD_SEGMENTATION.ANALYSTS;
        }

        return DASHBOARD_SEGMENTATION.DEMAND;
    }

    /**
     * Redirect to the specific Analyst page
     * @param analyst
     */
    @autoBind
    handlePersonSearchSelection(analyst: User) {
        const { match: { params } } = this.props;

        if (params) {
            const { analystId } = params as any;
            if (analystId === analyst.id) {
                return;
            }
        }

        this.history.push(
            `${ROUTES.build.dashboard.analyst(analyst.id)}`
        );
    }

    // TODO: Clear commented code after decision should we keep previous URL params on not
    /**
     * Redirect to the specific Queue page
     * @param queue
     */
    @autoBind
    handleQueueSearchChange(queue: Queue) {
        const { match: { params } } = this.props;

        if (params) {
            const { queueId } = params as any;
            if (queueId === queue.queueId) {
                return;
            }
        }

        this.history.push(
            `${ROUTES.build.dashboard.queue(queue.queueId)}`
        );
    }

    @autoBind
    handleDashboardSegmentationChange(label: DASHBOARD_SEGMENTATION) {
        const { match: { path } } = this.props;

        switch (label) {
            case DASHBOARD_SEGMENTATION.QUEUES:
                if (path !== ROUTES.DASHBOARD_QUEUES_PERFORMANCE) {
                    this.goToPage(ROUTES.DASHBOARD_QUEUES_PERFORMANCE);
                }
                break;
            case DASHBOARD_SEGMENTATION.ANALYSTS:
                if (path !== ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE) {
                    this.goToPage(ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE);
                }
                break;
            case DASHBOARD_SEGMENTATION.DEMAND:
                this.goToPage(ROUTES.DASHBOARD_DEMAND);
                break;
            default:
        }
    }

    isNotMainDashboardPage() {
        const { match: { path } } = this.props;
        return [
            ROUTES.DASHBOARD_QUEUE_PERFORMANCE,
            ROUTES.DASHBOARD_ANALYST_PERFORMANCE,
            ROUTES.DASHBOARD_DEMAND_BY_QUEUE
        ].includes(path);
    }

    goToPage(pagePath: string) {
        this.history.push(pagePath);
    }

    @autoBind
    handleGoBackHeaderClick() {
        const { match: { path } } = this.props;

        switch (path) {
            case ROUTES.DASHBOARD_ANALYST_PERFORMANCE:
                this.goToPage(ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE);
                break;
            case ROUTES.DASHBOARD_QUEUE_PERFORMANCE:
                this.goToPage(ROUTES.DASHBOARD_QUEUES_PERFORMANCE);
                break;
            case ROUTES.DASHBOARD_DEMAND_BY_QUEUE:
                this.goToPage(ROUTES.DASHBOARD_DEMAND);
                break;
            default:
        }
    }

    renderReportsModal() {
        const { fromDate, toDate } = this.dashboardScreenStore;
        return (
            <ReportsModal fromDate={fromDate} toDate={toDate} />
        );
    }

    renderDashboardSegmentationHeader() {
        const { match: { path } } = this.props;
        const CHILD_PAGES = [
            ROUTES.DASHBOARD_QUEUE_PERFORMANCE,
            ROUTES.DASHBOARD_DEMAND_BY_QUEUE,
            ROUTES.DASHBOARD_ANALYST_PERFORMANCE
        ];

        if (CHILD_PAGES.includes(path)) {
            return null;
        }

        const buildViewSwitchSegmentationMapBasedOnUserRole = () => {
            const viewMap = new Map<string, string>();

            if (this.userStore.checkUserCan(DASHBOARD_MANAGEMENT.VIEW_QUEUES_REPORT)) {
                viewMap.set(DASHBOARD_SEGMENTATION.QUEUES,
                    DASHBOARD_SEGMENTATION_DISPLAY_VIEW.get(DASHBOARD_SEGMENTATION.QUEUES)!);
            }

            if (this.userStore.checkUserCan(DASHBOARD_MANAGEMENT.VIEW_ANALYSTS_REPORT)) {
                viewMap.set(DASHBOARD_SEGMENTATION.ANALYSTS,
                    DASHBOARD_SEGMENTATION_DISPLAY_VIEW.get(DASHBOARD_SEGMENTATION.ANALYSTS)!);
            }

            if (this.userStore.checkUserCan(DASHBOARD_MANAGEMENT.VIEW_DEMAND_SUPPLY_REPORT)) {
                viewMap.set(DASHBOARD_SEGMENTATION.DEMAND,
                    DASHBOARD_SEGMENTATION_DISPLAY_VIEW.get(DASHBOARD_SEGMENTATION.DEMAND)!);
            }

            return viewMap;
        };

        return (
            <div className={`${CN}__segmentation-header`}>
                <div className={`${CN}__segmentation-header-title`}>Overview Dashboard</div>
                <SwitchTabs
                    <DASHBOARD_SEGMENTATION>
                    buttonLook
                    activeViewTab={this.getActiveSegmentationTab()}
                    onViewChange={this.handleDashboardSegmentationChange}
                    viewMap={buildViewSwitchSegmentationMapBasedOnUserRole()}
                />
            </div>
        );
    }

    render() {
        const canUserViewAnalystsPerformanceDashboard = this.userStore.checkUserCan(DASHBOARD_MANAGEMENT.VIEW_ANALYSTS_REPORT);
        const canUserViewQueuesPerformanceDashboard = this.userStore.checkUserCan(DASHBOARD_MANAGEMENT.VIEW_QUEUES_REPORT);
        const canUserViewDemandSupplyDashboard = this.userStore.checkUserCan(DASHBOARD_MANAGEMENT.VIEW_DEMAND_SUPPLY_REPORT);

        return (
            <div id="dashboard" className={CN}>
                <DashboardHeader
                    user={this.userStore.user}
                    onGoBackClick={this.handleGoBackHeaderClick}
                    isSearchBarDisplayed={!(canUserViewAnalystsPerformanceDashboard || canUserViewQueuesPerformanceDashboard)}
                    displayBackButton={this.isNotMainDashboardPage()}
                    onQueueSearchChange={this.handleQueueSearchChange}
                    onAnalystSearchChange={this.handlePersonSearchSelection}
                    dashboardScreenStore={this.dashboardScreenStore}
                    renderSearchBar
                />
                {this.renderDashboardSegmentationHeader()}
                <div className={`${CN}__content`}>
                    <Switch>
                        <Route
                            exact
                            path={ROUTES.DASHBOARD_QUEUES_PERFORMANCE}
                            render={(routerProps => (canUserViewQueuesPerformanceDashboard ? (
                                <QueuesPerformance
                                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                                    {...routerProps}
                                />
                            ) : (
                                <Redirect to={ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE} />
                            )))}
                        />
                        <Route
                            path={ROUTES.DASHBOARD_QUEUE_PERFORMANCE}
                            render={routerProps => (canUserViewQueuesPerformanceDashboard ? (
                                <QueuePerformance
                                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                                    {...routerProps}
                                />
                            ) : (
                                <Redirect to={ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE} />
                            ))}
                        />
                        <Route
                            exact
                            path={ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE}
                            render={(routerProps => (canUserViewAnalystsPerformanceDashboard ? (
                                (
                                    <AnalystsPerformance
                                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                                        {...routerProps}
                                    />
                                )
                            ) : <Redirect to={ROUTES.DASHBOARD_ANALYST_PERFORMANCE} />)
                            )}
                        />
                        <Route
                            path={ROUTES.DASHBOARD_ANALYST_PERFORMANCE}
                            render={(routerProps => (canUserViewAnalystsPerformanceDashboard ? (
                                (
                                    <AnalystPerformance
                                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                                        {...routerProps}
                                    />
                                )
                            ) : <Redirect to={ROUTES.DASHBOARD_DEMAND} />)
                            )}
                        />
                        <Route
                            exact
                            path={ROUTES.DASHBOARD_DEMAND}
                            render={(routerProps => canUserViewDemandSupplyDashboard && (
                                <DemandSupply
                                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                                    {...routerProps}
                                />
                            ))}
                        />
                        <Route
                            path={ROUTES.DASHBOARD_DEMAND_BY_QUEUE}
                            render={(routerProps => canUserViewDemandSupplyDashboard && (
                                <DemandSupplyByQueue
                                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                                    {...routerProps}
                                />
                            ))}
                        />
                    </Switch>
                </div>
                <footer className={`${CN}__footer`} />
                {this.renderReportsModal()}
            </div>
        );
    }
}
