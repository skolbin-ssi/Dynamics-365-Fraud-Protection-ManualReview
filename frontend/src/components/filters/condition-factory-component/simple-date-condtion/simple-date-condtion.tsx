// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { Text } from '@fluentui/react/lib/Text';

import { DateCondition } from '../../../../models/filter/conditions';
import './simple-date-condtion.scss';
import { formatDateStringToJSDate } from '../../../../utils/date';

interface SimpleDateConditionComponentProps {
    condition: DateCondition
}
const CN = 'simple-date-condition';

@observer
export class SimpleDateCondition extends Component<SimpleDateConditionComponentProps, never> {
    @autobind
    onSelectDate(date: Date | null | undefined) {
        const { condition } = this.props;

        if (date) {
            condition.setValue(date);
        }
    }

    // TODO: Move to a component
    renderValidatorErrors() {
        const { condition } = this.props;

        const inValidResults = condition
            .validate()
            .filter(result => !result.isValid);

        if (inValidResults.length) {
            return (
                <div className={`${CN}__validation-errors`}>
                    {
                        inValidResults.map(result => (
                            <Text variant="smallPlus" className={`${CN}__validator-error`}>
                                { result.errorMessage }
                            </Text>
                        ))
                    }
                </div>
            );
        }

        return null;
    }

    render() {
        const { condition: { values: [value] } } = this.props;
        const date = value && value.length
            ? formatDateStringToJSDate(value)
            : undefined;

        return (
            <div className={CN}>
                <DatePicker
                    value={date}
                    className={`${CN}__date-picker`}
                    placeholder="Select end date..."
                    ariaLabel="Select end date"
                    onSelectDate={this.onSelectDate}
                />
                {this.renderValidatorErrors()}
            </div>
        );
    }
}
