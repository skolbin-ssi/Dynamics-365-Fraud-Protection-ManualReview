// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.validation;

import com.griddynamics.msd365fp.manualreview.model.Label;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.Set;

public class LabelSetValidator implements ConstraintValidator<ValidLabelSet, Set<Label>> {

    @Override
    public boolean isValid(final Set<Label> labels, final ConstraintValidatorContext context) {
        if (labels.contains(Label.HOLD) && !labels.contains(Label.ESCALATE)) {
            return false;
        }
        return labels.contains(Label.GOOD) && labels.contains(Label.BAD);
    }

}
