// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import cn from 'classnames';

import './create-edit-queue-field.scss';
import { IconButton } from '@fluentui/react/lib/Button';

interface CreateEditQueueFieldProps {
    children: JSX.Element;
    className?: string;
    title?: string;
    description?: string;
    showDeleteBtn?: boolean;
    onDeleteClick?: () => void;
}

const CN = 'create-edit-queue-field';

export const CreateEditQueueField: React.FunctionComponent<CreateEditQueueFieldProps> = (props: CreateEditQueueFieldProps) => {
    const {
        children,
        className,
        title,
        description,
        showDeleteBtn = false,
        onDeleteClick = () => null
    } = props;

    return (
        <div className={cn(CN, className)}>
            { title && (
                <div className={`${CN}__top-row`}>
                    { title }
                    { showDeleteBtn && (
                        <IconButton
                            iconProps={{
                                iconName: 'Delete'
                            }}
                            onClick={onDeleteClick}
                        />
                    )}
                </div>
            )}
            { description && <div className={`${CN}__description`}>{ description }</div> }
            { children }
        </div>
    );
};
