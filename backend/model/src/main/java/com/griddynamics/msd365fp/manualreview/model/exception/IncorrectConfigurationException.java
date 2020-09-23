// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.model.exception;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class IncorrectConfigurationException extends Exception {
    public IncorrectConfigurationException(final String message) {
        super(message);
    }
}
