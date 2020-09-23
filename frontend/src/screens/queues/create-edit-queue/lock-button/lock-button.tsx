// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import cn from 'classnames';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { Text } from '@fluentui/react/lib/Text';
import './lock-button.scss';

interface LockButtonProps {
    className?: string;
    isLocked: boolean;
    onToggle: () => void;
    disabled: boolean;
}

const CN = 'lock-button-component';

/* eslint-disable-next-line react/prefer-stateless-function */
export class LockButton extends Component<LockButtonProps, never> {
    render() {
        const {
            className,
            isLocked,
            onToggle,
            disabled
        } = this.props;
        return (
            <div className={cn(className, `${CN}`)}>
                <button
                    type="button"
                    className={cn(`${CN}-button`, { selected: !isLocked })}
                    onClick={() => isLocked && onToggle()}
                    disabled={disabled}
                >
                    <FontIcon iconName="Unlock" />
                    <Text variant="smallPlus">Unlocked</Text>
                </button>
                <button
                    type="button"
                    className={cn(`${CN}-button`, { selected: isLocked })}
                    onClick={() => !isLocked && onToggle()}
                    disabled={disabled}
                >
                    <FontIcon iconName="Lock" />
                    <Text variant="smallPlus">Locked</Text>
                </button>
            </div>
        );
    }
}
