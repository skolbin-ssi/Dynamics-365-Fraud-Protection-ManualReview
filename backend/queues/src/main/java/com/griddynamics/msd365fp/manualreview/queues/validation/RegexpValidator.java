// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.validation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.regex.PatternSyntaxException;

public class RegexpValidator implements ConstraintValidator<ValidRegexp, String> {

    @Override
    public boolean isValid(final String value, final ConstraintValidatorContext context) {
        try {
            java.util.regex.Pattern.compile(value);
        } catch (PatternSyntaxException ignored) {
            return true;
        }
        return false;
    }

}
