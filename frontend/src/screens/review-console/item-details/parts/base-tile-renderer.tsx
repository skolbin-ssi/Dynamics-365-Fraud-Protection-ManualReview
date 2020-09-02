import cn from 'classnames';
import React, { Component } from 'react';
import { Price } from '../../../../components/price';
import { placeHold, stringToKebabCase } from '../../../../utils/text';
import { ItemDetailsKeyValue } from '../item-details-key-value';

export interface KeyValueItem {
    key: string;
    value: any;
    className?: string;
    contentClassName?: string;
    isPrice?: boolean;
}

export class BaseTileRenderer<T, TT> extends Component<T, TT> {
    protected valuePlaceholder(CN: string) {
        return (
            <span className={`${CN}__pl`}>N/A</span>
        );
    }

    protected renderKeyValueConfig(config: KeyValueItem[], CN: string) {
        return config
            .map(({
                key,
                value,
                className,
                contentClassName,
                isPrice
            }) => {
                let valueToRender = value;

                if (isPrice && value) {
                    valueToRender = (<Price value={value} />);
                }

                return (
                    <ItemDetailsKeyValue
                        className={cn(`${CN}__key-value`, className)}
                        contentClassName={contentClassName}
                        key={stringToKebabCase(key)}
                        label={key}
                        value={placeHold(valueToRender, this.valuePlaceholder(CN))}
                    />
                );
            });
    }
}
