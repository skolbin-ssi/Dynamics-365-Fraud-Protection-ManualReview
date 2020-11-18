// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.validation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;

public class DateValidator implements ConstraintValidator<ValidDate, String> {

    @Override
    public boolean isValid(final String value, final ConstraintValidatorContext context) {
        try {
            OffsetDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
            return false;
        }
        return true;
    }

}
