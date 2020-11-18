// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.analytics.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.griddynamics.msd365fp.manualreview.model.Label;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LabelBucket {

    @NotNull
    private String lowerBound;

    @NotNull
    private Label label;

    @NotNull
    private int count;
}
