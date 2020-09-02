import React from 'react';
import cn from 'classnames';

import './create-queue-field.scss';

interface CreateQueueFieldProps {
    children: JSX.Element;
    className?: string;
    title?: string;
    description?: string;
}

const CN = 'create-queue-field';

export const CreateQueueField: React.FunctionComponent<CreateQueueFieldProps> = (props: CreateQueueFieldProps) => {
    const {
        children,
        className,
        title,
        description
    } = props;

    return (
        <div className={cn(CN, className)}>
            { title && <div className={`${CN}__title`}>{ title }</div> }
            { description && <div className={`${CN}__description`}>{ description }</div> }
            { children }
        </div>
    );
};
