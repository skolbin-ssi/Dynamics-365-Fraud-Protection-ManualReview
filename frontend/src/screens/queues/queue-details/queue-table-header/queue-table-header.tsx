import { observer } from 'mobx-react';
import React, { Component } from 'react';
import cx from 'classnames';
import { Text } from '@fluentui/react/lib/Text';
import { Queue } from '../../../../models';
import './queue-table-header.scss';

export const CN = 'queue-table-header';

export interface QueueTableHeaderProps {
    className?: string;
    queue: Queue;
}

@observer
export class QueueTableHeader extends Component<QueueTableHeaderProps, never> {
    render() {
        const { queue, className } = this.props;

        return (
            <div className={cx(CN, className)}>
                <Text className={`${CN}__number-of-items`}>{`${queue.size} items`}</Text>
            </div>
        );
    }
}
