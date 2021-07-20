// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { observer } from 'mobx-react';
import React, { Component } from 'react';

import {
    ACCEPTABLE_CONDITIONS_RENDER_GROUPS,
    ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE
} from '../../../constants/settings/filter-field';
import { Condition } from '../../../models/filter/condition';
import {
    BetweenDateCondition,
    BetweenNumericCondition,
    BetweenTextCondition,
    BooleanCondition,
    DateCondition,
    InCondition,
    NumericCondition,
    TextCondition
} from '../../../models/filter/conditions';
import { RangeDateCondition } from './range-date-condition';
import { RangeNumericCondition } from './range-numeric-condition';
import { RangeTextCondition } from './range-text-condition';
import { SimpleDateCondition } from './simple-date-condtion';
import { SimpleTextCondition } from './simple-text-condition';
import { TEXT_CONDITION_TYPE } from './text-condition-type';
import { TextInCondition } from './text-in-condition';
import { ToggleCondition } from './toggle-condition';

interface ConditionFactoryComponentProps {
    condition: Condition
    filterId: string;
}

/**
 * Conditions factory component, renders components based on acceptable condition id.
 *
 * @see ACCEPTABLE_CONDITIONS_RENDER_GROUPS - render groups
 * @see ACCEPTABLE_CONDITIONS - acceptable condition id
 */
@observer
export class ConditionFactoryComponent extends Component<ConditionFactoryComponentProps, never> {
    private static renderRangeTextCondition(condition: Condition) {
        return (
            <RangeTextCondition
                condition={condition as BetweenTextCondition}
            />
        );
    }

    private static renderRangeNumericCondition(condition: Condition) {
        return (
            <RangeNumericCondition
                condition={condition as BetweenNumericCondition}
            />
        );
    }

    private static renderSimpleTextCondition(condition: Condition) {
        return (
            <SimpleTextCondition
                type={TEXT_CONDITION_TYPE.TEXT}
                condition={condition as TextCondition}
            />
        );
    }

    private static renderSimpleNumericCondition(condition: Condition) {
        return (
            <SimpleTextCondition
                type={TEXT_CONDITION_TYPE.NUMERIC}
                condition={condition as NumericCondition}
            />
        );
    }

    private static renderToggleCondition(condition: Condition) {
        return (
            <ToggleCondition
                condition={condition as BooleanCondition}
            />
        );
    }

    private static renderInCondition(condition: Condition, filterId: string) {
        return (
            <TextInCondition
                filterId={filterId}
                condition={condition as InCondition}
            />
        );
    }

    private static renderSimpleDateCondition(condition: Condition) {
        return (
            <SimpleDateCondition
                condition={condition as DateCondition}
            />
        );
    }

    private static renderRangeDateCondition(condition: Condition) {
        return (
            <RangeDateCondition
                condition={condition as BetweenDateCondition}
            />
        );
    }

    render() {
        const { condition, filterId } = this.props;
        const { id } = condition;

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.NUMERIC].includes(id)) {
            return ConditionFactoryComponent.renderSimpleNumericCondition(condition);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.TEXT].includes(id)) {
            return ConditionFactoryComponent.renderSimpleTextCondition(condition);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.DATE].includes(id)) {
            return ConditionFactoryComponent.renderSimpleDateCondition(condition);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.RANGE_NUMERIC].includes(id)) {
            return ConditionFactoryComponent.renderRangeNumericCondition(condition);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.RANGE_TEXT].includes(id)) {
            return ConditionFactoryComponent.renderRangeTextCondition(condition);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.RANGE_DATE].includes(id)) {
            return ConditionFactoryComponent.renderRangeDateCondition(condition);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.IN].includes(id)) {
            return ConditionFactoryComponent.renderInCondition(condition, filterId);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.IS_TRUE].includes(id)) {
            return ConditionFactoryComponent.renderToggleCondition(condition);
        }

        return null;
    }
}
