package com.griddynamics.msd365fp.manualreview.queues.validation;

import org.springframework.messaging.handler.annotation.Payload;

import javax.validation.Constraint;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
@Retention(RUNTIME)
@Constraint(validatedBy = ItemFilterValidator.class)
public @interface FieldConditionCombination {
    String message() default "Combination of conditions and field is not valid.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
