// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import autoBind from 'autobind-decorator';
import cx from 'classnames';

import { SwitchTabs } from '../../../components/switch-tabs';

import './switch-header.scss';

const CN = 'switch-header';

interface DataHeaderProps<T> {
    onViewChange: (label: T) => void
    viewMap: Map<string, string>,
    title: string | JSX.Element,
    loadingTitle?: JSX.Element
    subTitle?: string,
    viewSwitchName?: string,
    className?: string
    activeTab?: T
    withSwitchTabs?: boolean
}

@autoBind
export class SwitchHeader<T> extends Component<DataHeaderProps<T>, never> {
    static defaultProps = {
        withSwitchTabs: true
    };

    renderSubTitle() {
        const { subTitle } = this.props;

        return subTitle && (
            <div className={`${CN}__sub-title`}>
                /
                &nbsp;
                {subTitle}
            </div>
        );
    }

    render() {
        const {
            title,
            viewSwitchName,
            viewMap,
            onViewChange,
            className,
            activeTab,
            withSwitchTabs
        } = this.props;

        return (
            <div className={cx(CN, className)}>
                <div className={`${CN}__sub-header`}>
                    <div className={`${CN}__title-wrap`}>
                        <div className={`${CN}__main-title`}>{title}</div>
                        {this.renderSubTitle()}
                    </div>
                    {
                        withSwitchTabs && (
                            <div className={cx(`${CN}__switch`)}>
                                <span className={`${CN}__switch-title`}>{viewSwitchName}</span>
                                <div className={`${CN}__switch-items`}>
                                    <SwitchTabs
                                        <T>
                                        activeViewTab={activeTab}
                                        onViewChange={onViewChange}
                                        viewMap={viewMap}
                                    />
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}
