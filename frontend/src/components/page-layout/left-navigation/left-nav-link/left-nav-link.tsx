// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import autoBind from 'autobind-decorator';
import { NavLink } from 'react-router-dom';
import { Text } from '@fluentui/react/lib/Text';
import { FontIcon } from '@fluentui/react/lib/Icon';
import './styles.scss';

export interface LeftNavLinkProps {
    name: string;
    icon: string;
    link: string;
}

@autoBind
export class LeftNavLink extends Component<LeftNavLinkProps, never> {
    render() {
        const { icon, name, link } = this.props;

        return (
            <NavLink
                to={link}
                className="left-nav-link"
                activeClassName="selected"
            >
                <div className="inner-area">
                    <FontIcon iconName={icon} className="link-icon" />
                    <Text>{name}</Text>
                </div>
            </NavLink>
        );
    }
}
