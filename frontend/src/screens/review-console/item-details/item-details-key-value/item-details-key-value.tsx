// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import autobind from 'autobind-decorator';
import classNames from 'classnames';

import './item-details-key-value.scss';

export const CN = 'item-details-key-value';

interface ItemDetailsKeyValueProps {
    className?: string;
    contentClassName?: string;
    label: string;
    value: any;
    valueToCopy?: string
}

// eslint-disable-next-line react/prefer-stateless-function
export class ItemDetailsKeyValue extends Component<ItemDetailsKeyValueProps, never> {
    @autobind
    onCopyButtonClick() {
        const { valueToCopy, value } = this.props;

        navigator.clipboard.writeText(valueToCopy || value);
    }

    render() {
        const {
            label,
            value,
            className,
            contentClassName,
            valueToCopy,
        } = this.props;

        return (
            <div className={classNames(CN, className)}>
                <span className={classNames(`${CN}__header`, contentClassName && `${contentClassName}__header`)}>{label}</span>
                <div className={classNames(`${CN}__content`, contentClassName && `${contentClassName}__content`)}>
                    {value}
                    {valueToCopy
                    && (
                        <IconButton
                            className={`${CN}__copy-button`}
                            iconProps={{ iconName: 'Copy' }}
                            title="Copy"
                            onClick={this.onCopyButtonClick}
                        />
                    )}
                </div>
            </div>
        );
    }
}
