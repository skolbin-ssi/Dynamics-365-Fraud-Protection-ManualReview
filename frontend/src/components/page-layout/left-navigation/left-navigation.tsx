// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './left-navigation.scss';

import autoBind from 'autobind-decorator';
import cn from 'classnames';
import React, { Component } from 'react';

import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';

import {
    ALERTS_MANAGEMENT,
    DASHBOARD_MANAGEMENT,
    PERMISSION,
    QUEUE_MANAGEMENT,
    ROUTES,
    SEARCH_MANAGEMENT,
    USER_INFO_MANAGEMENT,
} from '../../../constants';
import { CurrentUserStore } from '../../../view-services';
import { LeftNavLink, LeftNavLinkProps } from './left-nav-link';

export interface LeftNavigationProps {
    isExpanded: boolean;
    onToggleExpanded: (isExpanded: boolean) => void;
    userStore: CurrentUserStore
}

export interface LeftNavigationItemConfig extends LeftNavLinkProps {
    permission: PERMISSION
}

export const CN = 'left-navigation';

@autoBind
export class LeftNavigation extends Component<LeftNavigationProps, never> {
    private topNavLinks: LeftNavigationItemConfig[] = [
        {
            name: 'My performance',
            link: ROUTES.PERSONAL_PERFORMANCE,
            icon: 'UserGauge',
            permission: USER_INFO_MANAGEMENT.ACCESS
        },
        {
            name: 'Dashboard',
            link: ROUTES.DASHBOARD_QUEUES_PERFORMANCE,
            icon: 'SpeedHigh',
            permission: DASHBOARD_MANAGEMENT.ACCESS
        },
        {
            name: 'Queues',
            link: ROUTES.build.queues(),
            icon: 'BuildQueue',
            permission: QUEUE_MANAGEMENT.ACCESS
        },
        {
            name: 'Search',
            link: ROUTES.SEARCH_NEW,
            icon: 'Search',
            permission: SEARCH_MANAGEMENT.ACCESS
        },
        {
            name: 'Alerts',
            link: ROUTES.ALERT_SETTINGS,
            icon: 'AlertSettings',
            permission: ALERTS_MANAGEMENT.ACCESS
        },
    ];

    toggleIsExpanded() {
        const { isExpanded, onToggleExpanded } = this.props;
        onToggleExpanded(!isExpanded);
    }

    @autoBind
    renderLinks(links: LeftNavigationItemConfig[]) {
        const { userStore } = this.props;

        return links
            .filter(({ permission }) => userStore.checkUserCan(permission))
            .map(navLink => {
                const { name, link, icon } = navLink;
                return (
                    <LeftNavLink
                        name={name}
                        link={link}
                        icon={icon}
                        key={`left-nav-link-${name}`}
                    />
                );
            });
    }

    render() {
        const { isExpanded } = this.props;

        return (
            <Stack
                as="aside"
                verticalFill
                className={cn(CN, { [`${CN}-expanded`]: isExpanded })}
            >
                <IconButton
                    iconProps={{
                        iconName: 'GlobalNavButton',
                        styles: {}
                    }}
                    className={`${CN}__expand-button`}
                    onClick={this.toggleIsExpanded}
                />
                {this.renderLinks(this.topNavLinks)}
            </Stack>
        );
    }
}
