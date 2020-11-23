// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';

import { QueueUpdateIndicator } from '../../../../../queues/queues-list/queue-update-indicator';

import { formatToLocaleString } from '../../../../../../utils/date';
import { valuePlaceholder } from '../../key-value-item';
import { AnalysisField as AnalysisFieldModel } from '../../../../../../models/item';
import { ANALYSIS_FIELDS } from '../../../../../../constants/link-analysis';

import './analysis-field.scss';

interface LinkAnalysisComponentProps {
    field: AnalysisFieldModel,
    isLinkAnalysisLoading: boolean;
}

const CN = 'analysis-field';

@observer
export class AnalysisField extends Component<LinkAnalysisComponentProps, never> {
    @autobind
    handleCheckboxChange(checked?: boolean) {
        const { field } = this.props;

        if (typeof checked !== 'undefined') {
            field.setIsChecked(checked);
        }
    }

    formatDisplayValue(field: AnalysisFieldModel) {
        if (field.id === ANALYSIS_FIELDS.CREATION_DATE) {
            return formatToLocaleString(field.value, valuePlaceholder());
        }

        return field.value;
    }

    renderFieldCount(count: number) {
        const { isLinkAnalysisLoading } = this.props;

        if (isLinkAnalysisLoading) {
            return <QueueUpdateIndicator />;
        }

        return count;
    }

    renderTooltip() {
        const { field } = this.props;

        if (field?.tooltipContent) {
            return (
                <TooltipHost
                    content={field.tooltipContent}
                    styles={{
                        root: {
                            display: 'flex',
                            marginLeft: '5px'
                        }
                    }}
                >
                    <FontIcon iconName="Info" />
                </TooltipHost>
            );
        }

        return null;
    }

    render() {
        const { field, isLinkAnalysisLoading } = this.props;

        return (
            <div className={CN}>
                <Checkbox
                    disabled={isLinkAnalysisLoading}
                    onChange={(_, checked) => this.handleCheckboxChange(checked)}
                    checked={field.isChecked}
                />
                <div className={`${CN}__container`}>
                    <div className={`${CN}__name`}>
                        <div>{`${field.displayName}`}</div>
                        (
                        {this.renderFieldCount(field.count)}
                        )
                        {!!field.tooltipContent && this.renderTooltip()}
                    </div>
                    <div className={`${CN}__value`}>
                        {this.formatDisplayValue(field)}
                    </div>
                </div>
            </div>
        );
    }
}
