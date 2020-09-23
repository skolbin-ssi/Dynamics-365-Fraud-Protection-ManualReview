// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.validation;

import com.griddynamics.msd365fp.manualreview.queues.model.ItemFilter;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class ItemFilterValidator implements ConstraintValidator<FieldConditionCombination, ItemFilter> {

    @Override
    public boolean isValid(ItemFilter value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        if (value.getField() == null || value.getCondition() == null) {
            return false;
        }
        context.buildConstraintViolationWithTemplate(
                String.format("Combination of conditions and field is not valid. Valid combinations for field %s are: %s",
                        value.getField(), value.getField().getAcceptedConditions()))
                .addConstraintViolation();
        context.disableDefaultConstraintViolation();
        return value.getField().getAcceptedConditions().contains(value.getCondition());
    }
}
