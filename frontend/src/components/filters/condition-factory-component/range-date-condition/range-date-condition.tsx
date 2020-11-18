// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { Text } from '@fluentui/react/lib/Text';
import { BETWEEN_CONDITION_FIELD_TYPES, BetweenDateCondition } from '../../../../models/filter/conditions';

import './range-date-condition.scss';
import { formatDateStringToJSDate } from '../../../../utils/date';

interface RangeDateConditionComponentProps {
    condition: BetweenDateCondition
}

const CN = 'range-date-condition';

@observer
export class RangeDateCondition extends Component<RangeDateConditionComponentProps, never> {
    @autobind
    onSelectDate(type: BETWEEN_CONDITION_FIELD_TYPES, date: Date | null | undefined) {
        const { condition } = this.props;

        if (date) {
            if (type === BETWEEN_CONDITION_FIELD_TYPES.MIN) {
                condition.setMinimalValue(date);
            }

            if (type === BETWEEN_CONDITION_FIELD_TYPES.MAX) {
                condition.setMaximalValue(date);
            }
        }
    }

    convertDateStringValueToJSDate(value: string) {
        return value && value.length
            ? formatDateStringToJSDate(value)
            : undefined;
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

    renderDatePicker(type: BETWEEN_CONDITION_FIELD_TYPES, value?: Date, minDate?: Date, maxDate?: Date) {
        const period = type === BETWEEN_CONDITION_FIELD_TYPES.MIN ? 'start' : 'end';
        return (
            <div className={CN}>
                <DatePicker
                    key={type}
                    value={value}
                    minDate={minDate}
                    maxDate={maxDate}
                    className={`${CN}__date-picker`}
                    placeholder={`Select ${period} date ...`}
                    ariaLabel="Select end date"
                    onSelectDate={date => this.onSelectDate(type, date)}
                />
            </div>
        );
    }

    render() {
        const { condition: { values } } = this.props;
        const [minimalValue, maximalValue] = values;
        const minimalDate = this.convertDateStringValueToJSDate(minimalValue);
        const maximalDate = this.convertDateStringValueToJSDate(maximalValue);

        return (
            <div className={CN}>
                <div className={`${CN}__fields`}>
                    {this.renderDatePicker(
                        BETWEEN_CONDITION_FIELD_TYPES.MIN,
                        minimalDate,
                        undefined,
                        maximalDate || new Date()
                    )}
                    <div className={`${CN}__delimiter`}>and</div>
                    {this.renderDatePicker(
                        BETWEEN_CONDITION_FIELD_TYPES.MAX,
                        maximalDate,
                        minimalDate || new Date()
                    )}
                </div>
                {this.renderValidatorErrors()}
            </div>
        );
    }
}
