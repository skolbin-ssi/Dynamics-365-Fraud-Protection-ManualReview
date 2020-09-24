// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* eslint-disable react/prop-types */

import React from 'react';
import cx from 'classnames';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

import './warnining-chart-message.scss';

interface WarningChartMessageProps {
    message: string
    className?: string;
}

const CN = 'warning-message';

export const WarningChartMessage: React.FC<WarningChartMessageProps> = ({ message, className }) => (
    <div className={`${CN}__wrapper`}>
        <MessageBar
            className={`${cx(`${CN}__message-bar`, className)}`}
            messageBarType={MessageBarType.warning}
            messageBarIconProps={{ iconName: 'Warning', className: `${CN}__warning-message-icon` }}
        >
            {message}
        </MessageBar>
    </div>
);
