// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';

import { TextField } from '@fluentui/react/lib/TextField';

import { TEXT_CONDITION_TYPE } from '../text-condition-type';
import { NumericCondition } from '../../../../models/filter/conditions';
import './simple-text-condition.scss';

interface SimpleNumericConditionComponentProps {
    condition: NumericCondition
    type: TEXT_CONDITION_TYPE,
}

const CN = 'simple-numeric-condition';

@observer
export class SimpleTextCondition extends Component<SimpleNumericConditionComponentProps, never> {
    @autobind
    handleOnGetErrorMessage() {
        const { condition } = this.props;

        let message = '';

        const validationResult = condition
            .validate()
            .find(result => !result.isValid);

        if (validationResult) {
            if (validationResult.errorMessage) {
                message = validationResult.errorMessage;
            }
        }
        return message;
    }

    @autobind
    handleSimpleFilterChange(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) {
        const { condition } = this.props;

        condition.setValue(newValue || '');
    }

    render() {
        const { condition: { values: [value] }, type } = this.props;

        return (
            <div className={CN}>
                <TextField
                    type={type === TEXT_CONDITION_TYPE.TEXT ? 'text' : 'number'}
                    value={value}
                    onGetErrorMessage={this.handleOnGetErrorMessage}
                    onChange={this.handleSimpleFilterChange}
                />
            </div>

        );
    }
}
