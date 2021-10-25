// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.model.dto;

import com.griddynamics.msd365fp.manualreview.model.Label;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BatchLabelDTO {
    @NotNull
    private Label label;
    @NotNull
    private Set<String> itemIds;

    private String note;
}
