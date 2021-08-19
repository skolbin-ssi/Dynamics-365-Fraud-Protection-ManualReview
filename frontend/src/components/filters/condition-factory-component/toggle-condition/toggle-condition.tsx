// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './toggle-condition.scss';

import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import { Toggle } from '@fluentui/react/lib/Toggle';

import { BooleanCondition } from '../../../../models/filter/conditions';
import { ON_OFF_STATE_TEXT } from '../../../../models/filter/factories';

interface ToggleConditionComponentProps {
    condition: BooleanCondition
}
const CN = 'toggle-condition';

@observer
export class ToggleCondition extends Component<ToggleConditionComponentProps, never> {
    constructor(props: ToggleConditionComponentProps) {
        super(props);

        const { condition } = props;
        condition.validate();
    }

    getConvertedValueToBoolean(value: string) {
        return value === 'true';
    }

    @autobind
    handleChange(event: React.MouseEvent<HTMLElement>, checked?: boolean) {
        const { condition } = this.props;

        condition.setValue(checked!);
    }

    render() {
        const { condition: { values } } = this.props;
        const [value] = values;

        const isChecked = this.getConvertedValueToBoolean(value);

        return (
            <div className={CN}>
                <Toggle
                    onText={ON_OFF_STATE_TEXT.ON}
                    offText={ON_OFF_STATE_TEXT.OFF}
                    className={`${CN}__toggle`}
                    checked={isChecked}
                    inlineLabel
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}
