// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import autobind from 'autobind-decorator';
import cn from 'classnames';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import JSONFormatter from 'json-formatter-js';
import { Item } from '../../../../../models/item';
import { ItemDetailsTile } from '../../item-details-tile';

const CN = 'item-details-console';

interface ConsoleProps {
    className?: string;
    item: Item
}

@observer
export class Console extends Component<ConsoleProps, never> {
    @autobind
    renderFormatted() {
        const { item } = this.props;

        const formatter = new JSONFormatter(item.purchase.rawPurchase, 4);
        return formatter.render();
    }

    render() {
        const { className } = this.props;

        return (
            <ItemDetailsTile
                className={cn(CN, className)}
                title="Console"
            >
                <div ref={ref => ref?.appendChild(this.renderFormatted())} />
            </ItemDetailsTile>
        );
    }
}
