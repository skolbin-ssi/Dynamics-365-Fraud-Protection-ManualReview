import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';
import cn from 'classnames';
import { Text } from '@fluentui/react/lib/Text';
import { QueueUpdateIndicator } from '../queue-update-indicator';
import { Queue } from '../../../../models';
import './styles.scss';

export interface QueuesItemProps {
    queue: Queue;
    onClick: (queue: Queue) => void;
    isSelected: boolean;
    isQueueRefreshing: boolean;
}

const CN = 'queue-item';

@observer
export class QueuesItem extends Component<QueuesItemProps, never> {
    @autobind
    onClick() {
        const { onClick, queue } = this.props;
        onClick(queue);
    }

    render() {
        const { queue, isSelected, isQueueRefreshing } = this.props;
        const { name, size } = queue;
        const sizeToDisplay = size > 1000 ? '> 1000' : size;

        return (
            <button
                type="button"
                className={cn(CN, { selected: isSelected })}
                onClick={this.onClick}
            >
                <div className={`${CN}__first-part`}>
                    { isQueueRefreshing && <QueueUpdateIndicator /> }
                    <Text
                        as="span"
                        variant="medium"
                        className="queue-item-name"
                    >
                        { name }
                    </Text>
                </div>
                <Text
                    variant="medium"
                    className="queue-item-number"
                >
                    { sizeToDisplay }
                </Text>
            </button>
        );
    }
}
