// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IconButton } from '@fluentui/react/lib/Button';
import cn from 'classnames';
import autobind from 'autobind-decorator';
import React, { Component } from 'react';
import './expandable-group.scss';

const CN = 'queues-list-expandable-group';

interface ExpandableGroupProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

interface ExpandableGroupState {
    expanded: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function
export class ExpandableGroup extends Component<ExpandableGroupProps, ExpandableGroupState> {
    constructor(props: ExpandableGroupProps) {
        super(props);

        this.state = {
            expanded: props.defaultExpanded || false
        };
    }

    @autobind
    toggle() {
        const { expanded } = this.state;
        this.setState({ expanded: !expanded });
    }

    render() {
        const { title, children } = this.props;
        const { expanded } = this.state;

        return (
            <div className={CN}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                <div
                    role="button"
                    tabIndex={-1}
                    className={cn(`${CN}__title`, !expanded && `${CN}__title--collapsed`)}
                    onClick={this.toggle}
                >
                    <span>{title}</span>
                    <IconButton
                        iconProps={{
                            iconName: expanded ? 'ChevronDown' : 'ChevronRight'
                        }}
                        onClick={this.toggle}
                    />
                </div>
                <div className={cn(`${CN}__content`, expanded && `${CN}__content--expanded`)}>
                    { children }
                </div>
            </div>
        );
    }
}
