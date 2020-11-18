// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

import { TextField } from '@fluentui/react/lib/TextField';
import { Text } from '@fluentui/react/lib/Text';

import { BETWEEN_CONDITION_FIELD_TYPES, BetweenNumericCondition } from '../../../../models/filter/conditions';

import './range-numeric-condition.scss';

interface BetweenComponentProps {
    condition: BetweenNumericCondition;
}

const CN = 'range-numeric-condition';

@observer
export class RangeNumericCondition extends Component<BetweenComponentProps, never> {
    @autobind
    handleChange(type: BETWEEN_CONDITION_FIELD_TYPES, value: string | undefined) {
        const { condition } = this.props;
        const newValue = value || '';

        if (type === BETWEEN_CONDITION_FIELD_TYPES.MIN) {
            condition.setMinimalValue(newValue);
        }

        if (type === BETWEEN_CONDITION_FIELD_TYPES.MAX) {
            condition.setMaximalValue(newValue);
        }
    }

    @autobind
    handleGetErrorMessage() {
        const { condition } = this.props;

        const inValidResults = condition
            .validate()
            .filter(result => !result.isValid);

        return !inValidResults.length
            ? ''
            : (<div className={`${CN}__hidden-error`} />);
    }

    // TODO: Move to the separate component
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

    renderNumericTextField(type: BETWEEN_CONDITION_FIELD_TYPES, controlledValue: string) {
        return (
            <TextField
                key={type}
                type="number"
                className={`${CN}__text-field`}
                onChange={(e, value) => this.handleChange(type, value)}
                onGetErrorMessage={(() => '')}
                value={controlledValue}
            />
        );
    }

    render() {
        const { condition: { values } } = this.props;
        const [minimalValue, maximalValue] = values;

        return (
            <div className={CN}>
                <div className={`${CN}__fields`}>
                    {this.renderNumericTextField(BETWEEN_CONDITION_FIELD_TYPES.MIN, minimalValue)}
                    <div className={`${CN}__delimiter`}>and</div>
                    {this.renderNumericTextField(BETWEEN_CONDITION_FIELD_TYPES.MAX, maximalValue)}
                </div>
                {this.renderValidatorErrors()}
            </div>

        );
    }
}
