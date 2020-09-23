// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import classNames from 'classnames';
import './item-details-key-value.scss';

export const CN = 'item-details-key-value';

interface ItemDetailsKeyValueProps {
    className?: string;
    contentClassName?: string;
    label: string;
    value: any;
}

// eslint-disable-next-line react/prefer-stateless-function
export class ItemDetailsKeyValue extends Component<ItemDetailsKeyValueProps, never> {
    render() {
        const {
            label,
            value,
            className,
            contentClassName
        } = this.props;

        return (
            <div className={classNames(CN, className)}>
                <span className={classNames(`${CN}__header`, contentClassName && `${contentClassName}__header`)}>{label}</span>
                <div className={classNames(`${CN}__content`, contentClassName && `${contentClassName}__content`)}>{value}</div>
            </div>
        );
    }
}
