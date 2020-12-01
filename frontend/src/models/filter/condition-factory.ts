// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// eslint-disable-next-line max-classes-per-file
import {
    ACCEPTABLE_CONDITIONS,
    ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE,
    ACCEPTABLE_CONDITIONS_RENDER_GROUPS,
} from '../../constants';
import { FilterValidatorFactory } from './validator-factory';
import { Condition } from './condition';
import {
    BetweenDateCondition,
    BetweenNumericCondition,
    BetweenTextCondition,
    BooleanCondition,
    DateCondition,
    InCondition,
    NumericCondition,
    TextCondition,
} from './conditions';
import { ConditionConstraints } from './condition-constraints';

export abstract class ConditionsFactory {
    abstract createCondition(condition: ACCEPTABLE_CONDITIONS, constraints?: ConditionConstraints): Condition;
}

export class ConcreteConditionFactory extends ConditionsFactory {
    createCondition(condition: ACCEPTABLE_CONDITIONS, constraints: ConditionConstraints): Condition {
        const validatorsFactory = new FilterValidatorFactory();

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.TEXT].includes(condition)) {
            return new TextCondition(validatorsFactory, condition, constraints);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.NUMERIC].includes(condition)) {
            return new NumericCondition(validatorsFactory, condition, constraints);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.DATE].includes(condition)) {
            return new DateCondition(validatorsFactory, condition, constraints);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.RANGE_TEXT].includes(condition)) {
            return new BetweenTextCondition(validatorsFactory, condition, constraints);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.RANGE_NUMERIC].includes(condition)) {
            return new BetweenNumericCondition(validatorsFactory, condition, constraints);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.RANGE_DATE].includes(condition)) {
            return new BetweenDateCondition(validatorsFactory, condition, constraints);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.IN].includes(condition)) {
            return new InCondition(validatorsFactory, condition, constraints);
        }

        if (ACCEPTABLE_CONDITIONS_RENDER_GROUPS[ACCEPTABLE_CONDITIONS_RENDER_GROUP_TYPE.IS_TRUE].includes(condition)) {
            return new BooleanCondition(validatorsFactory, condition, constraints);
        }

        throw new Error(`No matching condition found for condition: ${condition}`);
    }
}
