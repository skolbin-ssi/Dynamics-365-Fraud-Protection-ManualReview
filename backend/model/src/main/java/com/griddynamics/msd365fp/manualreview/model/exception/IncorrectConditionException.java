package com.griddynamics.msd365fp.manualreview.model.exception;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class IncorrectConditionException extends Exception {
    public IncorrectConditionException(final String message) {
        super(message);
    }
}
