// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import {
    Redirect, Route, Router, Switch
} from 'react-router-dom';

import { History } from 'history';
import { Container } from 'inversify';
import { Provider } from 'inversify-react';

import { PageLayout, PrivateRoute } from './components';
import {
    ALERTS_MANAGEMENT,
    DASHBOARD_MANAGEMENT,
    ERROR_SCREEN_STATES,
    MANUAL_REVIEW,
    QUEUE_MANAGEMENT,
    USER_INFO_MANAGEMENT,
    ROUTES
} from './constants';
import {
    AlertEdit,
    AlertSettings,
    Dashboard,
    Error,
    Login,
    Queues,
    ReviewConsole,
    PersonalPerformance
} from './screens';
import { QueueTiles } from './screens/queue-tiles/queue-tiles';

interface AppProps {
    container: Container,
    history: History
}

export const ROUTES_LIST = [
    {
        path: ROUTES.LOGIN,
        component: Login
    },
    {
        path: ROUTES.PERSONAL_PERFORMANCE,
        component: PersonalPerformance,
        isPrivate: true,
        accessPermission: USER_INFO_MANAGEMENT.ACCESS
    },
    { // order defined below should be kept
        path: [
            ROUTES.DASHBOARD_QUEUE_PERFORMANCE,
            ROUTES.DASHBOARD_QUEUES_PERFORMANCE,
            ROUTES.DASHBOARD_ANALYST_PERFORMANCE,
            ROUTES.DASHBOARD_ANALYSTS_PERFORMANCE,
            ROUTES.DASHBOARD_DEMAND_BY_QUEUE,
            ROUTES.DASHBOARD_DEMAND
        ],
        component: Dashboard,
        isPrivate: true,
        showLockedOrders: true,
        accessPermission: DASHBOARD_MANAGEMENT.ACCESS
    },
    {
        path: ROUTES.REVIEW_CONSOLE,
        component: ReviewConsole,
        isPrivate: true,
        accessPermission: MANUAL_REVIEW.ACCESS
    },
    {
        path: ROUTES.ITEM_DETAILS_REVIEW_CONSOLE,
        component: ReviewConsole,
        isPrivate: true,
        accessPermission: MANUAL_REVIEW.ACCESS
    },
    {
        path: ROUTES.ITEM_DETAILS,
        component: ReviewConsole,
        isPrivate: true,
        accessPermission: MANUAL_REVIEW.ACCESS
    },
    {
        exact: true,
        path: ROUTES.QUEUES_BY_ID,
        component: Queues,
        isPrivate: true,
        showLockedOrders: true,
        accessPermission: QUEUE_MANAGEMENT.ACCESS
    },
    {
        path: ROUTES.QUEUES,
        component: QueueTiles,
        isPrivate: true,
        showLockedOrders: true,
        accessPermission: QUEUE_MANAGEMENT.ACCESS
    },
    {
        component: AlertEdit,
        exact: true,
        path: [
            ROUTES.ALERT_EDIT,
            ROUTES.ALERT_CREATE,
        ],
        isPrivate: true,
        showLockedOrders: true,
        accessPermission: ALERTS_MANAGEMENT.ACCESS
    },
    {
        exact: true,
        path: ROUTES.ALERT_SETTINGS,
        component: AlertSettings,
        isPrivate: true,
        showLockedOrders: true,
        accessPermission: ALERTS_MANAGEMENT.ACCESS
    }
];

export class App extends React.Component<AppProps, never> {
    // Solution ref: https://github.com/ReactTraining/react-router/issues/3928
    renderRoutes() {
        return (ROUTES_LIST.map(props => {
            const {
                path,
                exact,
                component: RouteComponent,
                isPrivate,
                showLockedOrders
            } = props;

            return (
                <Route
                    key={0}
                    path={path}
                    exact={exact}
                    render={routeProps => (
                        <PageLayout showLockedOrders={showLockedOrders}>
                            {isPrivate
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                ? (<PrivateRoute {...props} {...routeProps} />)
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                : <RouteComponent {...props} {...routeProps} />}
                        </PageLayout>
                    )}
                />
            );
        }));
    }

    render() {
        const { container, history } = this.props;

        return (
            <Provider container={container}>
                <Router history={history}>
                    <Switch>
                        {this.renderRoutes()}
                        <Route exect path={ROUTES.ERROR} component={Error} />
                        <Redirect exact from="/" to={ROUTES.QUEUES} />
                        <Redirect to={ROUTES.build.error(ERROR_SCREEN_STATES.NOT_FOUND)} />
                    </Switch>
                </Router>
            </Provider>
        );
    }
}
