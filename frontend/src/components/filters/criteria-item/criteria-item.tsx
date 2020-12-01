// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { Component } from 'react';

import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';

import { Dropdown } from '@fluentui/react/lib/Dropdown';
import './criteria-item.scss';
import { IconButton } from '@fluentui/react/lib/Button';
import { Condition } from '../../../models/filter/condition';
import { ConditionDropdownOption } from '../../../models/filter/selectable-options';
import { ConditionFactoryComponent } from '../condition-factory-component';

interface CriteriaItemComponentProps {
    onConditionDropdownChange(previousConditionId: string, conditionId: string): void;
    onDeleteCondition(conditionId: string): void;
    condition: Condition;
    filterId: string;
    criteriaDropdownOptions: ConditionDropdownOption[];
    isDeleteButtonDisabled: boolean;
}

const CN = 'criteria-item';

@observer
export class CriteriaItem extends Component<CriteriaItemComponentProps, never> {
    @autobind
    handleDeleteCondition() {
        const { condition: { id }, onDeleteCondition } = this.props;

        onDeleteCondition(id);
    }

    @autobind
    handleConditionDropdownChange(option: ConditionDropdownOption | undefined) {
        const { condition, onConditionDropdownChange } = this.props;
        const previousConditionId = condition.id;

        if (option) {
            const { key } = option;
            onConditionDropdownChange(previousConditionId, key as string);
        }
    }

    render() {
        const {
            condition, isDeleteButtonDisabled, filterId, criteriaDropdownOptions
        } = this.props;

        return (
            <div
                key={condition.id}
                className={CN}
            >
                <Dropdown
                    disabled={condition.isDisabled}
                    selectedKey={condition.asDropdownOption.key}
                    onChange={(_, item) => this.handleConditionDropdownChange(item as ConditionDropdownOption)}
                    placeholder="Select a criteria"
                    options={criteriaDropdownOptions}
                    className={`${CN}__criteria-dropdown`}
                />
                <div className={`${CN}__condition`}>
                    <ConditionFactoryComponent
                        condition={condition}
                        filterId={filterId}
                    />
                </div>
                <IconButton
                    disabled={isDeleteButtonDisabled}
                    className={`${CN}__delete-button`}
                    onClick={this.handleDeleteCondition}
                    iconProps={{
                        iconName: 'Delete'
                    }}
                />
            </div>
        );
    }
}
