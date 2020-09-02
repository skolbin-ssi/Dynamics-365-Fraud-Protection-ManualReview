import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { Text } from '@fluentui/react/lib/Text';
import autobind from 'autobind-decorator';
import cn from 'classnames';
import React, { Component, ReactNode } from 'react';
import './item-details-tile.scss';
import { QUEUE_LIST_TYPE } from '../../../../constants';

export const CN = 'item-details-tile';

interface Pivot {
    headerText: string;
    itemKey: string;
}

interface ItemDetailsTileProps {
    className?: string;
    headerClassName?: string;
    title: string;
    subtitle?: ReactNode;
    children: ReactNode;
    pivots?: Pivot[];
    selectedPivotKey?: any;
    handlePivotChange?: (itemKey: any) => void;
}

// eslint-disable-next-line react/prefer-stateless-function
export class ItemDetailsTile extends Component<ItemDetailsTileProps, never> {
    @autobind
    handlePivotChange(item?: PivotItem) {
        const { handlePivotChange } = this.props;

        if (item && handlePivotChange) {
            const { itemKey } = item.props;
            handlePivotChange(itemKey as QUEUE_LIST_TYPE);
        }
    }

    @autobind
    renderPivots() {
        const { pivots, title, selectedPivotKey } = this.props;

        if (!pivots || !selectedPivotKey) {
            return null;
        }

        return (
            <Pivot
                className={`${CN}__type-selector`}
                aria-label={`${title} type selector`}
                headersOnly
                selectedKey={selectedPivotKey}
                onLinkClick={this.handlePivotChange}
            >
                { pivots.map(({ headerText, itemKey }, i) => (
                    <PivotItem
                        /* eslint-disable-next-line react/no-array-index-key */
                        key={`${itemKey}--${i}`}
                        headerText={headerText}
                        itemKey={itemKey}
                    />
                ))}
            </Pivot>
        );
    }

    render() {
        const {
            title,
            subtitle,
            children,
            className,
            headerClassName
        } = this.props;

        return (
            <div className={cn(CN, className)}>
                <h3 className={cn(`${CN}__header`, `${headerClassName}__header`)}>
                    <Text variant="large" className={`${CN}__header-title`}>{title}</Text>
                    { subtitle }
                    { this.renderPivots() }
                </h3>
                <div className={cn(`${CN}__content`, `${className}__content`)}>{children}</div>
            </div>
        );
    }
}
