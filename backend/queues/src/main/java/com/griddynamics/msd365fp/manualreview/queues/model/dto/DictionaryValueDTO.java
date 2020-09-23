// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class DictionaryValueDTO {
    @NotNull
    private String value;
}
