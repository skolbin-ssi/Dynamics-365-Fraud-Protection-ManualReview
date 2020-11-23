// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// eslint-disable-next-line max-classes-per-file
import { FILTER_VALIDATOR_TYPES } from '../../constants';
import {
    AtLeastOneValueValidator,
    LowerBoundConstraintValidator,
    MaxExistsValidator,
    MinExistsValidator,
    MinLessThanMaxValidator,
    UpperBoundConstraintValidator
} from './validators';
import { ConditionValidator } from './condition-validator';
import { ConditionConstraints } from './condition-constraints';

export class FilterValidatorFactory {
    createValidator(type: FILTER_VALIDATOR_TYPES, constraints?: ConditionConstraints): ConditionValidator {
        switch (type) {
            case FILTER_VALIDATOR_TYPES.AT_LEAST_ONE_VALUE: {
                return new AtLeastOneValueValidator(type, constraints);
            }

            case FILTER_VALIDATOR_TYPES.MIN_EXISTS: {
                return new MinExistsValidator(type);
            }

            case FILTER_VALIDATOR_TYPES.MAX_EXISTS: {
                return new MaxExistsValidator(type);
            }

            case FILTER_VALIDATOR_TYPES.LOWER_BOUND_CONSTRAINT:
                return new LowerBoundConstraintValidator(type, constraints);

            case FILTER_VALIDATOR_TYPES.UPPER_BOUND_CONSTRAINT:
                return new UpperBoundConstraintValidator(type, constraints);

            case FILTER_VALIDATOR_TYPES.MIN_LESS_THAN_MAX:
                return new MinLessThanMaxValidator(type);

            default: {
                throw new Error('No validators found');
            }
        }
    }
}
